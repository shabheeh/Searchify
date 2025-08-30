import React, { useEffect, useRef } from 'react';
import type { Suggestion } from '../types';


interface SuggestionsDropdownProps {
  suggestions: Suggestion[];
  isVisible: boolean;
  onSuggestionClick: (suggestion: Suggestion) => void;
  onClose: () => void;
}

const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({
  suggestions,
  isVisible,
  onSuggestionClick,
  onClose
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion._id}
          onClick={() => onSuggestionClick(suggestion)}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-left duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
            <img
              src={suggestion.profilePicture || '/api/placeholder/40/40'}
              alt={suggestion.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white font-medium">{suggestion.name}</span>
        </div>
      ))}
    </div>
  );
};

export default SuggestionsDropdown;
