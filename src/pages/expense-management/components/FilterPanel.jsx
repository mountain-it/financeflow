import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange, onApplyFilters, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const categories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'bills', label: 'Bills & Utilities' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'travel', label: 'Travel' },
    { value: 'other', label: 'Other' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'debit', label: 'Debit Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategoryToggle = (category) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev?.categories?.includes(category)
        ? prev?.categories?.filter(c => c !== category)
        : [...prev?.categories, category]
    }));
  };

  const handlePaymentMethodToggle = (method) => {
    setLocalFilters(prev => ({
      ...prev,
      paymentMethods: prev?.paymentMethods?.includes(method)
        ? prev?.paymentMethods?.filter(m => m !== method)
        : [...prev?.paymentMethods, method]
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      dateRange: '',
      startDate: '',
      endDate: '',
      categories: [],
      paymentMethods: [],
      minAmount: '',
      maxAmount: ''
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end lg:items-center lg:justify-center">
      <div className="bg-card w-full lg:w-96 lg:rounded-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Filter Expenses</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Date Range */}
          <div>
            <Select
              label="Date Range"
              placeholder="Select date range"
              options={dateRanges}
              value={localFilters?.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
            />
            
            {localFilters?.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={localFilters?.startDate}
                  onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={localFilters?.endDate}
                  onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
                />
              </div>
            )}
          </div>

          {/* Amount Range */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Amount Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Amount"
                type="number"
                placeholder="0.00"
                value={localFilters?.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e?.target?.value)}
                step="0.01"
              />
              <Input
                label="Max Amount"
                type="number"
                placeholder="1000.00"
                value={localFilters?.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e?.target?.value)}
                step="0.01"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Categories</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categories?.map((category) => (
                <Checkbox
                  key={category?.value}
                  label={category?.label}
                  checked={localFilters?.categories?.includes(category?.value)}
                  onChange={() => handleCategoryToggle(category?.value)}
                />
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Payment Methods</h3>
            <div className="space-y-2">
              {paymentMethods?.map((method) => (
                <Checkbox
                  key={method?.value}
                  label={method?.label}
                  checked={localFilters?.paymentMethods?.includes(method?.value)}
                  onChange={() => handlePaymentMethodToggle(method?.value)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClear} fullWidth>
              Clear All
            </Button>
            <Button onClick={handleApply} fullWidth>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;