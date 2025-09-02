import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AddExpenseModal = ({ isOpen, onClose, onAddExpense }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    paymentMethod: '',
    date: new Date()?.toISOString()?.split('T')?.[0],
    receipt: null
  });
  const [activeTab, setActiveTab] = useState('manual');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReceiptUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        receipt: file
      }));
      
      // Simulate OCR processing
      setIsProcessing(true);
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          amount: '45.99',
          description: 'Grocery Store Purchase',
          category: 'food'
        }));
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData?.amount || !formData?.description || !formData?.category) {
      return;
    }

    const newExpense = {
      id: Date.now(),
      amount: parseFloat(formData?.amount),
      description: formData?.description,
      category: formData?.category,
      paymentMethod: formData?.paymentMethod,
      date: formData?.date,
      timestamp: new Date()?.toISOString()
    };

    onAddExpense(newExpense);
    setFormData({
      amount: '',
      description: '',
      category: '',
      paymentMethod: '',
      date: new Date()?.toISOString()?.split('T')?.[0],
      receipt: null
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center lg:justify-center">
      <div className="bg-card w-full lg:w-96 lg:rounded-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add Expense</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium financial-transition ${
              activeTab === 'manual' ?'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('manual')}
          >
            Manual Entry
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium financial-transition ${
              activeTab === 'receipt' ?'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('receipt')}
          >
            Scan Receipt
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'manual' ? (
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
                <Button type="button" variant="outline" onClick={onClose} fullWidth>
                  Cancel
                </Button>
                <Button type="submit" fullWidth>
                  Add Expense
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Receipt Upload */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <Icon name="Camera" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Tap to capture or upload receipt
                  </p>
                  <p className="text-xs text-muted-foreground">
                    We'll automatically extract expense details
                  </p>
                </label>
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Processing receipt...</span>
                  </div>
                </div>
              )}

              {formData?.receipt && !isProcessing && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Icon name="CheckCircle" size={16} className="text-success" />
                      <span className="text-sm font-medium text-success">Receipt processed successfully!</span>
                    </div>
                  </div>

                  <Input
                    label="Amount"
                    type="number"
                    value={formData?.amount}
                    onChange={(e) => handleInputChange('amount', e?.target?.value)}
                    required
                    step="0.01"
                  />

                  <Input
                    label="Description"
                    type="text"
                    value={formData?.description}
                    onChange={(e) => handleInputChange('description', e?.target?.value)}
                    required
                  />

                  <Select
                    label="Category"
                    options={categories}
                    value={formData?.category}
                    onChange={(value) => handleInputChange('category', value)}
                    required
                  />

                  <div className="flex space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} fullWidth>
                      Cancel
                    </Button>
                    <Button type="submit" fullWidth>
                      Add Expense
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;