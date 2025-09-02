class AIService {
  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.openaiBaseUrl = 'https://api.openai.com/v1';
    this.geminiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  // OpenAI GPT Integration
  async generateOpenAIResponse(prompt, userContext = {}) {
    try {
      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(userContext)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0].message.content,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'openai'
      };
    }
  }

  // Gemini AI Integration
  async generateGeminiResponse(prompt, userContext = {}) {
    try {
      const response = await fetch(`${this.geminiBaseUrl}/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${this.getSystemPrompt(userContext)}\n\nUser Query: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        content: data.candidates[0].content.parts[0].text,
        provider: 'gemini'
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'gemini'
      };
    }
  }

  // Smart AI Response with Fallback
  async generateFinancialAdvice(userMessage, userContext = {}) {
    // Try OpenAI first, fallback to Gemini if it fails
    let response = await this.generateOpenAIResponse(userMessage, userContext);
    
    if (!response.success && this.geminiApiKey) {
      console.log('OpenAI failed, trying Gemini...');
      response = await this.generateGeminiResponse(userMessage, userContext);
    }

    if (!response.success) {
      // Fallback to intelligent mock response if both APIs fail
      return this.generateIntelligentFallback(userMessage, userContext);
    }

    // Parse AI response and structure it for the UI
    return this.parseAIResponse(response.content, userContext);
  }

  // System prompt for financial context
  getSystemPrompt(userContext) {
    const { 
      totalBalance = 0, 
      monthlyIncome = 0, 
      monthlyExpenses = 0, 
      budgets = [], 
      recentTransactions = [],
      financialGoals = []
    } = userContext;

    return `You are an expert AI Financial Assistant for FinanceFlow, a personal finance management app. 

User's Financial Context:
- Total Balance: $${totalBalance.toLocaleString()}
- Monthly Income: $${monthlyIncome.toLocaleString()}
- Monthly Expenses: $${monthlyExpenses.toLocaleString()}
- Active Budgets: ${budgets.length} categories
- Recent Transactions: ${recentTransactions.length} transactions
- Financial Goals: ${financialGoals.length} active goals

Your role:
1. Provide personalized financial advice based on the user's actual data
2. Suggest actionable budget optimizations and spending insights
3. Help with financial goal planning and tracking
4. Offer investment and savings recommendations
5. Analyze spending patterns and identify opportunities

Response Guidelines:
- Be conversational but professional
- Use specific numbers from their financial data when relevant
- Provide actionable recommendations
- Keep responses concise but informative
- Focus on practical financial advice
- Include relevant quick actions when appropriate

Always base your advice on the user's actual financial situation provided in the context.`;
  }

  // Parse AI response and structure for UI
  parseAIResponse(content, userContext) {
    const lowerContent = content.toLowerCase();
    
    // Determine response type based on content
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

  // Get user's financial context from database
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
        financialGoals: [] // TODO: Add goals table integration
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
}

export default new AIService();