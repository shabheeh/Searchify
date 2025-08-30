
import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import type { Artist, Suggestion } from '../types';
import { ApiService } from '../services/apiServices';
import SuggestionsDropdown from './SuggestionsDropdown';


interface SearchBarProps {
  onArtistSelect: (artist: Artist) => void;
  onSearchResults: (artists: Artist[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onArtistSelect, onSearchResults }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const results = await ApiService.getSuggestions(searchQuery);
      setSuggestions(results);
      setShowSuggestions(true);
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedGetSuggestions(value);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setShowSuggestions(false);
    
    const results = await ApiService.searchArtists(query);
    onSearchResults(results);
    setIsLoading(false);
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    
    const artist = await ApiService.getArtist(suggestion._id);
    if (artist) {
      onArtistSelect(artist);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search for artists..."
            className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 focus:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          />
          
          <SuggestionsDropdown
            suggestions={suggestions}
            isVisible={showSuggestions}
            onSuggestionClick={handleSuggestionClick}
            onClose={() => setShowSuggestions(false)}
          />
        </div>
        
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Searching...
            </div>
          ) : (
            'Search'
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
