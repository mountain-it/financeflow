import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationCard = ({ notifications }) => {
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());

  const getNotificationIcon = (type) => {
    const iconMap = {
      'budget_alert': 'AlertTriangle',
      'bill_reminder': 'Calendar',
      'goal_milestone': 'Trophy',
      'spending_limit': 'AlertCircle'
    };
    return iconMap?.[type] || 'Bell';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      'budget_alert': 'text-warning',
      'bill_reminder': 'text-primary',
      'goal_milestone': 'text-success',
      'spending_limit': 'text-error'
    };
    return colorMap?.[type] || 'text-muted-foreground';
  };

  const getNotificationBg = (type) => {
    const bgMap = {
      'budget_alert': 'bg-warning/10 border-warning/20',
      'bill_reminder': 'bg-primary/10 border-primary/20',
      'goal_milestone': 'bg-success/10 border-success/20',
      'spending_limit': 'bg-error/10 border-error/20'
    };
    return bgMap?.[type] || 'bg-muted/10 border-border';
  };

  const dismissNotification = (id) => {
    setDismissedNotifications(prev => new Set([...prev, id]));
  };

  const activeNotifications = notifications?.filter(n => !dismissedNotifications?.has(n?.id));

  if (activeNotifications?.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {activeNotifications?.map((notification) => (
        <div
          key={notification?.id}
          className={`border rounded-lg p-4 ${getNotificationBg(notification?.type)}`}
        >
          <div className="flex items-start space-x-3">
            <Icon 
              name={getNotificationIcon(notification?.type)} 
              size={20} 
              className={getNotificationColor(notification?.type)} 
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-1">{notification?.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{notification?.message}</p>
              {notification?.action && (
                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                  {notification?.action}
                  <Icon name="ArrowRight" size={14} className="ml-1" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => dismissNotification(notification?.id)}
            >
              <Icon name="X" size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCard;