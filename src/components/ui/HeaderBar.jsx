import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';
import ThemeToggle from './ThemeToggle';
import { usePreferences } from '../../contexts/PreferencesContext';

const HeaderBar = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = usePreferences();
  const { signOut, user, userProfile } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Budget Alert',
      message: 'You\'ve spent 85% of your monthly dining budget',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      type: 'success',
      title: 'Goal Achieved',
      message: 'Emergency fund goal reached! $5,000 saved',
      time: '1 day ago',
      unread: true
    },
    {
      id: 3,
      type: 'info',
      title: 'Bill Reminder',
      message: 'Credit card payment due in 3 days',
      time: '2 days ago',
      unread: false
    }
  ]);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const unreadCount = notifications?.filter(n => n?.unread)?.length;

  // Derived user display info
  const displayName = (
    userProfile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'User')
  );
  const displayEmail = userProfile?.email || user?.email || '';
  const initials = (() => {
    const nameSource = userProfile?.full_name || user?.user_metadata?.full_name || '';
    if (nameSource) {
      const parts = nameSource.trim().split(/\s+/).filter(Boolean);
      return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || 'U';
    }
    return user?.email ? user.email[0]?.toUpperCase() : 'U';
  })();

  const getPageTitle = () => {
    switch (location?.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/expense-management':
        return 'Expense Management';
      case '/budget-planning':
        return 'Budget Planning';
      case '/financial-reports':
        return 'Financial Reports';
      case '/ai-financial-assistant':
        return 'AI Financial Assistant';
      case '/profile-settings':
        return 'Profile & Settings';
      default:
        return 'FinanceFlow';
    }
  };

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev => 
      prev?.map(n => 
        n?.id === notificationId ? { ...n, unread: false } : n
      )
    );
  };

  const handleUserMenuClick = async (action) => {
    setIsUserMenuOpen(false);
    if (action === 'profile') {
      navigate('/profile-settings');
    } else if (action === 'login') {
      navigate('/login');
    } else if (action === 'logout') {
      try {
        const { error } = await signOut();
        if (error) {
          console.error('Sign out error:', error);
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Sign out failed:', err);
      }
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event?.target?.closest('.notification-dropdown') && !event?.target?.closest('.notification-trigger')) {
        setIsNotificationOpen(false);
      }
      if (!event?.target?.closest('.user-menu-dropdown') && !event?.target?.closest('.user-menu-trigger')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return 'AlertTriangle';
      case 'success':
        return 'CheckCircle';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-warning';
      case 'success':
        return 'text-success';
      case 'info':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-card border-b border-border financial-shadow-card">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          {/* Desktop sidebar toggle */}
          <button
            className="hidden lg:inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted financial-transition border border-border"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name={sidebarCollapsed ? 'ChevronsRight' : 'ChevronsLeft'} size={18} />
          </button>
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Icon name="TrendingUp" size={20} color="white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-foreground">FinanceFlow</h1>
          </div>
        </div>

        {/* Page Title - Hidden on mobile */}
        <div className="hidden md:block">
          <h2 className="text-lg font-medium text-foreground">{getPageTitle()}</h2>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Search - Context sensitive */}
          {location?.pathname === '/expense-management' && (
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Icon name="Search" size={20} />
            </Button>
          )}

          {/* Global Theme Toggle */}
          <ThemeToggle size="sm" />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="notification-trigger relative"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Icon name="Bell" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg financial-shadow-modal z-30">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-popover-foreground">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications?.map((notification) => (
                    <div
                      key={notification?.id}
                      className={`p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted financial-transition ${
                        notification?.unread ? 'bg-muted/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification?.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon 
                          name={getNotificationIcon(notification?.type)} 
                          size={16} 
                          className={getNotificationColor(notification?.type)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm text-popover-foreground truncate">
                              {notification?.title}
                            </p>
                            {notification?.unread && (
                              <div className="w-2 h-2 bg-primary rounded-full ml-2 flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification?.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification?.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="user-menu-trigger rounded-full"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">{initials}</span>
              </div>
            </Button>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <div className="user-menu-dropdown absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg financial-shadow-modal z-25">
                <div className="p-3 border-b border-border">
                  <p className="font-medium text-sm text-popover-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>
                <div className="py-1">
                  {user ? (
                    <>
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted financial-transition flex items-center space-x-2"
                        onClick={() => handleUserMenuClick('profile')}
                      >
                        <Icon name="User" size={16} />
                        <span>Profile & Settings</span>
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted financial-transition flex items-center space-x-2"
                        onClick={() => handleUserMenuClick('help')}
                      >
                        <Icon name="HelpCircle" size={16} />
                        <span>Help & Support</span>
                      </button>
                      <div className="border-t border-border my-1"></div>
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted financial-transition flex items-center space-x-2"
                        onClick={() => handleUserMenuClick('logout')}
                      >
                        <Icon name="LogOut" size={16} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted financial-transition flex items-center space-x-2"
                        onClick={() => handleUserMenuClick('login')}
                      >
                        <Icon name="LogIn" size={16} />
                        <span>Sign In</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
