import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onCreateBudget, onAddExpense, onSetGoal, onViewReports }) => {
  const quickActions = [
    {
      id: 'create-budget',
      title: 'Create Budget',
      description: 'Set up a new budget plan',
      icon: 'PlusCircle',
      color: 'bg-primary',
      textColor: 'text-primary-foreground',
      onClick: onCreateBudget
    },
    {
      id: 'add-expense',
      title: 'Add Expense',
      description: 'Record a new expense',
      icon: 'Receipt',
      color: 'bg-accent',
      textColor: 'text-accent-foreground',
      onClick: onAddExpense
    },
    {
      id: 'set-goal',
      title: 'Set Goal',
      description: 'Create financial goal',
      icon: 'Target',
      color: 'bg-success',
      textColor: 'text-success-foreground',
      onClick: onSetGoal
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Check spending analysis',
      icon: 'BarChart3',
      color: 'bg-warning',
      textColor: 'text-warning-foreground',
      onClick: onViewReports
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 financial-shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions?.map((action) => (
          <Button
            key={action?.id}
            variant="ghost"
            className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted financial-transition"
            onClick={action?.onClick}
          >
            <div className={`w-12 h-12 rounded-lg ${action?.color} flex items-center justify-center`}>
              <Icon name={action?.icon} size={24} className={action?.textColor} />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground text-sm">{action?.title}</p>
              <p className="text-xs text-muted-foreground">{action?.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;