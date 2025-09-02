import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const CustomReportPanel = ({ isOpen, onClose, onGenerate }) => {
  const [reportConfig, setReportConfig] = useState({
    name: '',
    dateRange: 'custom',
    startDate: '',
    endDate: '',
    categories: [],
    accounts: [],
    chartTypes: [],
    includeComparison: false,
    includeGoals: false,
    includeBudget: true
  });

  const categoryOptions = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'bills', label: 'Bills & Utilities' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'travel', label: 'Travel' }
  ];

  const accountOptions = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'investment', label: 'Investment Account' }
  ];

  const chartTypeOptions = [
    { value: 'spending-trends', label: 'Spending Trends' },
    { value: 'category-breakdown', label: 'Category Breakdown' },
    { value: 'budget-comparison', label: 'Budget Comparison' },
    { value: 'income-vs-expenses', label: 'Income vs Expenses' },
    { value: 'goal-progress', label: 'Goal Progress' }
  ];

  const dateRangeOptions = [
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-quarter', label: 'Last Quarter' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleInputChange = (field, value) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = () => {
    onGenerate(reportConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center">
        <div className="bg-card border border-border rounded-t-lg lg:rounded-lg w-full lg:max-w-2xl max-h-[90vh] overflow-y-auto financial-shadow-modal">
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Custom Report Builder</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Report Name */}
            <Input
              label="Report Name"
              placeholder="Enter report name"
              value={reportConfig?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              required
            />

            {/* Date Range */}
            <div className="space-y-4">
              <Select
                label="Date Range"
                options={dateRangeOptions}
                value={reportConfig?.dateRange}
                onChange={(value) => handleInputChange('dateRange', value)}
              />
              
              {reportConfig?.dateRange === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={reportConfig?.startDate}
                    onChange={(e) => handleInputChange('startDate', e?.target?.value)}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={reportConfig?.endDate}
                    onChange={(e) => handleInputChange('endDate', e?.target?.value)}
                  />
                </div>
              )}
            </div>

            {/* Categories */}
            <Select
              label="Categories"
              description="Select categories to include in the report"
              options={categoryOptions}
              value={reportConfig?.categories}
              onChange={(value) => handleInputChange('categories', value)}
              multiple
              searchable
              clearable
            />

            {/* Accounts */}
            <Select
              label="Accounts"
              description="Select accounts to include in the report"
              options={accountOptions}
              value={reportConfig?.accounts}
              onChange={(value) => handleInputChange('accounts', value)}
              multiple
              clearable
            />

            {/* Chart Types */}
            <Select
              label="Chart Types"
              description="Select visualizations to include"
              options={chartTypeOptions}
              value={reportConfig?.chartTypes}
              onChange={(value) => handleInputChange('chartTypes', value)}
              multiple
              searchable
            />

            {/* Additional Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Additional Options</h4>
              
              <Checkbox
                label="Include Budget Comparison"
                description="Compare actual spending with budgeted amounts"
                checked={reportConfig?.includeBudget}
                onChange={(e) => handleInputChange('includeBudget', e?.target?.checked)}
              />
              
              <Checkbox
                label="Include Goal Progress"
                description="Show progress towards financial goals"
                checked={reportConfig?.includeGoals}
                onChange={(e) => handleInputChange('includeGoals', e?.target?.checked)}
              />
              
              <Checkbox
                label="Include Year-over-Year Comparison"
                description="Compare with same period from previous year"
                checked={reportConfig?.includeComparison}
                onChange={(e) => handleInputChange('includeComparison', e?.target?.checked)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-2 p-4 lg:p-6 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleGenerate}
              iconName="BarChart3"
              iconPosition="left"
              className="w-full sm:w-auto"
              disabled={!reportConfig?.name}
            >
              Generate Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomReportPanel;