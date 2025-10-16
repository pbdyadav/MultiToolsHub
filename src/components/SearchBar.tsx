import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { allTools } from '../data/tools';
import { Tool } from '../types/tools';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  onResults?: (tools: Tool[]) => void;
}

export function SearchBar({ onResults }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const filteredTools = query.length > 0 
    ? allTools.filter(tool =>
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        tool.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  React.useEffect(() => {
    if (onResults) {
      onResults(filteredTools);
    }
  }, [filteredTools, onResults]);

  const handleToolSelect = (tool: Tool) => {
    navigate(tool.path);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for tools..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(e.target.value.length > 0);
          }}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          onFocus={() => setShowResults(query.length > 0)}
        />
      </div>
      
      {showResults && filteredTools.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-96 overflow-y-auto">
          {filteredTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
            >
              <div className="font-medium text-gray-900">{tool.name}</div>
              <div className="text-sm text-gray-600">{tool.description}</div>
              <div className="text-xs text-blue-600 mt-1">{tool.category}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}