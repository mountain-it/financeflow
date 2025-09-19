import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { currencyOptions as appCurrencyOptions } from '../../../utils/currencies';

const PreferencesSettings = ({ isExpanded, onToggle, preferencesData, onPreferencesUpdate }) => {
  const [preferences, setPreferences] = useState(preferencesData);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'CHF', label: 'Swiss Franc (CHF)' },
    { value: 'CNY', label: 'Chinese Yuan (¥)' },
    { value: 'INR', label: 'Indian Rupee (₹)' }
  ];

  // Use centralized currency list for consistency across the app
  const extendedCurrencyOptions = appCurrencyOptions;

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European Format)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Format)' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY (e.g., 29 Aug 2025)' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'zh', label: '中文' },
    { value: 'ja', label: '日本語' }
  ];

  const numberFormatOptions = [
    { value: '1,000.00', label: '1,000.00 (US Format)' },
    { value: '1.000,00', label: '1.000,00 (European Format)' },
    { value: '1 000,00', label: '1 000,00 (French Format)' },
    { value: '1,000', label: '1,000 (No Decimals)' }
  ];

  const handlePreferenceChange = (key, value) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
    onPreferencesUpdate(updatedPreferences);
  };

  const handleToggleChange = (key, checked) => {
    const updatedPreferences = { ...preferences, [key]: checked };
    setPreferences(updatedPreferences);
    onPreferencesUpdate(updatedPreferences);
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement?.classList?.toggle('dark');
  };

  const notificationPreferences = [
    {
      id: 'budgetAlerts',
      title: 'Budget Alerts',
      description: 'Get notified when you approach or exceed budget limits',
      example: 'You\'ve spent 85% of your dining budget this month',
      enabled: preferences?.notifications?.budgetAlerts ?? true
    },
    {
      id: 'billReminders',
      title: 'Bill Reminders',
      description: 'Receive reminders for upcoming bill payments',
      example: 'Credit card payment due in 3 days - $1,250.00',
      enabled: preferences?.notifications?.billReminders ?? true
    },
    {
      id: 'goalProgress',
      title: 'Goal Progress',
      description: 'Updates on your financial goal achievements',
      example: 'Congratulations! You\'ve reached your emergency fund goal',
      enabled: preferences?.notifications?.goalProgress ?? true
    },
    {
      id: 'aiInsights',
      title: 'AI Financial Insights',
      description: 'Personalized recommendations and spending insights',
      example: 'You could save $200/month by reducing subscription services',
      enabled: preferences?.notifications?.aiInsights ?? true
    },
    {
      id: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Summary of your weekly financial activity',
      example: 'Your weekly spending summary is ready to view',
      enabled: preferences?.notifications?.weeklyReports ?? false
    },
    {
      id: 'securityAlerts',
      title: 'Security Alerts',
      description: 'Important security and login notifications',
      example: 'New login detected from Chrome on Windows',
      enabled: preferences?.notifications?.securityAlerts ?? true
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg financial-shadow-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 financial-transition"
      >
        <div className="flex items-center space-x-3">
          <Icon name="Settings" size={20} className="text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Preferences</h3>
            <p className="text-sm text-muted-foreground">Currency, date format, notifications, and display settings</p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-border">
          {/* Display Settings */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Display Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Currency"
                options={extendedCurrencyOptions}
                value={preferences?.currency}
                onChange={(value) => handlePreferenceChange('currency', value)}
              />
              <Select
                label="Date Format"
                options={dateFormatOptions}
                value={preferences?.dateFormat}
                onChange={(value) => handlePreferenceChange('dateFormat', value)}
              />
              <Select
                label="Language"
                options={languageOptions}
                value={preferences?.language}
                onChange={(value) => handlePreferenceChange('language', value)}
              />
              <Select
                label="Number Format"
                options={numberFormatOptions}
                value={preferences?.numberFormat}
                onChange={(value) => handlePreferenceChange('numberFormat', value)}
              />
            </div>
          </div>

          {/* Theme Settings */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Theme Settings</h4>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name={isDarkMode ? "Moon" : "Sun"} size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isDarkMode}
                  onChange={handleDarkModeToggle}
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Notification Preferences</h4>
            <div className="space-y-4">
              {notificationPreferences?.map((notification) => (
                <div key={notification?.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-foreground">{notification?.title}</h5>
                        {notification?.enabled && (
                          <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                            Enabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification?.description}</p>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Example: {notification?.example}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notification?.enabled}
                        onChange={(e) => handleToggleChange(`notifications.${notification?.id}`, e?.target?.checked)}
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Preferences */}
          <div className="border-t border-border pt-6">
            <h4 className="font-medium text-foreground mb-4">Advanced Preferences</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Auto-categorize Transactions</p>
                  <p className="text-sm text-muted-foreground">Automatically categorize new transactions using AI</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={preferences?.autoCategorize ?? true}
                    onChange={(e) => handleToggleChange('autoCategorize', e?.target?.checked)}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Smart Budget Suggestions</p>
                  <p className="text-sm text-muted-foreground">Receive AI-powered budget optimization recommendations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={preferences?.smartSuggestions ?? true}
                    onChange={(e) => handleToggleChange('smartSuggestions', e?.target?.checked)}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Data Analytics</p>
                  <p className="text-sm text-muted-foreground">Allow anonymous usage data to improve the service</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={preferences?.analytics ?? false}
                    onChange={(e) => handleToggleChange('analytics', e?.target?.checked)}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
          </div>
        </div>
        {/* Save Actions */}
        <div className="border-t border-border pt-6 flex justify-end">
          <Button
            variant="default"
            onClick={() => onPreferencesUpdate(preferences)}
            iconName="Save"
            iconPosition="left"
          >
            Save Changes
          </Button>
        </div>
      </div>
    )}
  </div>
);
};

export default PreferencesSettings;
