import { supabase } from "../lib/supabase";
import { formatCurrencyFromPrefs } from "../utils/formatCurrency";

const userContextService = {
  async getUserFinancialContext(userId) {
    try {
      const [accountsRes, transactionsRes, budgetsRes, goalsRes, profileRes] = await Promise.all([
        supabase.from("accounts").select("id, name, balance, currency").eq("user_id", userId),
        supabase
          .from("transactions")
          .select("id, amount, transaction_type, transaction_date, created_at, category_id, account_id")
          .eq("user_id", userId)
          .gte("transaction_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order("transaction_date", { ascending: false })
          .limit(50),
        supabase.from("budgets").select("*").eq("user_id", userId).eq("is_active", true),
        supabase.from("financial_goals").select("*").eq("user_id", userId).eq("is_achieved", false),
        supabase.from("user_profiles").select("*").eq("id", userId).single(),
      ]);

      const accounts = accountsRes.data || [];
      const transactions = transactionsRes.data || [];
      const budgets = budgetsRes.data || [];
      const financialGoals = goalsRes.data || [];
      const userProfile = profileRes.data || null;

      const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
      const monthlyExpenses = transactions
        .filter((t) => t.transaction_type === "expense")
        .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
      const monthlyIncome = transactions
        .filter((t) => t.transaction_type === "income")
        .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

      // Basic summaries for assistant prompt
      const budgetSummary = budgets.map(b => ({ id: b.id, name: b.name, total_amount: b.total_amount, period_type: b.period_type })).slice(0, 10);

      return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        budgets: budgetSummary,
        recentTransactions: transactions.slice(0, 10),
        financialGoals,
        userProfile,
      };
    } catch (e) {
      console.error("getUserFinancialContext error", e);
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        budgets: [],
        recentTransactions: [],
        financialGoals: [],
        userProfile: null,
      };
    }
  },

  buildContextNote(ctx) {
    try {
      const lines = [];
      lines.push(`Total Balance: ${formatCurrencyFromPrefs(ctx.totalBalance || 0)}`);
      lines.push(`Monthly Income: ${formatCurrencyFromPrefs(ctx.monthlyIncome || 0)}`);
      lines.push(`Monthly Expenses: ${formatCurrencyFromPrefs(ctx.monthlyExpenses || 0)}`);
      if (ctx.budgets?.length) {
        const names = ctx.budgets.map(b => `${b.name} (${b.period_type})`).slice(0, 5).join(", ");
        lines.push(`Active Budgets: ${ctx.budgets.length} [${names}]`);
      }
      if (ctx.financialGoals?.length) {
        lines.push(`Active Goals: ${ctx.financialGoals.length}`);
      }
      return lines.join("\n");
    } catch { return ""; }
  },
};

export default userContextService;