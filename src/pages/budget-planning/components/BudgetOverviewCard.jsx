import React from 'react';
import Icon from '../../../components/AppIcon';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { formatCurrency } from '../../../utils/formatCurrency';

const BudgetOverviewCard = ({ totalBudget, totalSpent, remainingBudget, budgetPeriod }) => {
  const { currency, locale } = usePreferences();
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remainingPercentage = 100 - spentPercentage;

  const getStatusColor = () => {
    if (spentPercentage >= 90) return 'text-error';
    if (spentPercentage >= 75) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = () => {
    if (spentPercentage >= 90) return 'bg-error';
    if (spentPercentage >= 75) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 financial-shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Budget Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} />
          <span>{budgetPeriod}</span>
        </div>
      </div>
      <div className="space-y-4">
        {/* Total Budget */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Budget</span>
          <span className="text-lg font-semibold text-foreground">{formatCurrency(totalBudget, currency, locale)}</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className={`font-medium ${getStatusColor()}`}>
              {formatCurrency(totalSpent, currency, locale)} ({spentPercentage?.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className={`h-3 rounded-full financial-transition ${getProgressColor()}`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Remaining</span>
          <span className={`text-lg font-semibold ${remainingBudget >= 0 ? 'text-success' : 'text-error'}`}>
            {formatCurrency(Math.abs(remainingBudget), currency, locale)}
            {remainingBudget < 0 && ' over budget'}
          </span>
        </div>

        {/* Status Indicator */}
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          spentPercentage >= 90 ? 'bg-error/10 text-error' :
          spentPercentage >= 75 ? 'bg-warning/10 text-warning': 'bg-success/10 text-success'
        }`}>
          <Icon 
            name={spentPercentage >= 90 ? 'AlertTriangle' : spentPercentage >= 75 ? 'AlertCircle' : 'CheckCircle'} 
            size={16} 
          />
          <span className="text-sm font-medium">
            {spentPercentage >= 90 ? 'Budget Alert: Spending limit reached' :
             spentPercentage >= 75 ? 'Warning: Approaching budget limit': 'Budget on track'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverviewCard;
