import React, { useState, useEffect } from 'react';
import HeaderBar from '../../components/ui/HeaderBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import AccountBalanceCard from './components/AccountBalanceCard';
import MonthlySpendingCard from './components/MonthlySpendingCard';
import BudgetProgressCard from './components/BudgetProgressCard';
import RecentTransactionsCard from './components/RecentTransactionsCard';
import AIInsightsCard from './components/AIInsightsCard';
import QuickActionsCard from './components/QuickActionsCard';
import SpendingTrendsChart from './components/SpendingTrendsChart';
import NotificationCard from './components/NotificationCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [currentDate] = useState(new Date());
  
  // Real data states
  const [accountBalance, setAccountBalance] = useState({ balance: 0, change: 0, changeType: 'increase' });
  const [monthlySpending, setMonthlySpending] = useState({ spent: 0, budget: 0, categories: [] });
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [spendingTrendsData, setSpendingTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch account balances
  const fetchAccountBalances = async () => {
    if (!user?.id) return;
    
    try {
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (accounts && accounts.length > 0) {
        const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);
        // Calculate change (you might want to store previous balance or calculate from transactions)
        setAccountBalance({
          balance: totalBalance,
          change: 0, // TODO: Calculate actual change from previous period
          changeType: 'increase'
        });
      }
    } catch (err) {
      console.error('Error fetching account balances:', err);
      setError('Failed to load account balances');
    }
  };

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    if (!user?.id) return;
    
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          expense_categories(name),
          accounts(name)
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      if (transactions) {
        const formattedTransactions = transactions.map(transaction => ({
          id: transaction.id,
          description: transaction.description,
          category: transaction.expense_categories?.name || 'Other',
          amount: Math.abs(parseFloat(transaction.amount)),
          type: parseFloat(transaction.amount) < 0 ? 'expense' : 'income',
          date: new Date(transaction.transaction_date)
        }));
        setRecentTransactions(formattedTransactions);
      }
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
      setError('Failed to load recent transactions');
    }
  };

  // Fetch monthly spending data
  const fetchMonthlySpending = async () => {
    if (!user?.id) return;
    
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          expense_categories(name)
        `)
        .eq('user_id', user.id)
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`)
        .lt('amount', 0);
      
      if (error) {
        console.error('Transaction query error:', error);
        // Don't throw, just set empty state
        setMonthlySpending({ spent: 0, budget: 0, categories: [] });
        return;
      }
      
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          total_amount,
          budget_categories(allocated_amount)
        `)
        .eq('user_id', user.id)
        .eq('period_type', 'monthly')
        .gte('start_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('start_date', `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`);
      
      if (budgetError) {
        console.error('Budget query error:', budgetError);
      }
      
      const safeTransactions = transactions || [];
      const safeBudgets = budgets || [];
      
      const totalSpent = safeTransactions.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0);
      const totalBudget = safeBudgets.reduce((sum, b) => {
        if (b.budget_categories && Array.isArray(b.budget_categories)) {
          return sum + b.budget_categories.reduce((catSum, cat) => catSum + (parseFloat(cat.allocated_amount) || 0), 0);
        }
        return sum + (parseFloat(b.total_amount) || 0);
      }, 0);
      
      const categorySpending = {};
      safeTransactions.forEach(transaction => {
        const category = transaction.expense_categories?.name || 'Other';
        const amount = Math.abs(parseFloat(transaction.amount) || 0);
        categorySpending[category] = (categorySpending[category] || 0) + amount;
      });
      
      const categories = Object.entries(categorySpending).map(([name, amount], index) => ({
        name,
        amount,
        color: ['bg-primary', 'bg-accent', 'bg-success', 'bg-warning'][index % 4]
      }));
      
      setMonthlySpending({ spent: totalSpent, budget: totalBudget, categories });
      
    } catch (err) {
      console.error('Error fetching monthly spending:', err);
      setMonthlySpending({ spent: 0, budget: 0, categories: [] });
    }
  };

  // Fetch budget progress
  const fetchBudgetProgress = async () => {
    if (!user?.id) return;
    
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Get active budgets for the current period
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          id,
          name,
          total_amount,
          start_date,
          end_date,
          budget_categories(
            id,
            allocated_amount,
            expense_categories(
              id,
              name,
              icon,
              color
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .lte('start_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .gte('end_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);
      
      if (budgetError) throw budgetError;
      
      if (budgets && budgets.length > 0) {
        const budgetProgressData = [];
        
        for (const budget of budgets) {
          if (budget.budget_categories && budget.budget_categories.length > 0) {
            for (const budgetCategory of budget.budget_categories) {
              const category = budgetCategory.expense_categories;
              if (!category) continue;
              
              // Get spending for this category in current month
              const { data: transactions } = await supabase
                .from('transactions')
                .select('amount')
                .eq('user_id', user.id)
                .eq('category_id', category.id)
                .eq('transaction_type', 'expense')
                .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
                .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
              
              const spent = transactions
                ?.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0) || 0;
              
              budgetProgressData.push({
                category: category.name,
                spent,
                limit: parseFloat(budgetCategory.allocated_amount) || 0,
                icon: getIconForCategory(category.name)
              });
            }
          }
        }
        
        setBudgetProgress(budgetProgressData);
      } else {
        // No active budgets found, set empty state
        setBudgetProgress([]);
      }
    } catch (err) {
      console.error('Error fetching budget progress:', err);
      setBudgetProgress([]);
      // Don't set error state to avoid breaking the dashboard
    }
  };

  // Helper function to get icon for category
  const getIconForCategory = (categoryName) => {
    const iconMap = {
      'Food & Dining': 'Utensils',
      'Transportation': 'Car',
      'Shopping': 'ShoppingBag',
      'Entertainment': 'Film',
      'Utilities': 'Zap',
      'Healthcare': 'Heart',
      'Education': 'BookOpen',
      'Travel': 'Plane'
    };
    return iconMap[categoryName] || 'DollarSign';
  };

  // Fetch spending trends (last 7 days)
  const fetchSpendingTrends = async () => {
    if (!user?.id) return;
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, transaction_date')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])
        .lt('amount', 0)
        .order('transaction_date', { ascending: true });
      
      if (error) throw error;
      
      if (transactions) {
        // Group by date and sum amounts
        const dailySpending = {};
        transactions.forEach(transaction => {
          const date = transaction.transaction_date;
          dailySpending[date] = (dailySpending[date] || 0) + Math.abs(parseFloat(transaction.amount));
        });
        
        const trendsData = Object.entries(dailySpending).map(([date, amount]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount
        }));
        
        setSpendingTrendsData(trendsData);
      }
    } catch (err) {
      console.error('Error fetching spending trends:', err);
      setError('Failed to load spending trends');
    }
  };

  // Load all data when component mounts or user changes
  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.id) {
        setLoading(true);
        setError(null);
        
        try {
          // Use Promise.allSettled instead of Promise.all to prevent hanging
          const results = await Promise.allSettled([
            fetchAccountBalances(),
            fetchRecentTransactions(),
            fetchMonthlySpending(),
            fetchBudgetProgress(),
            fetchSpendingTrends()
          ]);
          
          // Log any rejected promises for debugging
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              const functionNames = ['fetchAccountBalances', 'fetchRecentTransactions', 'fetchMonthlySpending', 'fetchBudgetProgress', 'fetchSpendingTrends'];
              console.error(`${functionNames[index]} failed:`, result.reason);
            }
          });
          
        } catch (err) {
          console.error('Dashboard loading error:', err);
          setError('Failed to load dashboard data');
        } finally {
          // Always stop loading, even if some functions fail
          setLoading(false);
        }
      } else {
        // If no user, stop loading immediately
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Mock data for AI insights and notifications (these would need more complex logic)
  const aiInsights = [
    {
      type: "tip",
      title: "Welcome to FinanceFlow!",
      message: "Start by adding your accounts and recording some transactions to see personalized insights.",
      action: "Add Account"
    }
  ];

  const notifications = [
    {
      id: 1,
      type: "welcome",
      title: "Welcome to FinanceFlow!",
      message: "Set up your accounts and start tracking your finances.",
      action: "Get Started"
    }
  ];

  const handleViewAllTransactions = () => {
    navigate('/expense-management');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar />
      <main className="pt-16 pb-4 lg:pl-64">
        <div className="px-4 lg:px-6 py-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Good {currentDate?.getHours() < 12 ? 'Morning' : currentDate?.getHours() < 18 ? 'Afternoon' : 'Evening'}, {userProfile?.full_name || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's your financial overview for {currentDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Notifications */}
          <div className="mb-6">
            <NotificationCard notifications={notifications} />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column - Primary Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Top Row - Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AccountBalanceCard 
                  balance={accountBalance?.balance}
                  change={accountBalance?.change}
                  changeType={accountBalance?.changeType}
                />
                <MonthlySpendingCard 
                  spent={monthlySpending?.spent}
                  budget={monthlySpending?.budget}
                  categories={monthlySpending?.categories}
                />
              </div>

              {/* Spending Trends Chart */}
              <SpendingTrendsChart data={spendingTrendsData} />

              {/* Recent Transactions */}
              <RecentTransactionsCard 
                transactions={recentTransactions}
                onViewAll={handleViewAllTransactions}
              />
            </div>

            {/* Right Column - Secondary Cards */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <QuickActionsCard />

              {/* AI Insights */}
              <AIInsightsCard insights={aiInsights} />

              {/* Budget Progress */}
              <BudgetProgressCard budgets={budgetProgress} />
            </div>
          </div>
        </div>
      </main>
      <BottomTabNavigation />
    </div>
  );
};

export default Dashboard;