import React from 'react';
import Icon from '../../../components/AppIcon';

const BudgetProgressCard = ({ budgets }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 financial-shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Budget Progress</h3>
        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
          <Icon name="Target" size={20} className="text-secondary" />
        </div>
      </div>
      <div className="space-y-4">
        {budgets?.map((budget, index) => {
          const percentage = (budget?.spent / budget?.limit) * 100;
          const isOverBudget = percentage > 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name={budget?.icon} size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{budget?.category}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ${budget?.spent?.toLocaleString()} / ${budget?.limit?.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${isOverBudget ? 'bg-error' : percentage > 75 ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              {isOverBudget && (
                <p className="text-xs text-error">Over budget by ${(budget?.spent - budget?.limit)?.toLocaleString()}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetProgressCard;