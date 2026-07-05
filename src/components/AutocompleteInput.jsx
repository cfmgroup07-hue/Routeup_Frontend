import React, { useState, useRef, useEffect, useMemo } from 'react';
import './AutocompleteInput.css';

const AutocompleteInput = ({
  id,
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);

  const suggestions = useMemo(() => {
    const query = (value || '').trim().toLowerCase();
    const labels = options.map((opt) => opt.label || opt.value);

    if (!query) return labels.slice(0, 12);

    return labels.filter((label) => label.toLowerCase().includes(query)).slice(0, 12);
  }, [options, value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e);
    setIsOpen(true);
    setHighlightIndex(-1);
  };

  const selectSuggestion = (label) => {
    onChange({ target: { id, value: label } });
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0 && suggestions[highlightIndex]) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div className={`autocomplete-container ${disabled ? 'disabled' : ''}`} ref={containerRef}>
      <input
        type="text"
        id={id}
        className="autocomplete-input"
        value={value}
        onChange={handleInputChange}
        onFocus={() => !disabled && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
      />

      {isOpen && !disabled && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`autocomplete-option ${highlightIndex === index ? 'highlighted' : ''} ${value === label ? 'selected' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectSuggestion(label)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
