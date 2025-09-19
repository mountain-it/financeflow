import React, { createContext, useContext, useEffect, useMemo, useState, useLayoutEffect } from 'react';

const PreferencesContext = createContext(null);

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
};

export const PreferencesProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('financeflow_sidebar_collapsed');
      return stored === 'true';
    }
    return false;
  });
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('financeflow_currency') || 'USD';
    }
    return 'USD';
  });

  const [locale, setLocale] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('financeflow_locale') || navigator?.language || 'en-US';
    }
    return 'en-US';
  });

  useEffect(() => {
    try { localStorage.setItem('financeflow_currency', currency); } catch {}
  }, [currency]);

  useEffect(() => {
    try { localStorage.setItem('financeflow_locale', locale); } catch {}
  }, [locale]);

  // Persist sidebar preference and apply body class for layout padding override
  useLayoutEffect(() => {
    try { localStorage.setItem('financeflow_sidebar_collapsed', String(sidebarCollapsed)); } catch {}
    if (typeof document !== 'undefined') {
      const body = document.body;
      body.classList.toggle('sidebar-collapsed', !!sidebarCollapsed);
      body.classList.toggle('sidebar-expanded', !sidebarCollapsed);
    }
  }, [sidebarCollapsed]);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    locale,
    setLocale,
    sidebarCollapsed,
    setSidebarCollapsed,
  }), [currency, locale, sidebarCollapsed]);

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
