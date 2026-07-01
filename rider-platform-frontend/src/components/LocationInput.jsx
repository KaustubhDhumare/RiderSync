// src/components/LocationInput.jsx
import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import axios from 'axios'; // 🔴 1. Import Axios

const LocationInput = ({ label, placeholder, onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce the search so we don't spam the free API
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2 && showDropdown) {
        setIsSearching(true);
        try {
          // 🔴 2. Cleaner Axios GET request with params object
          const res = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
              format: 'json',
              q: query,
              limit: 5
            }
          });
          
          // Axios automatically parses JSON into res.data
          setSuggestions(res.data);
        } catch (error) {
          console.error("Geocoding error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500); // Wait 500ms after they stop typing

    return () => clearTimeout(delayDebounceFn);
  }, [query, showDropdown]);

  const handleSelect = (place) => {
    // Format the display name to be shorter (usually City, State)
    const shortName = place.display_name.split(',').slice(0, 3).join(',');
    
    setQuery(shortName);
    setShowDropdown(false);
    
    // Send the exact data structure your backend schema demands
    onLocationSelect({
      name: shortName,
      coords: {
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon)
      }
    });
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-textMuted mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-textMuted" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:outline-none transition-colors"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-surface border border-surface/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((place, idx) => (
            <li 
              key={idx}
              onClick={() => handleSelect(place)}
              className="px-4 py-3 hover:bg-background cursor-pointer text-sm text-textMain border-b border-surface/50 last:border-0 transition-colors"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationInput;