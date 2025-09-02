import React from 'react';
import { Moon, Sun, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

const ThemeToggle = ({ className = '', size = 'default', showLabel = false }) => {
  const { theme, toggleTheme, loading } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5',
    default: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Button
      onClick={toggleTheme}
      disabled={loading}
      className={`
        ${sizeClasses?.[size]}
        rounded-full 
        bg-white dark:bg-gray-800 
        shadow-lg hover:shadow-xl 
        border border-gray-200 dark:border-gray-700
        transition-all duration-300
        ${showLabel ? 'flex items-center gap-2 px-4 rounded-lg' : ''}
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {loading ? (
        <Loader2 className={`${iconSizes?.[size]} animate-spin text-gray-600 dark:text-gray-400`} />
      ) : theme === 'light' ? (
        <Moon className={`${iconSizes?.[size]} text-gray-600 hover:text-gray-800`} />
      ) : (
        <Sun className={`${iconSizes?.[size]} text-yellow-400 hover:text-yellow-300`} />
      )}
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === 'light' ? 'Dark' : 'Light'} Mode
        </span>
      )}
    </Button>
  );
};

export default ThemeToggle;