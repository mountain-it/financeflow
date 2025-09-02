import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SearchBar = ({ onSearch, onFilterToggle, hasActiveFilters }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearch]);

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="flex items-center space-x-3 p-4 bg-background border-b border-border lg:bg-card lg:border lg:rounded-lg lg:mb-4">
      {/* Search Input */}
      <div className="flex-1 relative">
        <div className="relative">
          <Icon 
            name="Search" 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`w-full pl-10 pr-10 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent financial-transition ${
              isSearchFocused ? 'bg-background' : ''
            }`}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground financial-transition"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      </div>
      {/* Filter Button */}
      <Button
        variant={hasActiveFilters ? "default" : "outline"}
        size="icon"
        onClick={onFilterToggle}
        className="relative"
      >
        <Icon name="Filter" size={18} />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        )}
      </Button>
    </div>
  );
};

export default SearchBar;