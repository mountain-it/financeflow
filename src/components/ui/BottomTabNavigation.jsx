import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { usePreferences } from '../../contexts/PreferencesContext';

const BottomTabNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      badge: null
    },
    {
      label: 'Expenses',
      path: '/expense-management',
      icon: 'Receipt',
      badge: null
    },
    {
      label: 'Budget',
      path: '/budget-planning',
      icon: 'PieChart',
      badge: null
    },
    {
      label: 'Reports',
      path: '/financial-reports',
      icon: 'BarChart3',
      badge: null
    },
    {
      label: 'AI Assistant',
      path: '/ai-financial-assistant',
      icon: 'Bot',
      badge: 2
    }
  ];

  const handleTabClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  const { sidebarCollapsed, setSidebarCollapsed } = usePreferences();

  const sidebarWidthClass = sidebarCollapsed ? 'w-20' : 'w-64';
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-card border-t border-border financial-shadow-card">
        <div className="flex items-center justify-around h-20 px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleTabClick(item?.path)}
              className={`flex flex-col items-center justify-center space-y-1 px-2 py-2 rounded-lg financial-transition min-w-0 flex-1 ${
                isActive(item?.path)
                  ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className="relative">
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  className={isActive(item?.path) ? 'text-primary' : 'text-current'}
                />
                {item?.badge && (
                  <span className="absolute -top-2 -right-2 bg-error text-error-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {item?.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium truncate max-w-full ${
                isActive(item?.path) ? 'text-primary' : 'text-current'
              }`}>
                {item?.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
      {/* Desktop Sidebar Navigation */}
      <nav className={`hidden lg:flex fixed left-0 top-16 bottom-0 ${sidebarWidthClass} bg-card border-r border-border z-10 flex-col financial-transition`}
        style={{ width: sidebarCollapsed ? '5rem' : '16rem' }}
      >
        <div className="flex-1 py-6">
          <div className="px-2 space-y-2">
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleTabClick(item?.path)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg financial-transition text-left ${
                  isActive(item?.path)
                    ? 'text-primary bg-primary/10 border border-primary/20' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <div className="relative">
                  <Icon 
                    name={item?.icon} 
                    size={20} 
                    className={isActive(item?.path) ? 'text-primary' : 'text-current'}
                  />
                  {item?.badge && (
                    <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {item?.badge}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <span className={`font-medium ${
                    isActive(item?.path) ? 'text-primary' : 'text-current'
                  }`}>
                    {item?.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="TrendingUp" size={16} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">FinanceFlow</p>
                  <p className="text-xs text-muted-foreground">Personal Finance</p>
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="px-3 py-2 rounded-md hover:bg-muted financial-transition border border-border"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <Icon name={sidebarCollapsed ? 'ChevronsRight' : 'ChevronsLeft'} size={18} />
            </button>
          </div>
        </div>
      </nav>
      {/* Spacer for mobile bottom navigation */}
      <div className="lg:hidden h-20"></div>
      {/* Spacer for desktop sidebar */}
      <div className={`hidden lg:block ${sidebarWidthClass}`} style={{ width: sidebarCollapsed ? '5rem' : '16rem' }}></div>
    </>
  );
};

export default BottomTabNavigation;
