import { formatCurrencyFromPrefs } from '../utils/formatCurrency';
import userContextService from './userContextService';
import { supabase } from '../lib/supabase';

class AIService {
  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.openaiBaseUrl = 'https://api.openai.com/v1';
    this.geminiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.openrouterBaseUrl = import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    this.openrouterApiKeys = (import.meta.env.VITE_OPENROUTER_API_KEYS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const defaultOpenRouterModels = [
      'nousresearch/deephermes-3-llama-3-8b-preview:free',
      'deepseek/deepseek-v3.1:free',
      // Add other models...
    ];

    this.openrouterModels = (import.meta.env.VITE_OPENROUTER_MODELS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (this.openrouterModels.length === 0) {
      this.openrouterModels = defaultOpenRouterModels;
    }
  }

  // OpenAI GPT Integration
  async generateOpenAIResponse(prompt, userContext = {}, history = []) {
    try {
      this._devLog('openai.request', { hasKey: Boolean(this.openaiApiKey) });
      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: this.getSystemPrompt(userContext) },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        this._devLog('openai.http_error', { status: response.status });
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      this._devLog('openai.success', {});
      return { success: true, content: data.choices[0].message.content, provider: 'openai' };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      this._devLog('openai.error', { message: error?.message });
      return { success: false, error: error.message, provider: 'openai' };
    }
  }

  // Gemini AI Integration
  async generateGeminiResponse(prompt, userContext = {}, history = []) {
    try {
      this._devLog('gemini.request', { hasKey: Boolean(this.geminiApiKey) });
      const response = await fetch(`${this.geminiBaseUrl}/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${this.getSystemPrompt(userContext)}\n\nUser Query: ${prompt}` }] }],
          generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1000 }
        })
      });

      if (!response.ok) {
        this._devLog('gemini.http_error', { status: response.status });
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      this._devLog('gemini.success', {});
      return { success: true, content: data.candidates[0].content.parts[0].text, provider: 'gemini' };
    } catch (error) {
      console.error('Gemini API Error:', error);
      this._devLog('gemini.error', { message: error?.message });
      return { success: false, error: error.message, provider: 'gemini' };
    }
  }

  // Fetch fresh user data and generate AI response
  async generateFinancialAdvice(userMessage, userContext = {}, history = []) {
    try {
      // If userContext is empty, attempt to get fresh data from the database
      const looksEmpty = !userContext || (
        typeof userContext === 'object' &&
        [
          userContext.totalBalance,
          userContext.monthlyIncome,
          userContext.monthlyExpenses,
          userContext.budgets,
          userContext.recentTransactions
        ].every((v) => v === undefined)
      );
      
      let maybeUserId = userContext?.userProfile?.id || userContext?.userId || null;

      if (!maybeUserId && supabase?.auth?.getUser) {
        const { data } = await supabase.auth.getUser();
        maybeUserId = data?.user?.id || null;
      }

      if (looksEmpty && maybeUserId) {
        const fresh = await this.getUserFinancialContext(maybeUserId);
        userContext = { ...fresh, userId: maybeUserId };
      }
    } catch (e) {
      this._devLog('ai.context_refresh_failed', { message: e?.message });
    }

    if (!userContext || Object.keys(userContext).length === 0) {
      return { success: false, error: 'User financial data is not available.' };
    }

    let response = { success: false };
    if (this.openrouterApiKeys.length > 0) {
      response = await this.generateOpenRouterResponse(userMessage, userContext);
    }
    if (!response.success && this.openaiApiKey) {
      response = await this.generateOpenAIResponse(userMessage, userContext);
    }
    if (!response.success && this.geminiApiKey) {
      response = await this.generateGeminiResponse(userMessage, userContext);
    }

    if (!response.success) {
      return this.generateIntelligentFallback(userMessage, userContext);
    }

    const parsed = this.parseAIResponse(response.content, userContext);
    return { ...parsed, provider: response.provider };
  }

  // Ensure user context is always fetched from the database
  async getUserFinancialContext(userId, supabase) {
    try {
      const [accountsResult, transactionsResult, budgetsResult] = await Promise.allSettled([
        supabase.from('accounts').select('balance').eq('user_id', userId),
        supabase.from('transactions')
          .select('amount, type, created_at')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('budgets').select('*').eq('user_id', userId)
      ]);

      const accounts = accountsResult.status === 'fulfilled' ? accountsResult.value.data || [] : [];
      const transactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value.data || [] : [];
      const budgets = budgetsResult.status === 'fulfilled' ? budgetsResult.value.data || [] : [];

      const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
      const monthlyExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        budgets,
        recentTransactions: transactions,
        financialGoals: [] // Add goals table integration if available
      };
    } catch (error) {
      console.error('Error fetching user financial context:', error);
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        budgets: [],
        recentTransactions: [],
        financialGoals: []
      };
    }
  }

  // System prompt for financial context
  getSystemPrompt(userContext) {
    if (!userContext || Object.keys(userContext).length === 0) {
      return `You are an expert AI Financial Assistant for FinanceFlow, a personal finance management app.

      I'm sorry, but I cannot provide personalized financial advice without access to your account data. Please ensure you are logged in and have granted the necessary permissions.`;
    }

    const {
      totalBalance = 0,
      monthlyIncome = 0,
      monthlyExpenses = 0,
      budgets = [],
      recentTransactions = [],
      financialGoals = [],
      userProfile = null
    } = userContext;

    const budgetsLines = Array.isArray(budgets) && budgets.length
      ? budgets.slice(0, 10).map((b, i) => `  - ${b.name ?? 'Budget ' + (i + 1)}: ${formatCurrencyFromPrefs(Number(b.total_amount) || 0)} (${b.period_type ?? 'period'})`).join('\n')
      : '  - None';

    const txLines = Array.isArray(recentTransactions) && recentTransactions.length
      ? recentTransactions.slice(0, 10).map((t) => {
          const amt = formatCurrencyFromPrefs(Number(t.amount) || 0);
          const kind = (t.transaction_type || t.type || '').toString();
          const when = (t.transaction_date || t.created_at || '').toString().slice(0, 10);
          return `  - ${when} • ${kind} • ${amt}`;
        }).join('\n')
      : '  - None in the last 30 days';

    const goalsLine = Array.isArray(financialGoals) && financialGoals.length ? `${financialGoals.length} active` : 'None';
    const userNameLine = userProfile?.full_name ? `Name: ${userProfile.full_name}\n` : '';

    return `You are an expert AI Financial Assistant for FinanceFlow, a personal finance management app.

STRICT INSTRUCTIONS:
- Only use the financial data explicitly provided below.
- Do not fabricate or guess values that are not present.
- If requested data is missing, say it is not available.
- Never reference or imply data from any other user account.
- Keep advice specific to this user's actual figures.

User Profile:
${userNameLine}Currency Preference: inferred from formatting

User Financial Snapshot:
- Total Balance: ${formatCurrencyFromPrefs(totalBalance)}
- Monthly Income: ${formatCurrencyFromPrefs(monthlyIncome)}
- Monthly Expenses: ${formatCurrencyFromPrefs(monthlyExpenses)}
- Budgets (${budgets?.length || 0}):
${budgetsLines}
- Recent Transactions (${recentTransactions?.length || 0} shown):
${txLines}
- Financial Goals: ${goalsLine}

Your role:
1) Provide personalized advice strictly based on this data.
2) Suggest actionable steps for budget optimization and expense control.
3) Help with goal planning and savings.
4) Highlight trends observable from the snapshot without inventing new data.

Response Guidelines:
- Be concise, clear, and practical.
- Cite concrete numbers from the snapshot when relevant.
- If the user asks for unsupported operations, propose a relevant quick action.
- If information is missing, state that you need that data rather than guessing.`;
  }

  // Parse AI response and structure for UI
  parseAIResponse(content, userContext) {
    const lowerContent = content.toLowerCase();
    
    let responseType = 'text';
    let quickActions = [];
    
    if (lowerContent.includes('budget') || lowerContent.includes('spending')) {
      responseType = 'recommendation';
      quickActions = [
        { label: 'View Budget Details', icon: 'PieChart', type: 'view_budget' },
        { label: 'Set Spending Alert', icon: 'Bell', type: 'set_alert' }
      ];
    } else if (lowerContent.includes('goal') || lowerContent.includes('save')) {
      quickActions = [
        { label: 'Create Goal', icon: 'Target', type: 'create_goal' },
        { label: 'View Progress', icon: 'TrendingUp', type: 'view_progress' }
      ];
    } else if (lowerContent.includes('invest') || lowerContent.includes('portfolio')) {
      quickActions = [
        { label: 'Investment Guide', icon: 'TrendingUp', type: 'investment_guide' },
        { label: 'Risk Assessment', icon: 'Shield', type: 'risk_assessment' }
      ];
    }

    return {
      type: responseType,
      content: content,
      quickActions: quickActions,
      timestamp: new Date(),
      provider: 'ai'
    };
  }

  // Intelligent fallback when APIs are unavailable
  generateIntelligentFallback(userMessage, userContext) {
    const lowerMessage = userMessage.toLowerCase();
    const { totalBalance = 0, monthlyExpenses = 0, budgets = [] } = userContext;
    
    let content = '';
    let quickActions = [];
    
    if (lowerMessage.includes('budget')) {
      content = `Based on your current financial data, I can see you have $${totalBalance.toLocaleString()} in total balance with monthly expenses of $${monthlyExpenses.toLocaleString()}. \n\nHere are some budget optimization suggestions:\n\n• Review your highest spending categories\n• Set up automated savings transfers\n• Consider the 50/30/20 budgeting rule\n• Track discretionary spending more closely`;
      quickActions = [
        { label: 'View Budget Details', icon: 'PieChart', type: 'view_budget' },
        { label: 'Create Budget Plan', icon: 'Target', type: 'create_budget' }
      ];
    } else if (lowerMessage.includes('save') || lowerMessage.includes('goal')) {
      const emergencyFund = monthlyExpenses * 6;
      content = `Let's work on your savings goals! Based on your monthly expenses of $${monthlyExpenses.toLocaleString()}, I recommend:\n\n• Emergency Fund: Target $${emergencyFund.toLocaleString()} (6 months of expenses)\n• Automate savings: Set up automatic transfers\n• High-yield savings account for better returns\n• Consider investment options for long-term goals`;
      quickActions = [
        { label: 'Set Savings Goal', icon: 'Target', type: 'set_goal' },
        { label: 'Emergency Fund Calculator', icon: 'Shield', type: 'emergency_calc' }
      ];
    } else {
      content = `I'm here to help with your financial questions! While I'm currently operating in offline mode, I can still provide guidance based on your financial data.\n\nI can help you with:\n• Budget planning and optimization\n• Savings and investment strategies\n• Expense analysis and tracking\n• Financial goal setting\n\nWhat specific area would you like to focus on?`;
      quickActions = [
        { label: 'Budget Help', icon: 'PieChart', type: 'budget_help' },
        { label: 'Savings Plan', icon: 'PiggyBank', type: 'savings_plan' }
      ];
    }
    
    return {
      type: 'text',
      content: content,
      quickActions: quickActions,
      timestamp: new Date(),
      provider: 'fallback'
    };
  }

  // Execute supported quick actions with DB writes where possible
  async applyQuickAction(action, userId, extra = {}) {
    try {
      if (!action || !action.type) {
        return { ok: false, error: 'Invalid action' };
      }
      switch (action.type) {
        case 'view_budget':
          return { ok: true, navigateTo: '/budget-planning' };
        case 'set_alert':
          return { ok: true, message: 'Open alerts on /expense-management', navigateTo: '/expense-management' };
        case 'create_goal':
        case 'set_goal': {
          if (!userId) return { ok: false, error: 'Missing user id' };
          const payload = {
            user_id: userId,
            name: extra?.name || 'New Savings Goal',
            target_amount: Number(extra?.target_amount ?? 0),
            current_amount: 0,
            is_achieved: false,
            created_at: new Date().toISOString(),
          };
          const { data, error } = await supabase.from('financial_goals').insert([payload]).select().single();
          if (error) return { ok: false, error: error.message };
          return { ok: true, data, navigateTo: '/budget-planning' };
        }
        case 'create_budget': {
          if (!userId) return { ok: false, error: 'Missing user id' };
          const budget = {
            user_id: userId,
            name: extra?.name || 'New Budget',
            total_amount: Number(extra?.total_amount ?? 0),
            period_type: extra?.period_type || 'monthly',
            is_active: true,
            created_at: new Date().toISOString(),
          };
          const { data, error } = await supabase.from('budgets').insert([budget]).select().single();
          if (error) return { ok: false, error: error.message };
          return { ok: true, data, navigateTo: '/budget-planning' };
        }
        case 'investment_guide':
          return { ok: true, navigateTo: '/financial-reports' };
        case 'risk_assessment':
          return { ok: true, navigateTo: '/financial-reports' };
        case 'view_progress':
          return { ok: true, navigateTo: '/dashboard' };
        case 'budget_help':
          return { ok: true, navigateTo: '/budget-planning' };
        case 'savings_plan':
          return { ok: true, navigateTo: '/budget-planning' };
        default:
          return { ok: false, error: `Unsupported action: ${action.type}` };
      }
    } catch (err) {
      return { ok: false, error: err?.message || 'Action failed' };
    }
  }
}

export default new AIService();
