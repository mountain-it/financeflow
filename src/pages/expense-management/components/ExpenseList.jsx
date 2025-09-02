import React from 'react';
import ExpenseCard from './ExpenseCard';

const ExpenseList = ({ expenses, onEditExpense, onDeleteExpense, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)]?.map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (expenses?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💸</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No expenses found</h3>
        <p className="text-muted-foreground">
          Start tracking your expenses by adding your first transaction.
        </p>
      </div>
    );
  }

  // Group expenses by date
  const groupedExpenses = expenses?.reduce((groups, expense) => {
    const date = new Date(expense.date)?.toDateString();
    if (!groups?.[date]) {
      groups[date] = [];
    }
    groups?.[date]?.push(expense);
    return groups;
  }, {});

  const formatGroupDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday?.setDate(yesterday?.getDate() - 1);

    if (date?.toDateString() === today?.toDateString()) {
      return 'Today';
    } else if (date?.toDateString() === yesterday?.toDateString()) {
      return 'Yesterday';
    } else {
      return date?.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: date?.getFullYear() !== today?.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const calculateDayTotal = (dayExpenses) => {
    return dayExpenses?.reduce((total, expense) => total + expense?.amount, 0);
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedExpenses)?.sort(([a], [b]) => new Date(b) - new Date(a))?.map(([date, dayExpenses]) => (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center justify-between px-1">
              <h3 className="font-medium text-foreground">
                {formatGroupDate(date)}
              </h3>
              <span className="text-sm font-medium text-destructive">
                -${calculateDayTotal(dayExpenses)?.toFixed(2)}
              </span>
            </div>

            {/* Expenses for this date */}
            <div className="space-y-3">
              {dayExpenses?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))?.map((expense) => (
                  <div key={expense?.id} className="group">
                    <ExpenseCard
                      expense={expense}
                      onEdit={onEditExpense}
                      onDelete={onDeleteExpense}
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ExpenseList;