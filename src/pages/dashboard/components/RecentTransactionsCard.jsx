import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { formatCurrency } from '../../../utils/formatCurrency';

const RecentTransactionsCard = ({ transactions, onViewAll }) => {
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Food & Dining': 'Utensils',
      'Transportation': 'Car',
      'Shopping': 'ShoppingBag',
      'Entertainment': 'Film',
      'Bills & Utilities': 'Receipt',
      'Healthcare': 'Heart',
      'Income': 'TrendingUp',
      'Transfer': 'ArrowRightLeft'
    };
    return iconMap?.[category] || 'DollarSign';
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const { currency, locale } = usePreferences();
  return (
    <div className="bg-card border border-border rounded-lg p-6 financial-shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </div>
      <div className="space-y-3">
        {transactions?.map((transaction, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted financial-transition">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              transaction?.type === 'income' ? 'bg-success/10' : 'bg-muted'
            }`}>
              <Icon 
                name={getCategoryIcon(transaction?.category)} 
                size={16} 
                className={transaction?.type === 'income' ? 'text-success' : 'text-muted-foreground'} 
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{transaction?.description}</p>
              <p className="text-sm text-muted-foreground">{transaction?.category}</p>
            </div>
            
            <div className="text-right">
              <p className={`font-semibold ${
                transaction?.type === 'income' ? 'text-success' : 'text-foreground'
              }`}>
                {transaction?.type === 'income' ? '+' : '-'}{formatCurrency(transaction?.amount, currency, locale)}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(transaction?.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactionsCard;
