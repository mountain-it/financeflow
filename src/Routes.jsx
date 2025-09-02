import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import NotFound from "pages/NotFound";
import FinancialReports from './pages/financial-reports';
import Dashboard from './pages/dashboard';
import ExpenseManagement from './pages/expense-management';
import AIFinancialAssistant from './pages/ai-financial-assistant';
import BudgetPlanning from './pages/budget-planning';
import ProfileSettings from './pages/profile-settings';
import LoginRegistration from './pages/login-registration';
import AdminDashboard from './pages/admin-dashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <ScrollToTop />
            <RouterRoutes>
              {/* Define your route here */}
              <Route path="/" element={<AIFinancialAssistant />} />
              <Route path="/financial-reports" element={<FinancialReports />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expense-management" element={<ExpenseManagement />} />
              <Route path="/ai-financial-assistant" element={<AIFinancialAssistant />} />
              <Route path="/budget-planning" element={<BudgetPlanning />} />
              <Route path="/profile-settings" element={<ProfileSettings />} />
              <Route path="/login" element={<LoginRegistration />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </RouterRoutes>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;