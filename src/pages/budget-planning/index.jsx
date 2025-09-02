import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import HeaderBar from '../../components/ui/HeaderBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import BudgetOverviewCard from './components/BudgetOverviewCard';
import CategoryBudgetList from './components/CategoryBudgetList';
import BudgetVisualization from './components/BudgetVisualization';
import CreateBudgetModal from './components/CreateBudgetModal';
import AIRecommendations from './components/AIRecommendations';
import QuickActions from './components/QuickActions';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const BudgetPlanning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current budget data
  const fetchCurrentBudget = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
  
      // Get current active budget
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('end_date', startOfMonth)
        .lte('start_date', endOfMonth)
        .order('created_at', { ascending: false })
        .limit(1);
  
      if (budgets && budgets.length > 0) {
        const budget = budgets[0];
        
        // Get current month's spending
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('transaction_type', 'expense')
          .gte('transaction_date', startOfMonth)
          .lte('transaction_date', endOfMonth);
  
        const totalSpent = transactions?.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0) || 0;
  
        // Get total income for the month
        const { data: incomeTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('transaction_type', 'income')
          .gte('transaction_date', startOfMonth)
          .lte('transaction_date', endOfMonth);
  
        const totalIncome = incomeTransactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
  
        setCurrentBudget({
          id: budget.id,
          name: budget.name,
          period: budget.period_type,
          totalIncome: totalIncome,
          totalBudget: parseFloat(budget.total_amount),
          totalSpent: totalSpent,
          budgetPeriod: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          createdAt: budget.created_at,
          updatedAt: budget.updated_at
        });
      } else {
        setCurrentBudget(null);
      }
    } catch (err) {
      console.error('Error fetching current budget:', err);
      setError('Failed to load budget data');
    }
  };

  // Fetch budget categories with spending data
  const fetchBudgetCategories = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
  
      // Get budget categories with their allocations
      const { data: budgetCategories } = await supabase
        .from('budget_categories')
        .select(`
          *,
          budgets!inner(user_id, is_active),
          expense_categories(name, icon, color)
        `)
        .eq('budgets.user_id', user.id)
        .eq('budgets.is_active', true);
  
      if (!budgetCategories) {
        setBudgetCategories([]);
        return;
      }
  
      const categories = [];
      
      for (const budgetCategory of budgetCategories) {
        const categoryName = budgetCategory.expense_categories?.name || 'Unknown';
        const categoryIcon = budgetCategory.expense_categories?.icon || 'DollarSign';
        const categoryColor = budgetCategory.expense_categories?.color || '#3B82F6';
  
        // Get spending for this category in current month
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, description')
          .eq('user_id', user.id)
          .eq('category_id', budgetCategory.category_id)
          .eq('transaction_type', 'expense')
          .gte('transaction_date', startOfMonth)
          .lte('transaction_date', endOfMonth)
          .order('transaction_date', { ascending: false })
          .limit(5);
  
        const spent = transactions?.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0) || 0;
        const recentTransactions = transactions?.map((t, index) => ({
          id: index + 1,
          description: t.description || 'Transaction',
          amount: Math.abs(parseFloat(t.amount))
        })) || [];
  
        categories.push({
          id: budgetCategory.id,
          name: categoryName,
          icon: categoryIcon,
          color: categoryColor,
          description: `${categoryName} expenses`,
          allocated: parseFloat(budgetCategory.allocated_amount),
          spent,
          recentTransactions
        });
      }
  
      setBudgetCategories(categories);
    } catch (err) {
      console.error('Error fetching budget categories:', err);
      setError('Failed to load budget categories');
    }
  };

  // Fetch monthly comparison data
  const fetchMonthlyComparison = async () => {
    try {
      const currentDate = new Date();
      const months = [];

      // Get last 5 months of data
      for (let i = 4; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        // Get budget for this month
        const { data: budgets } = await supabase
          .from('budgets')
          .select('amount')
          .eq('user_id', user.id)
          .eq('month', month)
          .eq('year', year);

        const budgeted = budgets?.reduce((sum, b) => sum + parseFloat(b.amount), 0) || 0;
        
        // Get spending for this month
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'expense')
          .gte('date', `${year}-${month.toString().padStart(2, '0')}-01`)
          .lt('date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);

        const spent = transactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
        
        months.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          budgeted: Math.round(budgeted),
          spent: Math.round(spent)
        });
      }

      setMonthlyComparison(months);
    } catch (err) {
      console.error('Error fetching monthly comparison:', err);
    }
  };

  // Load all data when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
          // Use Promise.allSettled instead of Promise.all to prevent hanging
          const results = await Promise.allSettled([
            fetchCurrentBudget(),
            fetchBudgetCategories(),
            fetchMonthlyComparison()
          ]);
          
          // Log any rejected promises for debugging
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              const functionNames = ['fetchCurrentBudget', 'fetchBudgetCategories', 'fetchMonthlyComparison'];
              console.error(`${functionNames[index]} failed:`, result.reason);
            }
          });
          
        } catch (err) {
          console.error('Error loading budget data:', err);
          setError('Failed to load budget data');
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setIsCreateModalOpen(true);
  };

  const handleEditBudget = () => {
    setEditingBudget(currentBudget);
    setIsCreateModalOpen(true);
  };

  const handleEditCategory = async (categoryId) => {
    // Handle category editing
    console.log('Edit category:', categoryId);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudgetCategories(prev => prev?.filter(cat => cat?.id !== categoryId));
      
      // Refresh budget data
      await fetchCurrentBudget();
    } catch (err) {
      console.error('Error deleting budget category:', err);
      setError('Failed to delete budget category');
    }
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      setLoading(true);
      const currentDate = new Date();
      
      // First, create or update the main budget
      const budgetPayload = {
        user_id: user.id,
        name: budgetData.name,
        total_amount: budgetData.totalIncome,
        period_type: budgetData.period,
        start_date: currentDate.toISOString().split('T')[0],
        end_date: getBudgetEndDate(currentDate, budgetData.period),
        is_active: true
      };
  
      let budgetId;
      
      if (editingBudget?.id) {
        // Update existing budget
        const { data, error } = await supabase
          .from('budgets')
          .update(budgetPayload)
          .eq('id', editingBudget.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        budgetId = data.id;
        
        // Delete existing budget categories
        await supabase
          .from('budget_categories')
          .delete()
          .eq('budget_id', budgetId);
      } else {
        // Create new budget
        const { data, error } = await supabase
          .from('budgets')
          .insert(budgetPayload)
          .select()
          .single();
        
        if (error) throw error;
        budgetId = data.id;
      }
  
      // Create expense categories if they don't exist and get their IDs
      const categoryInserts = [];
      
      for (const category of budgetData.categories) {
        // Check if category exists
        let { data: existingCategory } = await supabase
          .from('expense_categories')
          .select('id')
          .eq('name', category.name)
          .eq('user_id', user.id)
          .single();
        
        let categoryId;
        
        if (!existingCategory) {
          // Create new expense category
          const { data: newCategory, error: categoryError } = await supabase
            .from('expense_categories')
            .insert({
              user_id: user.id,
              name: category.name,
              icon: category.icon || 'DollarSign',
              color: category.color || '#3B82F6',
              is_default: false
            })
            .select()
            .single();
          
          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        } else {
          categoryId = existingCategory.id;
        }
        
        // Prepare budget category insert
        categoryInserts.push({
          budget_id: budgetId,
          category_id: categoryId,
          allocated_amount: category.allocated || 0,
          spent_amount: 0
        });
      }
  
      // Insert budget categories
      if (categoryInserts.length > 0) {
        const { error: budgetCategoriesError } = await supabase
          .from('budget_categories')
          .insert(categoryInserts);
        
        if (budgetCategoriesError) throw budgetCategoriesError;
      }
  
      // Refresh all data
      await Promise.all([
        fetchCurrentBudget(),
        fetchBudgetCategories(),
        fetchMonthlyComparison()
      ]);
  
      setIsCreateModalOpen(false);
      setEditingBudget(null);
      setError(null);
    } catch (err) {
      console.error('Error saving budget:', err);
      setError(`Failed to save budget: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to calculate budget end date
  const getBudgetEndDate = (startDate, period) => {
    const date = new Date(startDate);
    
    switch (period) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    
    return date.toISOString().split('T')[0];
  };

  const handleApplyRecommendation = (recommendation) => {
    // Apply AI recommendation
    console.log('Applying recommendation:', recommendation);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'add-expense': 
        navigate('/expense-management');
        break;
      case 'set-goal':
        // Handle goal setting
        console.log('Set goal');
        break;
      case 'view-reports': 
        navigate('/financial-reports');
        break;
      default:
        break;
    }
  };

  const remainingBudget = currentBudget ? currentBudget?.totalBudget - currentBudget?.totalSpent : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderBar />
        <BottomTabNavigation />
        <main className="pt-16 pb-20 lg:pb-6 lg:pl-64">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading budget data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderBar />
        <BottomTabNavigation />
        <main className="pt-16 pb-20 lg:pb-6 lg:pl-64">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar />
      <BottomTabNavigation />
      <main className="pt-16 pb-20 lg:pb-6 lg:pl-64">
        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Budget Planning</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage your budgets with AI-powered insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleEditBudget}
                iconName="Edit2"
                iconPosition="left"
                disabled={!currentBudget}
              >
                Edit Budget
              </Button>
              <Button
                variant="default"
                onClick={handleCreateBudget}
                iconName="Plus"
                iconPosition="left"
              >
                Create Budget
              </Button>
            </div>
          </div>

          {currentBudget ? (
            <>
              {/* Budget Overview */}
              <BudgetOverviewCard
                totalBudget={currentBudget?.totalBudget}
                totalSpent={currentBudget?.totalSpent}
                remainingBudget={remainingBudget}
                budgetPeriod={currentBudget?.budgetPeriod}
              />

              {/* Quick Actions */}
              <QuickActions
                onCreateBudget={handleCreateBudget}
                onAddExpense={() => handleQuickAction('add-expense')}
                onSetGoal={() => handleQuickAction('set-goal')}
                onViewReports={() => handleQuickAction('view-reports')}
              />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Categories and Visualization */}
                <div className="xl:col-span-2 space-y-6">
                  <CategoryBudgetList
                    categories={budgetCategories}
                    onEditCategory={handleEditCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                  
                  <BudgetVisualization
                    categories={budgetCategories}
                    monthlyComparison={monthlyComparison}
                  />
                </div>

                {/* Right Column - AI Recommendations */}
                <div className="xl:col-span-1">
                  <AIRecommendations
                    budgetData={currentBudget}
                    onApplyRecommendation={handleApplyRecommendation}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="PieChart" size={48} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No Budget Created Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first budget. Our AI will help you allocate funds 
                based on your income and spending patterns.
              </p>
              <Button
                variant="default"
                size="lg"
                onClick={handleCreateBudget}
                iconName="Plus"
                iconPosition="left"
              >
                Create Your First Budget
              </Button>
            </div>
          )}
        </div>
      </main>
      {/* Create/Edit Budget Modal */}
      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveBudget}
        editingBudget={editingBudget}
      />
    </div>
  );
};

export default BudgetPlanning;