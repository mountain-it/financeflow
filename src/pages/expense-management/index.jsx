import React, { useState, useEffect, useCallback } from 'react';
import HeaderBar from '../../components/ui/HeaderBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import AddExpenseModal from './components/AddExpenseModal';
import FilterPanel from './components/FilterPanel';
import ExpenseList from './components/ExpenseList';
import SearchBar from './components/SearchBar';
import ExpenseSummary from './components/ExpenseSummary';
import EditExpenseModal from './components/EditExpenseModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const ExpenseManagement = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: '',
    startDate: '',
    endDate: '',
    categories: [],
    paymentMethods: [],
    minAmount: '',
    maxAmount: ''
  });

  // Fetch expenses from database
  const fetchExpenses = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          description,
          transaction_date,
          payment_method,
          created_at,
          expense_categories(name),
          accounts(name)
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      
      if (transactions) {
        const formattedExpenses = transactions.map(transaction => ({
          id: transaction.id,
          amount: Math.abs(parseFloat(transaction.amount)),
          description: transaction.description,
          category: transaction.expense_categories?.name?.toLowerCase() || 'other',
          paymentMethod: transaction.payment_method || 'other',
          date: transaction.transaction_date,
          timestamp: transaction.created_at,
          account: transaction.accounts?.name
        }));
        
        setExpenses(formattedExpenses);
        setFilteredExpenses(formattedExpenses);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    if (user?.id) {
      fetchExpenses();
    }
  }, [user?.id]);

  // Filter and search logic
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...expenses];

    // Apply search
    if (searchQuery?.trim()) {
      const query = searchQuery?.toLowerCase();
      filtered = filtered?.filter(expense =>
        expense?.description?.toLowerCase()?.includes(query) ||
        expense?.category?.toLowerCase()?.includes(query)
      );
    }

    // Apply date range filter
    if (filters?.dateRange) {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      switch (filters?.dateRange) {
        case 'today':
          filtered = filtered?.filter(expense => 
            new Date(expense.date) >= startOfToday
          );
          break;
        case 'yesterday':
          const yesterday = new Date(startOfToday);
          yesterday?.setDate(yesterday?.getDate() - 1);
          filtered = filtered?.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= yesterday && expenseDate < startOfToday;
          });
          break;
        case 'this_week':
          const startOfWeek = new Date(startOfToday);
          startOfWeek?.setDate(startOfWeek?.getDate() - startOfWeek?.getDay());
          filtered = filtered?.filter(expense => 
            new Date(expense.date) >= startOfWeek
          );
          break;
        case 'this_month':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered?.filter(expense => 
            new Date(expense.date) >= startOfMonth
          );
          break;
        case 'custom':
          if (filters?.startDate && filters?.endDate) {
            filtered = filtered?.filter(expense => {
              const expenseDate = new Date(expense.date);
              return expenseDate >= new Date(filters.startDate) && 
                     expenseDate <= new Date(filters.endDate);
            });
          }
          break;
      }
    }

    // Apply category filter
    if (filters?.categories?.length > 0) {
      filtered = filtered?.filter(expense => 
        filters?.categories?.includes(expense?.category)
      );
    }

    // Apply payment method filter
    if (filters?.paymentMethods?.length > 0) {
      filtered = filtered?.filter(expense => 
        filters?.paymentMethods?.includes(expense?.paymentMethod)
      );
    }

    // Apply amount range filter
    if (filters?.minAmount) {
      filtered = filtered?.filter(expense => 
        expense?.amount >= parseFloat(filters?.minAmount)
      );
    }
    if (filters?.maxAmount) {
      filtered = filtered?.filter(expense => 
        expense?.amount <= parseFloat(filters?.maxAmount)
      );
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchQuery, filters]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Expense management functions
  const handleAddExpense = async (newExpenseData) => {
    if (!user?.id) return;
    
    try {
      // First, get or create the expense category
      let categoryId = null;
      if (newExpenseData.category) {
        const { data: existingCategory } = await supabase
          .from('expense_categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', newExpenseData.category)
          .single();
        
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const { data: newCategory, error: categoryError } = await supabase
            .from('expense_categories')
            .insert({
              user_id: user.id,
              name: newExpenseData.category,
              color: '#3B82F6'
            })
            .select('id')
            .single();
          
          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        }
      }
      
      // Get the user's first account (or create a default one)
      let accountId = null;
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (accounts && accounts.length > 0) {
        accountId = accounts[0].id;
      } else {
        // Create a default account
        const { data: newAccount, error: accountError } = await supabase
          .from('accounts')
          .insert({
            user_id: user.id,
            name: 'Default Account',
            type: 'checking',
            balance: 0
          })
          .select('id')
          .single();
        
        if (accountError) throw accountError;
        accountId = newAccount.id;
      }
      
      // Create the transaction (fixed to include payment_method field)
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: accountId,
          category_id: categoryId,
          amount: -Math.abs(parseFloat(newExpenseData.amount)), // Negative for expenses
          description: newExpenseData.description,
          transaction_date: newExpenseData.date,
          transaction_type: 'expense',
          payment_method: newExpenseData.paymentMethod || 'cash'
        })
        .select(`
          id,
          amount,
          description,
          transaction_date,
          payment_method,
          created_at,
          expense_categories(name),
          accounts(name)
        `)
        .single();
      
      if (error) throw error;
      
      // Format and add to local state (fixed to use actual payment_method from database)
      const formattedExpense = {
        id: transaction.id,
        amount: Math.abs(parseFloat(transaction.amount)),
        description: transaction.description,
        category: transaction.expense_categories?.name?.toLowerCase() || 'other',
        paymentMethod: transaction.payment_method || 'other',
        date: transaction.transaction_date,
        timestamp: transaction.created_at,
        account: transaction.accounts?.name
      };
      
      setExpenses(prev => [formattedExpense, ...prev]);
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense. Please try again.');
    }
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleUpdateExpense = async (updatedExpenseData) => {
    if (!user?.id || !selectedExpense?.id) return;
    
    try {
      // Update the transaction in database
      const { data: transaction, error } = await supabase
        .from('transactions')
        .update({
          amount: -Math.abs(parseFloat(updatedExpenseData.amount)),
          description: updatedExpenseData.description,
          transaction_date: updatedExpenseData.date,
          payment_method: updatedExpenseData.paymentMethod
        })
        .eq('id', selectedExpense.id)
        .eq('user_id', user.id)
        .select(`
          id,
          amount,
          description,
          transaction_date,
          payment_method,
          created_at,
          expense_categories(name),
          accounts(name)
        `)
        .single();
      
      if (error) throw error;
      
      // Format and update local state
      const formattedExpense = {
        id: transaction.id,
        amount: Math.abs(parseFloat(transaction.amount)),
        description: transaction.description,
        category: transaction.expense_categories?.name?.toLowerCase() || 'other',
        paymentMethod: transaction.payment_method || 'other',
        date: transaction.transaction_date,
        timestamp: transaction.created_at,
        account: transaction.accounts?.name
      };
      
      setExpenses(prev => 
        prev?.map(expense => 
          expense?.id === selectedExpense.id ? formattedExpense : expense
        )
      );
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setExpenses(prev => prev?.filter(expense => expense?.id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    applyFiltersAndSearch();
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: '',
      startDate: '',
      endDate: '',
      categories: [],
      paymentMethods: [],
      minAmount: '',
      maxAmount: ''
    });
  };

  const hasActiveFilters = filters?.categories?.length > 0 || 
                          filters?.paymentMethods?.length > 0 || 
                          filters?.dateRange || 
                          filters?.minAmount || 
                          filters?.maxAmount;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchExpenses();
            }} 
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
      <BottomTabNavigation />

      {/* Main Content */}
      <main className="pt-16 pb-20 lg:pb-4 lg:pl-64">
        <div className="max-w-4xl mx-auto">
          {/* Search and Filter Bar */}
          <SearchBar
            onSearch={handleSearch}
            onFilterToggle={() => setIsFilterPanelOpen(true)}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Content Area */}
          <div className="px-4 lg:px-6">
            {/* Summary */}
            <ExpenseSummary
              expenses={expenses}
              filteredExpenses={filteredExpenses}
              filters={filters}
            />

            {/* Expense List */}
            <ExpenseList
              expenses={filteredExpenses}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Floating Add Button */}
        <Button
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full shadow-lg z-30"
          onClick={() => setIsAddModalOpen(true)}
          size="icon"
        >
          <Icon name="Plus" size={24} />
        </Button>
      </main>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <EditExpenseModal
        isOpen={isEditModalOpen}
        expense={selectedExpense}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedExpense(null);
        }}
        onUpdateExpense={handleUpdateExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
};

export default ExpenseManagement;