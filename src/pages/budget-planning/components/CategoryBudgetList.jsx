import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { formatCurrency } from '../../../utils/formatCurrency';

const CategoryBudgetList = ({ categories, onEditCategory, onDeleteCategory }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const { currency, locale } = usePreferences();

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded?.has(categoryId)) {
      newExpanded?.delete(categoryId);
    } else {
      newExpanded?.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-error';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-primary';
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 100) return 'AlertTriangle';
    if (percentage >= 75) return 'AlertCircle';
    return 'CheckCircle';
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'text-error';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="bg-card rounded-lg border border-border financial-shadow-card">
      <div className="p-4 lg:p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Budget Categories</h3>
        <p className="text-sm text-muted-foreground mt-1">Track spending across different categories</p>
      </div>
      <div className="divide-y divide-border">
        {categories?.map((category) => {
          const spentPercentage = category?.allocated > 0 ? (category?.spent / category?.allocated) * 100 : 0;
          const isExpanded = expandedCategories?.has(category?.id);

          return (
            <div key={category?.id} className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category?.color + '20' }}
                  >
                    <Icon name={category?.icon} size={20} style={{ color: category?.color }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{category?.name}</h4>
                    <p className="text-sm text-muted-foreground">{category?.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={getStatusIcon(spentPercentage)} 
                    size={16} 
                    className={getStatusColor(spentPercentage)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleCategory(category?.id)}
                    className="lg:hidden"
                  >
                    <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
                  </Button>
                </div>
              </div>
              {/* Progress and amounts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(category?.spent, currency, locale)} of {formatCurrency(category?.allocated, currency, locale)}
                  </span>
                  <span className={`font-medium ${getStatusColor(spentPercentage)}`}>
                    {spentPercentage?.toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full financial-transition ${getProgressColor(spentPercentage)}`}
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Remaining: {formatCurrency(Math.max(0, category?.allocated - category?.spent), currency, locale)}
                  </span>
                  {spentPercentage > 100 && (
                    <span className="text-error font-medium">
                      {formatCurrency((category?.spent - category?.allocated), currency, locale)} over
                    </span>
                  )}
                </div>
              </div>
              {/* Expanded details for mobile or always visible on desktop */}
              <div className={`mt-4 space-y-3 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
                {/* Recent transactions */}
                {category?.recentTransactions && category?.recentTransactions?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2">Recent Transactions</h5>
                    <div className="space-y-2">
                      {category?.recentTransactions?.slice(0, 3)?.map((transaction) => (
                        <div key={transaction?.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground truncate">{transaction?.description}</span>
                          <span className="text-foreground font-medium">{formatCurrency(transaction?.amount, currency, locale)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCategory(category?.id)}
                    iconName="Edit2"
                    iconPosition="left"
                    iconSize={14}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteCategory(category?.id)}
                    iconName="Trash2"
                    iconPosition="left"
                    iconSize={14}
                    className="text-error hover:text-error"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBudgetList;
