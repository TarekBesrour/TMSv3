import React, { useState } from 'react';
import { Search, Command } from 'lucide-react';
import { Input } from '../ui/input';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ placeholder = "Rechercher...", className = "" }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Recherche:', searchValue);
  };

  return (
    <form onSubmit={handleSearch} className={`relative flex-1 max-w-lg ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-12 bg-muted/50 border-border focus:bg-background transition-colors"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <kbd className="inline-flex h-5 max-h-full items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <Command className="h-3 w-3" />
            <span>K</span>
          </kbd>
        </div>
      </div>
    </form>
  );
}