export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  const numeric = typeof value === 'number' ? value : parseFloat(value || 0) || 0;
  try {
    return new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    // Fallback if currency code is unsupported in the runtime
    return `${currency || 'USD'} ${numeric.toLocaleString(locale || 'en-US')}`;
  }
}

// Convenience for non-React modules (e.g., services)
export function formatCurrencyFromPrefs(value) {
  let cur = 'USD';
  let loc = 'en-US';
  try { cur = localStorage.getItem('financeflow_currency') || cur; } catch {}
  try { loc = localStorage.getItem('financeflow_locale') || loc; } catch {}
  return formatCurrency(value, cur, loc);
}
