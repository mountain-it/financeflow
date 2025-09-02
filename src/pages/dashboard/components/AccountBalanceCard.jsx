import React from 'react';
import Icon from '../../../components/AppIcon';

const AccountBalanceCard = ({ balance, change, changeType }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 financial-shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Total Balance</h3>
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Wallet" size={20} className="text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-foreground">${balance?.toLocaleString()}</p>
        <div className="flex items-center space-x-2">
          <Icon 
            name={changeType === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
            size={16} 
            className={changeType === 'increase' ? 'text-success' : 'text-error'} 
          />
          <span className={`text-sm font-medium ${changeType === 'increase' ? 'text-success' : 'text-error'}`}>
            {changeType === 'increase' ? '+' : '-'}${Math.abs(change)?.toLocaleString()} this month
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountBalanceCard;