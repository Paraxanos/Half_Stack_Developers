'use client';

import { useState } from 'react';
import { FiFilter, FiChevronDown, FiX, FiCheck, FiTrendingUp, FiClock, FiZap } from 'react-icons/fi';

interface FilterSortBarProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

const sortOptions = [
  { value: 'match', label: 'Best Match', icon: FiZap },
  { value: 'recent', label: 'Most Recent', icon: FiClock },
  { value: 'trending', label: 'Trending', icon: FiTrendingUp },
];

const roleFilters = [
  { value: 'frontend', label: 'Frontend', emoji: '🎨' },
  { value: 'backend', label: 'Backend', emoji: '⚙️' },
  { value: 'ml', label: 'AI/ML', emoji: '🤖' },
  { value: 'mobile', label: 'Mobile', emoji: '📱' },
  { value: 'design', label: 'Design', emoji: '✨' },
  { value: 'fullstack', label: 'Full Stack', emoji: '🔥' },
];

const stageFilters = [
  { value: 'ideation', label: 'Ideation', color: 'bg-blue-500' },
  { value: 'mvp', label: 'MVP', color: 'bg-amber-500' },
  { value: 'prototype', label: 'Prototype', color: 'bg-emerald-500' },
  { value: 'launched', label: 'Launched', color: 'bg-rose-500' },
];

export default function FilterSortBar({
  currentSort,
  onSortChange,
  activeFilters,
  onFilterChange,
}: FilterSortBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      onFilterChange(activeFilters.filter((f) => f !== filter));
    } else {
      onFilterChange([...activeFilters, filter]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  const currentSortOption = sortOptions.find((s) => s.value === currentSort) || sortOptions[0];
  const SortIcon = currentSortOption.icon;

  return (
    <div className="mb-6 space-y-4">
      {/* Sort & Filter Row */}
      <div className="flex flex-wrap gap-3">
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="h-12 px-4 rounded-xl bg-[#12121a]/80 backdrop-blur-sm border border-white/5 text-white text-sm font-medium flex items-center gap-3 hover:border-[#B19EEF]/30 transition-all duration-300 min-w-[160px]"
          >
            <SortIcon className="text-[#B19EEF]" size={16} />
            <span>{currentSortOption.label}</span>
            <FiChevronDown
              className={`ml-auto text-gray-500 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}
              size={16}
            />
          </button>

          {showSortDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#1a1a24] border border-white/10 py-2 shadow-2xl shadow-black/50 z-20 overflow-hidden">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = currentSort === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors duration-200 ${
                        isActive
                          ? 'bg-[#B19EEF]/10 text-[#B19EEF]'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{option.label}</span>
                      {isActive && <FiCheck className="ml-auto" size={14} />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-12 px-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
            showFilters || activeFilters.length > 0
              ? 'bg-[#B19EEF]/10 border-[#B19EEF]/30 text-[#B19EEF]'
              : 'bg-[#12121a]/80 backdrop-blur-sm border-white/5 text-gray-400 hover:border-[#B19EEF]/30 hover:text-white'
          }`}
        >
          <FiFilter size={16} />
          <span>Filters</span>
          {activeFilters.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#B19EEF] text-[#0a0a0f] text-xs font-bold">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Active:</span>
          {activeFilters.map((filter) => {
            const roleFilter = roleFilters.find((r) => r.value === filter);
            const stageFilter = stageFilters.find((s) => s.value === filter);
            const label = roleFilter?.label || stageFilter?.label || filter;
            const emoji = roleFilter?.emoji;

            return (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className="group px-3 py-1.5 rounded-full bg-[#B19EEF]/10 border border-[#B19EEF]/30 text-[#B19EEF] text-xs font-medium flex items-center gap-1.5 hover:bg-[#B19EEF]/20 transition-all duration-200"
              >
                {emoji && <span>{emoji}</span>}
                {label}
                <FiX size={12} className="opacity-60 group-hover:opacity-100" />
              </button>
            );
          })}
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-[#B19EEF] transition-colors duration-200 underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="rounded-2xl bg-[#12121a]/80 backdrop-blur-sm border border-white/5 p-5 space-y-5">
          {/* Role Filters */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
              Looking for roles
            </h4>
            <div className="flex flex-wrap gap-2">
              {roleFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => toggleFilter(filter.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                    activeFilters.includes(filter.value)
                      ? 'bg-[#B19EEF] text-[#0a0a0f] shadow-lg shadow-[#B19EEF]/25'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{filter.emoji}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stage Filters */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
              Project stage
            </h4>
            <div className="flex flex-wrap gap-2">
              {stageFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => toggleFilter(filter.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                    activeFilters.includes(filter.value)
                      ? 'bg-[#B19EEF] text-[#0a0a0f] shadow-lg shadow-[#B19EEF]/25'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${filter.color}`} />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
