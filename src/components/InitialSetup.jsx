import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import AddAccountModal from './modals/AddAccountModal';
import AddCategoryModal from './modals/AddCategoryModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const InitialSetup = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkExistingData();
  }, [user]);

  const checkExistingData = async () => {
    if (!user?.id) return;

    try {
      const [accountsResult, categoriesResult] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('expense_categories').select('*').eq('user_id', user.id)
      ]);

      setAccounts(accountsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (error) {
      console.error('Error checking existing data:', error);
    }
  };

  const handleAccountAdded = (account) => {
    setAccounts(prev => [...prev, account]);
  };

  const handleCategoryAdded = (category) => {
    setCategories(prev => [...prev, category]);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    // Mark setup as complete in user preferences
    try {
      await supabase
        .from('user_profiles')
        .update({ setup_completed: true })
        .eq('id', user.id);
      
      onComplete();
    } catch (error) {
      console.error('Error completing setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to FinanceFlow!
          </h1>
          <p className="text-muted-foreground">
            Let's set up your financial accounts and categories to get started.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Step 1: Add Accounts */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Add Your Financial Accounts
              </h2>
            </div>
            
            <p className="text-muted-foreground ml-11">
              Add your bank accounts, credit cards, and other financial accounts to track your money.
            </p>

            <div className="ml-11 space-y-3">
              {accounts.length > 0 && (
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <Icon name="CreditCard" size={16} className="text-primary" />
                      <span className="font-medium">{account.name}</span>
                      <span className="text-sm text-muted-foreground">({account.type})</span>
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setIsAccountModalOpen(true)}
                className="w-full"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Add Account
              </Button>
            </div>
          </div>

          {/* Step 2: Add Categories */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Customize Your Categories
              </h2>
            </div>
            
            <p className="text-muted-foreground ml-11">
              Create custom expense categories that match your spending habits.
            </p>

            <div className="ml-11 space-y-3">
              {categories.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <div key={category.id} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category.color }}
                      >
                        <Icon name={category.icon} size={12} className="text-white" />
                      </div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                  ))}
                  {categories.length > 6 && (
                    <div className="text-sm text-muted-foreground p-2">
                      +{categories.length - 6} more
                    </div>
                  )}
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setIsCategoryModalOpen(true)}
                className="w-full"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Add Category
              </Button>
            </div>
          </div>

          {/* Complete Setup */}
          <div className="pt-6 border-t border-border">
            <Button
              onClick={handleComplete}
              disabled={accounts.length === 0 || isLoading}
              className="w-full"
            >
              {isLoading ? 'Completing Setup...' : 'Complete Setup & Start Using FinanceFlow'}
            </Button>
            
            {accounts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please add at least one account to continue
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onAccountAdded={handleAccountAdded}
      />
      
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />
    </div>
  );
};

export default InitialSetup;