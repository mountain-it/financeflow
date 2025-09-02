import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const QuickActionsCard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Add Expense",
      description: "Record a new transaction",
      icon: "Plus",
      color: "bg-primary",
      textColor: "text-primary-foreground",
      action: () => navigate('/expense-management')
    },
    {
      title: "View Budget",
      description: "Check budget status",
      icon: "PieChart",
      color: "bg-accent",
      textColor: "text-accent-foreground",
      action: () => navigate('/budget-planning')
    },
    {
      title: "Set Goal",
      description: "Create financial goal",
      icon: "Target",
      color: "bg-success",
      textColor: "text-success-foreground",
      action: () => navigate('/budget-planning')
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 financial-shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickActions?.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted"
            onClick={action?.action}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action?.color}`}>
              <Icon name={action?.icon} size={20} className={action?.textColor} />
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

export default QuickActionsCard;