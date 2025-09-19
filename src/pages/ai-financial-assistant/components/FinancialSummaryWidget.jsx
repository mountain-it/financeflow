import React from 'react';
import Icon from '../../../components/AppIcon';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

const FinancialSummaryWidget = ({ isVisible }) => {
  const navigate = useNavigate();
  const summaryData = {
    monthlyBudget: 3500,
    spent: 2847,
    remaining: 653,
    savingsGoal: 1000,
    savedThisMonth: 750,
    upcomingBills: [
      { name: 'Credit Card', amount: 450, dueDate: '2025-09-05' },
      { name: 'Utilities', amount: 180, dueDate: '2025-09-08' },
      { name: 'Internet', amount: 79, dueDate: '2025-09-12' }
    ],
    topCategories: [
      { name: 'Food & Dining', amount: 680, percentage: 24 },
      { name: 'Transportation', amount: 520, percentage: 18 },
      { name: 'Shopping', amount: 445, percentage: 16 }
    ]
  };

  const spentPercentage = (summaryData?.spent / summaryData?.monthlyBudget) * 100;
  const savingsPercentage = (summaryData?.savedThisMonth / summaryData?.savingsGoal) * 100;
  const { currency, locale } = usePreferences();

  if (!isVisible) return null;

  return (
    <div className="hidden lg:block w-72 xl:w-80 border-l border-border bg-card p-6 space-y-6 overflow-y-auto flex-shrink-0">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Financial Summary</h3>
        <p className="text-sm text-muted-foreground">Your current financial overview</p>
      </div>
      {/* Budget Overview */}
      <div className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-foreground">Monthly Budget</h4>
            <Icon name="PieChart" size={16} className="text-primary" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Spent</span>
              <span className="font-semibold text-foreground">{formatCurrency(summaryData?.spent, currency, locale)}</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${spentPercentage > 90 ? 'bg-error' : spentPercentage > 75 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <span className={`font-semibold ${summaryData?.remaining < 0 ? 'text-error' : 'text-success'}`}>
                {formatCurrency(Math.abs(summaryData?.remaining), currency, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Goal */}
        <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-accent">Savings Goal</h4>
            <Icon name="Target" size={16} className="text-accent" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="font-semibold text-accent">{formatCurrency(summaryData?.savedThisMonth, currency, locale)}</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-accent"
                style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Goal</span>
              <span className="font-semibold text-accent">{formatCurrency(summaryData?.savingsGoal, currency, locale)}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Upcoming Bills */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-foreground flex items-center space-x-2">
          <Icon name="Bell" size={16} className="text-warning" />
          <span>Upcoming Bills</span>
        </h4>
        
        <div className="space-y-2">
          {summaryData?.upcomingBills?.map((bill, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{bill?.name}</p>
                <p className="text-xs text-muted-foreground">
                  Due {new Date(bill.dueDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <span className="font-semibold text-sm text-foreground">{formatCurrency(bill?.amount, currency, locale)}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Top Spending Categories */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-foreground flex items-center space-x-2">
          <Icon name="BarChart3" size={16} className="text-secondary" />
          <span>Top Categories</span>
        </h4>
        
        <div className="space-y-2">
          {summaryData?.topCategories?.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{category?.name}</span>
                <span className="font-medium text-sm text-foreground">{formatCurrency(category?.amount, currency, locale)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full bg-secondary"
                  style={{ width: `${category?.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-foreground">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate('/expense-management')}
            className="p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border financial-transition text-left"
          >
            <Icon name="Plus" size={16} className="text-primary mb-1" />
            <p className="text-xs font-medium text-foreground">Add Expense</p>
          </button>
          <button
            onClick={() => navigate('/budget-planning')}
            className="p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border financial-transition text-left"
          >
            <Icon name="Target" size={16} className="text-accent mb-1" />
            <p className="text-xs font-medium text-foreground">Set Goal</p>
          </button>
          <button
            onClick={() => navigate('/financial-reports')}
            className="p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border financial-transition text-left"
          >
            <Icon name="BarChart3" size={16} className="text-secondary mb-1" />
            <p className="text-xs font-medium text-foreground">View Reports</p>
          </button>
          <button
            onClick={() => navigate('/profile-settings')}
            className="p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border financial-transition text-left"
          >
            <Icon name="Settings" size={16} className="text-muted-foreground mb-1" />
            <p className="text-xs font-medium text-foreground">Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryWidget;
