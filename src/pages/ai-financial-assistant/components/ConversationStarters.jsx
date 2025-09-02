import React from 'react';
import Icon from '../../../components/AppIcon';

const ConversationStarters = ({ onStarterClick, isVisible }) => {
  const starters = [
    {
      id: 1,
      icon: 'PieChart',
      title: 'Budget Optimization',
      description: 'Help me optimize my monthly budget',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 2,
      icon: 'TrendingDown',
      title: 'Spending Analysis',
      description: 'Analyze my spending patterns',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      id: 3,
      icon: 'Target',
      title: 'Goal Planning',
      description: 'Set up financial goals',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      id: 4,
      icon: 'Bell',
      title: 'Bill Reminders',
      description: 'Manage upcoming bills',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      id: 5,
      icon: 'CreditCard',
      title: 'Expense Tracking',
      description: 'Track recent expenses',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      id: 6,
      icon: 'TrendingUp',
      title: 'Investment Advice',
      description: 'Get investment recommendations',
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          How can I help you today?
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose a topic to get started or ask me anything about your finances
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {starters?.map((starter) => (
          <button
            key={starter?.id}
            onClick={() => onStarterClick(starter)}
            className="flex items-start space-x-3 p-4 rounded-xl border border-border hover:border-primary/30 bg-card hover:bg-muted/30 financial-transition text-left group"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${starter?.bgColor} flex items-center justify-center group-hover:scale-105 financial-transition`}>
              <Icon name={starter?.icon} size={20} className={starter?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground group-hover:text-primary financial-transition">
                {starter?.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {starter?.description}
              </p>
            </div>
            <Icon 
              name="ArrowRight" 
              size={16} 
              className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 financial-transition" 
            />
          </button>
        ))}
      </div>
      <div className="bg-muted/30 rounded-xl p-4 border border-border">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Icon name="Info" size={16} color="white" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm text-foreground mb-1">
              AI Financial Assistant
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              I can help you with budget planning, expense analysis, financial goals, and personalized recommendations based on your spending patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationStarters;