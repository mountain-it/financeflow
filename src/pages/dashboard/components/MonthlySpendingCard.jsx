import React from 'react';
import Icon from '../../../components/AppIcon';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { formatCurrency } from '../../../utils/formatCurrency';

const MonthlySpendingCard = ({ spent, budget, categories }) => {
  const spentPercentage = (spent / budget) * 100;
  const { currency, locale } = usePreferences();
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 financial-shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Monthly Spending</h3>
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon name="CreditCard" size={20} className="text-accent" />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(spent, currency, locale)}</span>
            <span className="text-sm text-muted-foreground">of {formatCurrency(budget, currency, locale)}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${spentPercentage > 90 ? 'bg-error' : spentPercentage > 75 ? 'bg-warning' : 'bg-success'}`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-2">
          {categories?.slice(0, 3)?.map((category, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${category?.color}`}></div>
                <span className="text-muted-foreground">{category?.name}</span>
              </div>
              <span className="font-medium text-foreground">{formatCurrency(category?.amount, currency, locale)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlySpendingCard;
