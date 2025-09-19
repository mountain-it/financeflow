import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { formatCurrency } from '../../../utils/formatCurrency';

const CreateBudgetModal = ({ isOpen, onClose, onSave, editingBudget = null }) => {
  const { currency, locale } = usePreferences();
  const [currentStep, setCurrentStep] = useState(1);
  const [budgetData, setBudgetData] = useState({
    name: '',
    period: 'monthly',
    totalIncome: '',
    categories: []
  });

  const [availableCategories] = useState([
    { id: 1, name: 'Housing', icon: 'Home', color: '#3B82F6', suggestedPercentage: 30 },
    { id: 2, name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#10B981', suggestedPercentage: 15 },
    { id: 3, name: 'Transportation', icon: 'Car', color: '#F59E0B', suggestedPercentage: 15 },
    { id: 4, name: 'Utilities', icon: 'Zap', color: '#EF4444', suggestedPercentage: 10 },
    { id: 5, name: 'Healthcare', icon: 'Heart', color: '#8B5CF6', suggestedPercentage: 8 },
    { id: 6, name: 'Entertainment', icon: 'Film', color: '#EC4899', suggestedPercentage: 5 },
    { id: 7, name: 'Shopping', icon: 'ShoppingBag', color: '#06B6D4', suggestedPercentage: 7 },
    { id: 8, name: 'Savings', icon: 'PiggyBank', color: '#84CC16', suggestedPercentage: 10 }
  ]);

  const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    if (editingBudget) {
      setBudgetData({
        name: editingBudget?.name || '',
        period: editingBudget?.period || 'monthly',
        totalIncome: editingBudget?.totalIncome?.toString() || '',
        categories: editingBudget?.categories || []
      });
    } else {
      setBudgetData({
        name: '',
        period: 'monthly',
        totalIncome: '',
        categories: []
      });
    }
    setCurrentStep(1);
  }, [editingBudget, isOpen]);

  const handleInputChange = (field, value) => {
    setBudgetData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryAllocation = (categoryId, amount) => {
    setBudgetData(prev => ({
      ...prev,
      categories: prev?.categories?.map(cat => 
        cat?.id === categoryId ? { ...cat, allocated: parseFloat(amount) || 0 } : cat
      )
    }));
  };

  const addCategory = (category) => {
    const suggestedAmount = budgetData?.totalIncome ? 
      (parseFloat(budgetData?.totalIncome) * category?.suggestedPercentage / 100) : 0;

    setBudgetData(prev => ({
      ...prev,
      categories: [...prev?.categories, {
        ...category,
        allocated: suggestedAmount,
        spent: 0
      }]
    }));
  };

  const removeCategory = (categoryId) => {
    setBudgetData(prev => ({
      ...prev,
      categories: prev?.categories?.filter(cat => cat?.id !== categoryId)
    }));
  };

  const getTotalAllocated = () => {
    return budgetData?.categories?.reduce((sum, cat) => sum + (cat?.allocated || 0), 0);
  };

  const getRemainingBudget = () => {
    const totalIncome = parseFloat(budgetData?.totalIncome) || 0;
    return totalIncome - getTotalAllocated();
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    const finalBudgetData = {
      ...budgetData,
      totalIncome: parseFloat(budgetData?.totalIncome) || 0,
      id: editingBudget?.id || Date.now(),
      createdAt: editingBudget?.createdAt || new Date()?.toISOString(),
      updatedAt: new Date()?.toISOString()
    };
    
    onSave(finalBudgetData);
    onClose();
  };

  const canProceedStep1 = budgetData?.name?.trim() && budgetData?.totalIncome && parseFloat(budgetData?.totalIncome) > 0;
  const canProceedStep2 = budgetData?.categories?.length > 0;
  const canSave = canProceedStep1 && canProceedStep2 && Math.abs(getRemainingBudget()) < 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-lg border border-border financial-shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {editingBudget ? 'Edit Budget' : 'Create New Budget'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Basic Information' :
                currentStep === 2 ? 'Category Selection': 'Budget Allocation'
              }
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 lg:px-6 py-3 bg-muted/50">
          <div className="flex items-center space-x-2">
            {[1, 2, 3]?.map((step) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step < currentStep ? <Icon name="Check" size={16} /> : step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 rounded-full ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                label="Budget Name"
                type="text"
                placeholder="e.g., Monthly Budget 2024"
                value={budgetData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                required
              />
              
              <Select
                label="Budget Period"
                options={periodOptions}
                value={budgetData?.period}
                onChange={(value) => handleInputChange('period', value)}
              />

              <Input
                label="Total Income"
                type="number"
                placeholder="Enter your total income"
                value={budgetData?.totalIncome}
                onChange={(e) => handleInputChange('totalIncome', e?.target?.value)}
                required
                description="This will be used to suggest category allocations"
              />

              {budgetData?.totalIncome && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Lightbulb" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-primary">AI Suggestion</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on your income of ${parseFloat(budgetData?.totalIncome)?.toLocaleString()}, 
                    we'll suggest optimal category allocations following the 50/30/20 rule.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Select Budget Categories</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose the categories you want to track in your budget
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableCategories?.map((category) => {
                  const isSelected = budgetData?.categories?.some(cat => cat?.id === category?.id);
                  
                  return (
                    <div
                      key={category?.id}
                      className={`p-4 rounded-lg border cursor-pointer financial-transition ${
                        isSelected 
                          ? 'border-primary bg-primary/10' :'border-border hover:border-primary/50'
                      }`}
                      onClick={() => isSelected ? removeCategory(category?.id) : addCategory(category)}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: category?.color + '20' }}
                        >
                          <Icon name={category?.icon} size={20} style={{ color: category?.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{category?.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Suggested: {category?.suggestedPercentage}% 
                            {budgetData?.totalIncome && ` ($${(parseFloat(budgetData?.totalIncome) * category?.suggestedPercentage / 100)?.toLocaleString()})`}
                          </p>
                        </div>
                        <Icon 
                          name={isSelected ? 'CheckCircle' : 'Circle'} 
                          size={20} 
                          className={isSelected ? 'text-primary' : 'text-muted-foreground'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {budgetData?.categories?.length > 0 && (
                <div className="p-4 bg-success/10 rounded-lg">
                  <p className="text-sm text-success">
                    {budgetData?.categories?.length} categories selected. 
                    You can adjust allocations in the next step.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Allocate Budget</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adjust the amount allocated to each category
                </p>
              </div>

              {/* Budget Summary */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Income</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(parseFloat(budgetData?.totalIncome) || 0, currency, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Allocated</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(getTotalAllocated() || 0, currency, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className={`text-sm font-semibold ${
                      getRemainingBudget() >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {formatCurrency(Math.abs(getRemainingBudget()) || 0, currency, locale)}
                      {getRemainingBudget() < 0 && ' over'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Allocations */}
              <div className="space-y-3">
                {budgetData?.categories?.map((category) => (
                  <div key={category?.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category?.color + '20' }}
                      >
                        <Icon name={category?.icon} size={16} style={{ color: category?.color }} />
                      </div>
                      <span className="font-medium text-foreground">{category?.name}</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={category?.allocated || ''}
                      onChange={(e) => handleCategoryAllocation(category?.id, e?.target?.value)}
                      className="text-right"
                    />
                  </div>
                ))}
              </div>

              {Math.abs(getRemainingBudget()) >= 1 && (
                <div className={`p-4 rounded-lg ${
                  getRemainingBudget() > 0 ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertTriangle" size={16} />
                    <span className="text-sm font-medium">
                      {getRemainingBudget() > 0 
                        ? `You have ${formatCurrency(getRemainingBudget(), currency, locale)} unallocated`
                        : `You're over budget by ${formatCurrency(Math.abs(getRemainingBudget()), currency, locale)}`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
            iconName={currentStep === 1 ? 'X' : 'ChevronLeft'}
            iconPosition="left"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <div className="flex items-center space-x-2">
            {currentStep < 3 ? (
              <Button
                variant="default"
                onClick={handleNext}
                disabled={currentStep === 1 ? !canProceedStep1 : !canProceedStep2}
                iconName="ChevronRight"
                iconPosition="right"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleSave}
                disabled={!canSave}
                iconName="Save"
                iconPosition="left"
              >
                {editingBudget ? 'Update Budget' : 'Create Budget'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBudgetModal;
