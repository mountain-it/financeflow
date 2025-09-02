import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const getCategoryIcon = (category) => {
    const icons = {
      food: 'UtensilsCrossed',
      transport: 'Car',
      shopping: 'ShoppingBag',
      entertainment: 'Film',
      bills: 'Receipt',
      healthcare: 'Heart',
      education: 'BookOpen',
      travel: 'Plane',
      other: 'MoreHorizontal'
    };
    return icons?.[category] || 'MoreHorizontal';
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: 'text-orange-500 bg-orange-50',
      transport: 'text-blue-500 bg-blue-50',
      shopping: 'text-purple-500 bg-purple-50',
      entertainment: 'text-pink-500 bg-pink-50',
      bills: 'text-red-500 bg-red-50',
      healthcare: 'text-green-500 bg-green-50',
      education: 'text-indigo-500 bg-indigo-50',
      travel: 'text-cyan-500 bg-cyan-50',
      other: 'text-gray-500 bg-gray-50'
    };
    return colors?.[category] || 'text-gray-500 bg-gray-50';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: 'Banknote',
      credit: 'CreditCard',
      debit: 'CreditCard',
      upi: 'Smartphone',
      bank_transfer: 'Building2'
    };
    return icons?.[method] || 'CreditCard';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday?.setDate(yesterday?.getDate() - 1);

    if (date?.toDateString() === today?.toDateString()) {
      return 'Today';
    } else if (date?.toDateString() === yesterday?.toDateString()) {
      return 'Yesterday';
    } else {
      return date?.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date?.getFullYear() !== today?.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleSwipeStart = (e) => {
    const startX = e?.touches?.[0]?.clientX;
    const card = e?.currentTarget;
    
    const handleSwipeMove = (e) => {
      const currentX = e?.touches?.[0]?.clientX;
      const diffX = startX - currentX;
      
      if (diffX > 50) {
        setShowActions(true);
      } else if (diffX < -50) {
        setShowActions(false);
      }
    };
    
    const handleSwipeEnd = () => {
      card?.removeEventListener('touchmove', handleSwipeMove);
      card?.removeEventListener('touchend', handleSwipeEnd);
    };
    
    card?.addEventListener('touchmove', handleSwipeMove);
    card?.addEventListener('touchend', handleSwipeEnd);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action Buttons (Hidden by default, shown on swipe) */}
      <div className={`absolute right-0 top-0 bottom-0 flex items-center space-x-2 px-4 bg-muted financial-transition ${
        showActions ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
          <Icon name="Edit" size={16} className="text-primary" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(expense?.id)}>
          <Icon name="Trash2" size={16} className="text-destructive" />
        </Button>
      </div>
      {/* Main Card */}
      <div
        className={`bg-card border border-border rounded-lg p-4 financial-shadow-card financial-transition ${
          showActions ? '-translate-x-20' : 'translate-x-0'
        }`}
        onTouchStart={handleSwipeStart}
        onClick={() => setShowActions(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Category Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(expense?.category)}`}>
              <Icon name={getCategoryIcon(expense?.category)} size={20} />
            </div>

            {/* Expense Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{expense?.description}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-muted-foreground capitalize">
                  {expense?.category?.replace('_', ' ')}
                </span>
                {expense?.paymentMethod && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center space-x-1">
                      <Icon name={getPaymentMethodIcon(expense?.paymentMethod)} size={12} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground capitalize">
                        {expense?.paymentMethod?.replace('_', ' ')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Amount and Date */}
          <div className="text-right">
            <p className="font-semibold text-foreground">
              -${expense?.amount?.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(expense?.date)}
            </p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex absolute top-4 right-4 opacity-0 group-hover:opacity-100 financial-transition">
          <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
            <Icon name="Edit" size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(expense?.id)}>
            <Icon name="Trash2" size={16} className="text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;