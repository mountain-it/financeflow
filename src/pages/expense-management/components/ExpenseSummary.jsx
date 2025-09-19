import React from 'react';
import Icon from '../../../components/AppIcon';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { formatCurrency } from '../../../utils/formatCurrency';

const ExpenseSummary = ({ expenses, filteredExpenses, filters }) => {
  const calculateTotals = (expenseList) => {
    const total = expenseList?.reduce((sum, expense) => sum + expense?.amount, 0);
    const count = expenseList?.length;
    const average = count > 0 ? total / count : 0;
    
    return { total, count, average };
  };

  const { total, count, average } = calculateTotals(filteredExpenses);
  const { total: allTimeTotal } = calculateTotals(expenses);
  const { currency, locale } = usePreferences();

  const getCategoryBreakdown = () => {
    const breakdown = filteredExpenses?.reduce((acc, expense) => {
      acc[expense.category] = (acc?.[expense?.category] || 0) + expense?.amount;
      return acc;
    }, {});

    return Object.entries(breakdown)?.sort(([,a], [,b]) => b - a)?.slice(0, 3);
  };

  const topCategories = getCategoryBreakdown();

  const hasActiveFilters = filters?.categories?.length > 0 || 
                          filters?.paymentMethods?.length > 0 || 
                          filters?.dateRange || 
                          filters?.minAmount || 
                          filters?.maxAmount;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4 financial-shadow-card">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Amount */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-1">
            <Icon name="DollarSign" size={16} className="text-destructive" />
            <span className="text-sm font-medium text-muted-foreground">
              {hasActiveFilters ? 'Filtered' : 'Total'} Spent
            </span>
          </div>
          <p className="text-xl font-bold text-destructive">
            {formatCurrency(total, currency, locale)}
          </p>
        </div>

        {/* Transaction Count */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-1">
            <Icon name="Receipt" size={16} className="text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Transactions</span>
          </div>
          <p className="text-xl font-bold text-foreground">{count}</p>
        </div>

        {/* Average Amount */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-1">
            <Icon name="TrendingUp" size={16} className="text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Average</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(average, currency, locale)}
          </p>
        </div>

        {/* Top Category or All Time Total */}
        <div className="text-center lg:text-left">
          {hasActiveFilters ? (
            <>
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-1">
                <Icon name="PieChart" size={16} className="text-secondary" />
                <span className="text-sm font-medium text-muted-foreground">Top Category</span>
              </div>
              <p className="text-sm font-bold text-foreground capitalize">
                {topCategories?.length > 0 ? topCategories?.[0]?.[0]?.replace('_', ' ') : 'None'}
              </p>
              {topCategories?.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(topCategories?.[0]?.[1], currency, locale)}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-1">
                <Icon name="Calendar" size={16} className="text-warning" />
                <span className="text-sm font-medium text-muted-foreground">All Time</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(allTimeTotal, currency, locale)}
              </p>
            </>
          )}
        </div>
      </div>
      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={14} className="text-primary" />
            <span className="text-sm text-primary font-medium">
              Filters applied - showing {count} of {expenses?.length} transactions
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseSummary;
