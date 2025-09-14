import React, { useState } from 'react';
import { Search, MapPin, Train } from 'lucide-react';
import { OpenRailwayMapAPI, RailwayFacility } from '../services/openRailwayMapApi';

interface RailwaySearchProps {
  onSearch: (query: string) => void;
  onFacilitySelect: (facility: RailwayFacility) => void;
}

export const RailwaySearch: React.FC<RailwaySearchProps> = ({ onSearch, onFacilitySelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<RailwayFacility[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const facilities = await OpenRailwayMapAPI.searchByQuery(searchQuery, 5);
      setSuggestions(facilities);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (facility: RailwayFacility) => {
    setQuery(facility.name);
    setShowSuggestions(false);
    onFacilitySelect(facility);
  };

  const getRailwayIcon = (type: string) => {
    switch (type) {
      case 'station':
      case 'halt':
        return <Train className="w-4 h-4" />;
      case 'junction':
      case 'yard':
        return <MapPin className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search railway stations, junctions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((facility) => (
            <div
              key={facility.osm_id}
              onClick={() => handleSuggestionClick(facility)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="text-gray-500">
                {getRailwayIcon(facility.railway)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{facility.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="capitalize">{facility.railway}</span>
                  {facility.operator && (
                    <>
                      <span>•</span>
                      <span className="truncate">{facility.operator}</span>
                    </>
                  )}
                </div>
              </div>
              {facility.rank && (
                <div className="text-xs text-gray-400">
                  Rank: {facility.rank}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RailwaySearch;
