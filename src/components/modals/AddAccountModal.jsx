import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AddAccountModal = ({ isOpen, onClose, onAccountAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    balance: '',
    currency: 'USD'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'investment', label: 'Investment Account' }
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: account, error: insertError } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: formData.name,
          type: formData.type,
          balance: parseFloat(formData.balance) || 0,
          currency: formData.currency
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onAccountAdded(account);
      setFormData({ name: '', type: '', balance: '', currency: 'USD' });
      onClose();
    } catch (err) {
      console.error('Error adding account:', err);
      setError('Failed to add account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center lg:justify-center">
      <div className="bg-card w-full lg:w-96 lg:rounded-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add Account</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Name"
              type="text"
              placeholder="e.g., Main Checking, Savings Account"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />

            <Select
              label="Account Type"
              placeholder="Select account type"
              options={accountTypes}
              value={formData.type}
              onChange={(value) => handleInputChange('type', value)}
              required
            />

            <Input
              label="Initial Balance"
              type="number"
              placeholder="0.00"
              value={formData.balance}
              onChange={(e) => handleInputChange('balance', e.target.value)}
              step="0.01"
            />

            <Select
              label="Currency"
              placeholder="Select currency"
              options={currencies}
              value={formData.currency}
              onChange={(value) => handleInputChange('currency', value)}
            />

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button type="submit" fullWidth disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;