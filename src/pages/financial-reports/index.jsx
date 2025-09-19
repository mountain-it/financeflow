import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { formatCurrency } from '../../utils/formatCurrency';
import HeaderBar from '../../components/ui/HeaderBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import ReportSelector from './components/ReportSelector';
import MetricsCards from './components/MetricsCards';
import InteractiveChart from './components/InteractiveChart';
import CustomReportPanel from './components/CustomReportPanel';
import AIInsightsPanel from './components/AIInsightsPanel';
import ScheduledReports from './components/ScheduledReports';

const FinancialReports = () => {
  const { user } = useAuth();
  const { currency, locale } = usePreferences();
  const [selectedReport, setSelectedReport] = useState('monthly-summary');
  const [isCustomReportOpen, setIsCustomReportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportContainerRef = useRef(null);
  
  // Real data states
  const [metricsData, setMetricsData] = useState([]);
  const [spendingData, setSpendingData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  // Add state for scheduled reports
  const [scheduledReports, setScheduledReports] = useState([]);
  // State for custom report data
  const [customReportData, setCustomReportData] = useState(null);
  
  // Fetch scheduled reports from database
  const fetchScheduledReports = async () => {
    try {
      const { data } = await supabase
        .from('scheduled_reports')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      setScheduledReports(data || []);
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
    }
  };
  
  // Handle adding new schedule
  const handleAddSchedule = async (schedule) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .insert({
          user_id: user.id,
          name: schedule.name,
          report_type: schedule.reportType,
          frequency: schedule.frequency,
          email: schedule.email,
          is_active: schedule.enabled,
          next_run: schedule.nextRun,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setScheduledReports(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding scheduled report:', error);
      setError('Failed to add scheduled report');
    }
  };
  
  // Handle editing schedule
  const handleEditSchedule = async (id) => {
    // Implement edit functionality
    console.log('Edit schedule:', id);
  };
  
  // Handle deleting schedule
  const handleDeleteSchedule = async (id) => {
    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setScheduledReports(prev => prev.filter(schedule => schedule.id !== id));
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      setError('Failed to delete scheduled report');
    }
  };
  
  // Fetch financial metrics
  const fetchMetrics = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // Get current month transactions
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('amount, transaction_type')
        .eq('user_id', user.id)
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      // Get last month transactions for comparison
      const { data: lastMonthTransactions } = await supabase
        .from('transactions')
        .select('amount, transaction_type')
        .eq('user_id', user.id)
        .gte('transaction_date', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${lastMonthYear}-${currentMonth.toString().padStart(2, '0')}-01`);

      // Calculate metrics
      const currentIncome = currentTransactions?.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
      const currentExpenses = currentTransactions?.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
      const lastMonthIncome = lastMonthTransactions?.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
      const lastMonthExpenses = lastMonthTransactions?.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome * 100) : 0;
      const incomeChange = lastMonthIncome > 0 ? ((currentIncome - lastMonthIncome) / lastMonthIncome * 100) : 0;
      const expenseChange = lastMonthExpenses > 0 ? ((currentExpenses - lastMonthExpenses) / lastMonthExpenses * 100) : 0;

      // Get budget data for variance calculation - using correct schema
      const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const endOfMonth = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`;
      
      const { data: activeBudgets } = await supabase
        .from('budgets')
        .select(`
          total_amount,
          budget_categories(
            allocated_amount
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .lte('start_date', startOfMonth)
        .gte('end_date', startOfMonth);

      const totalBudget = activeBudgets?.reduce((sum, budget) => {
        const categoryTotal = budget.budget_categories?.reduce((catSum, cat) => catSum + parseFloat(cat.allocated_amount), 0) || 0;
        return sum + categoryTotal;
      }, 0) || 0;
      
      const budgetVariance = totalBudget - currentExpenses;
      const budgetVariancePercent = totalBudget > 0 ? (budgetVariance / totalBudget * 100) : 0;

      setMetricsData([
        {
          id: 1,
          type: 'income',
          title: 'Total Income',
          value: `${formatCurrency(currentIncome, currency, locale)}`,
          subtitle: 'This month',
          change: `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}%`,
          trend: incomeChange >= 0 ? 'up' : 'down',
          progress: Math.min((currentIncome / (lastMonthIncome || 1)) * 100, 100)
        },
        {
          id: 2,
          type: 'expenses',
          title: 'Total Expenses',
          value: `${formatCurrency(currentExpenses, currency, locale)}`,
          subtitle: 'This month',
          change: `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%`,
          trend: expenseChange <= 0 ? 'up' : 'down'
        },
        {
          id: 3,
          type: 'savings',
          title: 'Savings Rate',
          value: `${savingsRate.toFixed(1)}%`,
          subtitle: 'Of total income',
          change: `${savingsRate >= 20 ? '+' : ''}${(savingsRate - 20).toFixed(1)}%`,
          trend: savingsRate >= 20 ? 'up' : 'down',
          progress: Math.min(savingsRate * 4, 100)
        },
        {
          id: 4,
          type: 'budget',
          title: 'Budget Variance',
          value: `${budgetVariance >= 0 ? '+' : ''}${formatCurrency(Math.abs(budgetVariance), currency, locale)}`,
          subtitle: budgetVariance >= 0 ? 'Under budget' : 'Over budget',
          change: `${budgetVariancePercent >= 0 ? '+' : ''}${budgetVariancePercent.toFixed(1)}%`,
          trend: budgetVariance >= 0 ? 'up' : 'down',
          progress: Math.min(Math.abs(budgetVariancePercent), 100)
        }
      ]);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load financial metrics');
    }
  };

  // Fetch spending analysis data
  const fetchSpendingData = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          amount,
          expense_categories(name)
        `)
        .eq('user_id', user.id)
        .eq('transaction_type', 'expense')
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      const categoryTotals = {};
      transactions?.forEach(transaction => {
        const categoryName = transaction.expense_categories?.name || 'Other';
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + parseFloat(transaction.amount);
      });

      const spendingArray = Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value: Math.round(value)
      })).sort((a, b) => b.value - a.value);

      setSpendingData(spendingArray);
    } catch (err) {
      console.error('Error fetching spending data:', err);
    }
  };

  // Fetch income trends data
  const fetchIncomeData = async () => {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const months = [];

      // Get last 8 months of data
      for (let i = 7; i >= 0; i--) {
        const date = new Date(currentYear, currentDate.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, transaction_type')
          .eq('user_id', user.id)
          .gte('transaction_date', `${year}-${month.toString().padStart(2, '0')}-01`)
          .lt('transaction_date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);

        const income = transactions?.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
        
        months.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          value: Math.round(income)
        });
      }

      setIncomeData(months);
    } catch (err) {
      console.error('Error fetching income data:', err);
    }
  };

  // Fetch budget performance data - completely rewritten to use correct schema
  const fetchBudgetData = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const endOfMonth = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`;
  
      // Get active budgets with better error handling
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          id,
          name,
          total_amount,
          budget_categories(
            allocated_amount,
            expense_categories(
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .lte('start_date', startOfMonth)
        .gte('end_date', startOfMonth);
  
      if (budgetError) {
        console.error('Budget fetch error:', budgetError);
        return;
      }
  
      const budgetPerformance = [];
      
      for (const budget of budgets || []) {
        for (const budgetCategory of budget.budget_categories || []) {
          if (!budgetCategory.expense_categories) continue;
          
          const categoryName = budgetCategory.expense_categories.name || 'Other';
          const categoryId = budgetCategory.expense_categories.id;
          
          // Get actual spending with better error handling
          const { data: transactions, error: transactionError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('transaction_type', 'expense')
            .eq('category_id', categoryId)
            .gte('transaction_date', startOfMonth)
            .lt('transaction_date', endOfMonth);
  
          if (transactionError) {
            console.error('Transaction fetch error:', transactionError);
            continue;
          }
  
          const actualSpent = transactions?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;
          
          budgetPerformance.push({
            name: categoryName,
            value: Math.round(actualSpent),
            budget: Math.round(parseFloat(budgetCategory.allocated_amount || 0))
          });
        }
      }
  
      setBudgetData(budgetPerformance);
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError('Failed to load budget performance data');
    }
  };

  // Generate AI insights based on real data
  const generateAIInsights = async () => {
    try {
      const insights = [];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Check for budget overruns
      for (const budget of budgetData) {
        if (budget.value > budget.budget) {
          const variance = ((budget.value - budget.budget) / budget.budget * 100).toFixed(1);
          insights.push({
            id: insights.length + 1,
            type: 'warning',
            title: `${budget.name} Budget Exceeded`,
            summary: `You've spent ${variance}% more than budgeted on ${budget.name.toLowerCase()} this month`,
            details: `Your ${budget.name.toLowerCase()} expenses have reached ${formatCurrency(budget.value, currency, locale)} this month, which is ${formatCurrency((budget.value - budget.budget), currency, locale)} over your ${formatCurrency(budget.budget, currency, locale)} budget.`,
            metrics: [
              { label: 'Budget', value: `${formatCurrency(budget.budget, currency, locale)}` },
              { label: 'Spent', value: `${formatCurrency(budget.value, currency, locale)}` },
              { label: 'Variance', value: `+${variance}%` }
            ],
            recommendations: [
              `Set up spending alerts for ${budget.name.toLowerCase()} category`,
              `Review and adjust your ${budget.name.toLowerCase()} budget for next month`,
              'Consider tracking daily expenses to stay within budget'
            ],
            actions: ['Set Alert', 'Adjust Budget', 'View Details']
          });
        }
      }

      // Check savings rate
      const savingsMetric = metricsData.find(m => m.type === 'savings');
      if (savingsMetric) {
        const savingsRate = parseFloat(savingsMetric.value);
        if (savingsRate >= 20) {
          insights.push({
            id: insights.length + 1,
            type: 'achievement',
            title: 'Excellent Savings Rate',
            summary: `Great job! You're saving ${savingsRate.toFixed(1)}% of your income`,
            details: `Your current savings rate of ${savingsRate.toFixed(1)}% exceeds the recommended 20% savings rate. This puts you on track for strong financial health.`,
            metrics: [
              { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%` },
              { label: 'Recommended', value: '20%' },
              { label: 'Above Target', value: `+${(savingsRate - 20).toFixed(1)}%` }
            ],
            recommendations: [
              'Consider increasing investment contributions',
              'Build up your emergency fund if not complete',
              'Maintain this excellent savings momentum'
            ],
            actions: ['Invest More', 'Set New Goal']
          });
        }
      }

      // Add generic insights if no specific ones found
      if (insights.length === 0) {
        insights.push({
          id: 1,
          type: 'recommendation',
          title: 'Track Your Progress',
          summary: 'Continue monitoring your financial health with regular check-ins',
          details: 'Your financial data shows steady progress. Keep tracking your expenses and income to maintain good financial habits.',
          metrics: [
            { label: 'Categories Tracked', value: spendingData.length.toString() },
            { label: 'This Month', value: new Date().toLocaleDateString('en-US', { month: 'long' }) }
          ],
          recommendations: [
            'Set up monthly budget reviews',
            'Consider automating savings transfers',
            'Track progress toward financial goals'
          ],
          actions: ['Learn More', 'Set Reminders']
        });
      }

      setAiInsights(insights);
    } catch (err) {
      console.error('Error generating AI insights:', err);
    }
  };

  // Load all data
  useEffect(() => {
    if (user?.id) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
          // Use Promise.allSettled instead of Promise.all to prevent hanging
          const results = await Promise.allSettled([
            fetchMetrics(),
            fetchSpendingData(),
            fetchIncomeData(),
            fetchBudgetData()
          ]);
          
          // Log any rejected promises for debugging
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              const functionNames = ['fetchMetrics', 'fetchSpendingData', 'fetchIncomeData', 'fetchBudgetData'];
              console.error(`${functionNames[index]} failed:`, result.reason);
            }
          });
          
        } catch (err) {
          console.error('Error loading financial reports data:', err);
          setError('Failed to load financial reports');
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Generate AI insights after data is loaded
  useEffect(() => {
    if (!loading && metricsData.length > 0 && budgetData.length > 0) {
      generateAIInsights();
    }
  }, [loading, metricsData, budgetData, spendingData]);

  const getChartData = () => {
    switch (selectedReport) {
      case 'spending-analysis':
        return spendingData;
      case 'budget-performance':
        return budgetData;
      case 'income-trends':
        return incomeData;
      default:
        return spendingData;
    }
  };

  const getChartTitle = () => {
    switch (selectedReport) {
      case 'monthly-summary':
        return 'Monthly Spending Overview';
      case 'spending-analysis':
        return 'Spending by Category';
      case 'budget-performance':
        return 'Budget vs Actual Spending';
      case 'goal-progress':
        return 'Financial Goals Progress';
      case 'income-trends':
        return 'Income Trends';
      case 'tax-summary':
        return 'Tax-Related Transactions';
      default:
        return 'Financial Overview';
    }
  };

  const getChartType = () => {
    switch (selectedReport) {
      case 'spending-analysis':
        return 'pie';
      case 'income-trends':
        return 'line';
      default:
        return 'bar';
    }
  };

  const handleCustomReportGenerate = async (config) => {
    try {
      setLoading(true);
      
      // Parse date range
      let startDate, endDate;
      const now = new Date();
      
      switch (config.dateRange) {
        case 'last-month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'last-quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart - 3, 1);
          endDate = new Date(now.getFullYear(), quarterStart, 0);
          break;
        case 'last-year':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear() - 1, 11, 31);
          break;
        case 'ytd':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        case 'custom':
          startDate = new Date(config.startDate);
          endDate = new Date(config.endDate);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
      }
      
      // Fetch custom data based on configuration
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          *,
          expense_categories(name),
          accounts(name, account_type)
        `)
        .eq('user_id', user.id)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])
        .in('category_id', config.categories.length > 0 ? config.categories : [])
        .in('account_id', config.accounts.length > 0 ? config.accounts : []);
      
      // Process and set custom report data
      const customData = processCustomReportData(transactions, config);
      
      // Update chart data and title
      setSelectedReport('custom');
      setCustomReportData(customData);
      
    } catch (error) {
      console.error('Error generating custom report:', error);
      setError('Failed to generate custom report');
    } finally {
      setLoading(false);
      
      // Auto-export PDF after generating custom report
      setTimeout(() => {
        handleExportPDF();
      }, 1500);
    }
  };
  
  const processCustomReportData = (transactions, config) => {
    // Process transactions based on selected chart types and options
    const processedData = {};
    
    config.chartTypes.forEach(chartType => {
      switch (chartType) {
        case 'spending-trends':
          processedData.spendingTrends = processSpendingTrends(transactions);
          break;
        case 'category-breakdown':
          processedData.categoryBreakdown = processCategoryBreakdown(transactions);
          break;
        case 'budget-comparison':
          if (config.includeBudget) {
            processedData.budgetComparison = processBudgetComparison(transactions);
          }
          break;
        case 'income-vs-expenses':
          processedData.incomeVsExpenses = processIncomeVsExpenses(transactions);
          break;
      }
    });
    
    return processedData;
  };

  // Helper function to process spending trends data
  const processSpendingTrends = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    
    const monthlyData = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income: 0,
          expenses: 0
        };
      }
      
      const amount = parseFloat(transaction.amount || 0);
      if (transaction.transaction_type === 'income') {
        monthlyData[monthKey].income += amount;
      } else if (transaction.transaction_type === 'expense') {
        monthlyData[monthKey].expenses += Math.abs(amount);
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      const aDate = new Date(a.month);
      const bDate = new Date(b.month);
      return aDate - bDate;
    });
  };

  // Helper function to process category breakdown data
  const processCategoryBreakdown = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    
    const categoryData = {};
    transactions.forEach(transaction => {
      if (transaction.transaction_type === 'expense') {
        const categoryName = transaction.expense_categories?.name || 'Other';
        const amount = Math.abs(parseFloat(transaction.amount || 0));
        
        categoryData[categoryName] = (categoryData[categoryName] || 0) + amount;
      }
    });
    
    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value: Math.round(value)
    })).sort((a, b) => b.value - a.value);
  };

  // Helper function to process budget comparison data
  const processBudgetComparison = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    
    const categoryData = {};
    transactions.forEach(transaction => {
      if (transaction.transaction_type === 'expense') {
        const categoryName = transaction.expense_categories?.name || 'Other';
        const amount = Math.abs(parseFloat(transaction.amount || 0));
        
        if (!categoryData[categoryName]) {
          categoryData[categoryName] = {
            name: categoryName,
            spent: 0,
            budget: 0 // Placeholder - would need actual budget data
          };
        }
        categoryData[categoryName].spent += amount;
      }
    });
    
    return Object.values(categoryData);
  };

  // Helper function to process income vs expenses data
  const processIncomeVsExpenses = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    
    const monthlyData = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income: 0,
          expenses: 0
        };
      }
      
      const amount = parseFloat(transaction.amount || 0);
      if (transaction.transaction_type === 'income') {
        monthlyData[monthKey].income += amount;
      } else if (transaction.transaction_type === 'expense') {
        monthlyData[monthKey].expenses += Math.abs(amount);
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      const aDate = new Date(a.month);
      const bDate = new Date(b.month);
      return aDate - bDate;
    });
  };

  const handleExportPDF = async () => {
    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf/dist/jspdf.es.min.js');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set initial y position
      let yPosition = 20;

      // Add header with logo and title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FinanceFlow', 105, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Financial Report', 105, yPosition, { align: 'center' });
      yPosition += 20;

      // Add report date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, yPosition, { align: 'center' });
      yPosition += 15;

      // Add metrics data
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Financial Metrics', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      metricsData.forEach(metric => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${metric.title}: ${metric.value} (${metric.change})`, 20, yPosition);
        yPosition += 8;
      });
      yPosition += 10;

      // Add spending analysis if available
      if (spendingData.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Spending by Category', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        spendingData.forEach((item, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`${index + 1}. ${item.name}: ${formatCurrency(item.value, currency, locale)}`, 20, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }

      // Add budget performance if available
      if (budgetData.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Budget Performance', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        budgetData.forEach((item, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          const variance = item.budget > 0 ? ((item.value - item.budget) / item.budget * 100).toFixed(1) : 0;
          const status = item.value <= item.budget ? 'Under Budget' : 'Over Budget';
          pdf.text(`${index + 1}. ${item.name}: ${formatCurrency(item.value, currency, locale)} / ${formatCurrency(item.budget, currency, locale)} (${variance}%, ${status})`, 20, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }

      // Add AI insights if available
      if (aiInsights.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Insights', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        aiInsights.forEach((insight, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`${index + 1}. ${insight.title}`, 20, yPosition);
          yPosition += 8;
          pdf.text(`   ${insight.summary}`, 20, yPosition);
          yPosition += 8;
        });
      }

      // Add footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Page ${i} of ${pageCount}`, 105, 280, { align: 'center' });
        pdf.text('Generated by FinanceFlow - Your Personal Financial Assistant', 105, 285, { align: 'center' });
      }

      pdf.save('financial-report.pdf');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      // Fallback to print dialog
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderBar />
        <main className="pt-16 pb-20 lg:pb-6 lg:pl-64">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading financial reports...</p>
              </div>
            </div>
          </div>
        </main>
        <BottomTabNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderBar />
        <main className="pt-16 pb-20 lg:pb-6 lg:pl-64">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
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
        <BottomTabNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar />
      <main className="pt-16 pb-20 lg:pb-6 lg:pl-64">
        <div ref={reportContainerRef} className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Report Selector */}
          <ReportSelector
            selectedReport={selectedReport}
            onReportChange={setSelectedReport}
            onCustomReportClick={() => setIsCustomReportOpen(true)}
            onExportPDF={handleExportPDF}
          />

          {/* Metrics Cards */}
          <div className="mt-6">
            <MetricsCards metrics={metricsData} />
          </div>

          {/* Main Chart */}
          <div className="mt-6">
            <InteractiveChart
              data={getChartData()}
              title={getChartTitle()}
              type={getChartType()}
            />
          </div>

          {/* Secondary Charts - Desktop Only */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-6 mt-6">
            <InteractiveChart
              data={incomeData}
              title="Income vs Expenses Trend"
              type="line"
            />
            <InteractiveChart
              data={budgetData}
              title="Budget Performance"
              type="bar"
            />
          </div>

          {/* AI Insights Panel */}
          <div className="mt-6">
            <AIInsightsPanel 
              insights={aiInsights} 
              onRefresh={generateAIInsights}
            />
          </div>

          {/* Scheduled Reports */}
          <div className="mt-6">
            <ScheduledReports
              scheduledReports={scheduledReports}
              onAddSchedule={handleAddSchedule}
              onEditSchedule={handleEditSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          </div>

          {/* Data Accuracy Footer */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Data last updated: {new Date()?.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>All amounts in USD</span>
                <span>•</span>
                <span>Transactions synced: {spendingData.reduce((sum, item) => sum + (item.value || 0), 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomTabNavigation />
      {/* Custom Report Panel */}
      <CustomReportPanel
        isOpen={isCustomReportOpen}
        onClose={() => setIsCustomReportOpen(false)}
        onGenerate={handleCustomReportGenerate}
      />
    </div>
  );
};

export default FinancialReports;
