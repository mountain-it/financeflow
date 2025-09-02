-- Financial Data Schema Migration

-- 1. Create expense categories table
CREATE TABLE public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    description TEXT,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create accounts table (bank accounts, credit cards, etc.)
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'checking', 'savings', 'credit', 'investment'
    balance DECIMAL(12,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.expense_categories(id),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
    payment_method TEXT, -- 'cash', 'credit', 'debit', 'bank_transfer'
    transaction_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create budgets table
CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    period_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create budget categories table
CREATE TABLE public.budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE CASCADE,
    allocated_amount DECIMAL(12,2) NOT NULL,
    spent_amount DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create financial goals table
CREATE TABLE public.financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0.00,
    target_date DATE,
    goal_type TEXT NOT NULL, -- 'savings', 'debt_payoff', 'investment'
    is_achieved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create indexes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);

-- 8. Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
CREATE POLICY "users_manage_own_categories" ON public.expense_categories
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_accounts" ON public.accounts
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_transactions" ON public.transactions
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_budgets" ON public.budgets
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_budget_categories" ON public.budget_categories
FOR ALL USING (budget_id IN (SELECT id FROM public.budgets WHERE user_id = auth.uid()));

CREATE POLICY "users_manage_own_goals" ON public.financial_goals
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 10. Insert default categories
INSERT INTO public.expense_categories (name, icon, color, description, is_default) VALUES
('Food & Dining', 'Utensils', '#3B82F6', 'Restaurants, groceries, takeout', true),
('Transportation', 'Car', '#10B981', 'Gas, public transport, rideshare', true),
('Shopping', 'ShoppingBag', '#F59E0B', 'Clothing, electronics, misc purchases', true),
('Entertainment', 'Film', '#EF4444', 'Movies, games, subscriptions', true),
('Bills & Utilities', 'Zap', '#8B5CF6', 'Electricity, water, phone, internet', true),
('Healthcare', 'Heart', '#EC4899', 'Medical, dental, pharmacy', true),
('Education', 'BookOpen', '#06B6D4', 'Courses, books, training', true),
('Travel', 'Plane', '#84CC16', 'Flights, hotels, vacation expenses', true);