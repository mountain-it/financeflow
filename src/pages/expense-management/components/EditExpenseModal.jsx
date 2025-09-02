import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const EditExpenseModal = ({ isOpen, expense, onClose, onUpdateExpense, onDeleteExpense }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    paymentMethod: '',
    date: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense?.amount?.toString(),
        description: expense?.description,
        category: expense?.category,
        paymentMethod: expense?.paymentMethod || '',
        date: expense?.date
      });
    }
  }, [expense]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData?.amount || !formData?.description || !formData?.category) {
      return;
    }

    const updatedExpense = {
      ...expense,
      amount: parseFloat(formData?.amount),
      description: formData?.description,
      category: formData?.category,
      paymentMethod: formData?.paymentMethod,
      date: formData?.date
    };

    onUpdateExpense(updatedExpense);
    onClose();
  };

  const handleDelete = () => {
    onDeleteExpense(expense?.id);
    onClose();
    setShowDeleteConfirm(false);
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center lg:justify-center">
      <div className="bg-card w-full lg:w-96 lg:rounded-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Edit Expense</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {showDeleteConfirm ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Trash2" size={24} className="text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Expense?</h3>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. The expense will be permanently removed from your records.
              </p>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  fullWidth
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                value={formData?.amount}
                onChange={(e) => handleInputChange('amount', e?.target?.value)}
                required
                step="0.01"
              />

              <Input
                label="Description"
                type="text"
                placeholder="What did you spend on?"
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                required
              />

              <Select
                label="Category"
                placeholder="Select category"
                options={categories}
                value={formData?.category}
                onChange={(value) => handleInputChange('category', value)}
                required
              />

              <Select
                label="Payment Method"
                placeholder="How did you pay?"
                options={paymentMethods}
                value={formData?.paymentMethod}
                onChange={(value) => handleInputChange('paymentMethod', value)}
              />

              <Input
                label="Date"
                type="date"
                value={formData?.date}
                onChange={(e) => handleInputChange('date', e?.target?.value)}
                required
              />

              <div className="flex space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                  iconName="Trash2"
                  iconPosition="left"
                  fullWidth
                >
                  Delete
                </Button>
                <Button type="submit" fullWidth>
                  Update
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;