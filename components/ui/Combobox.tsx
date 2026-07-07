'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  id?: string;
  name?: string;
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/**
 * Combobox - Searchable select dropdown with autocomplete
 * 
 * Features:
 * - Type to search/filter options
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click outside to close
 * - Mobile-friendly touch interactions
 * - Displays selected value in input
 * - Hidden input for form submission
 */
export function Combobox({
  id,
  name,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'เลือกหรือค้นหา...',
  required,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || controlledValue || '');
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  // Update selectedValue when controlled value changes
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedValue(controlledValue);
    }
  }, [controlledValue]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    
    const query = searchQuery.toLowerCase().trim();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayValue = selectedOption ? selectedOption.label : '';

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setSearchQuery('');
    setOpen(false);
    onChange?.(optionValue);
  };

  // Handle input click - toggle dropdown
  const handleInputClick = () => {
    setOpen(!open);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  // Handle input change - open dropdown and filter
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setSearchQuery('');
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll highlighted option into view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={selectedValue}
        required={required}
      />

      {/* Display input with search */}
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={
          highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
        }
        value={open ? searchQuery : displayValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900',
          'placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'cursor-pointer'
        )}
      />

      {/* Dropdown icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className={cn(
            'h-5 w-5 text-gray-400 transition-transform duration-200',
            open && 'transform rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown list */}
      {open && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg',
            'max-h-60 overflow-auto',
            'py-1'
          )}
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500 text-center">
              ไม่พบข้อมูล
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option.value === selectedValue}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'px-3 py-2 text-sm cursor-pointer text-gray-900',
                  'hover:bg-blue-50 hover:text-gray-900',
                  option.value === selectedValue && 'bg-blue-100 font-medium text-gray-900',
                  highlightedIndex === index && 'bg-blue-50 text-gray-900'
                )}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
