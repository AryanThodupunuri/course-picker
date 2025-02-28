import React from 'react';
import { 
  FunnelIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CalendarDaysIcon 
} from '@heroicons/react/24/outline';

const FilterPanel = ({ 
  showFilters, 
  setShowFilters, 
  filters, 
  onFilterChange,
  coursesCount,
  filteredCount 
}) => {
  const handleDayToggle = (day) => {
    const newDays = { ...filters.selectedDays, [day]: !filters.selectedDays[day] };
    onFilterChange('selectedDays', newDays);
  };

  const clearFilters = () => {
    onFilterChange('clearAll');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
      {/* Filter Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FunnelIcon className="h-5 w-5 text-uva-orange" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredCount} of {coursesCount} courses
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-uva-orange transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={showFilters ? "Hide filters" : "Show filters"}
            >
              {showFilters ? (
                <XMarkIcon className="h-4 w-4" />
              ) : (
                <FunnelIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {showFilters && (
        <div className="p-6 animate-slide-in">
          <div className="filter-grid">
            {/* Search */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                Search Courses
              </label>
              <input
                type="text"
                placeholder="Course title, description, or instructor..."
                value={filters.searchKeyword}
                onChange={(e) => onFilterChange('searchKeyword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-uva-orange focus:border-uva-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g., CS"
                value={filters.filterSubject}
                onChange={(e) => onFilterChange('filterSubject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-uva-orange focus:border-uva-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Professor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Professor
              </label>
              <input
                type="text"
                placeholder="Professor name"
                value={filters.filterProfessor}
                onChange={(e) => onFilterChange('filterProfessor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-uva-orange focus:border-uva-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Course Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filters.filterType}
                onChange={(e) => onFilterChange('filterType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-uva-orange focus:border-uva-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="Lecture">Lecture</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Seminar">Seminar</option>
                <option value="Independent Study">Independent Study</option>
              </select>
            </div>

            {/* Credits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Credits
              </label>
              <select
                value={filters.filterCredits}
                onChange={(e) => onFilterChange('filterCredits', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-uva-orange focus:border-uva-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Credits</option>
                <option value="1">1 Credit</option>
                <option value="3">3 Credits</option>
                <option value="4">4 Credits</option>
              </select>
            </div>

            {/* Min GPA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min GPA
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="4.0"
                placeholder="e.g., 3.5"
                value={filters.minGPA}
                onChange={(e) => onFilterChange('minGPA', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-uva-orange focus:border-uva-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Days Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
              Meeting Days
            </label>
            <div className="flex flex-wrap gap-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr'].map((day) => (
                <button
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filters.selectedDays[day]
                      ? 'bg-uva-orange text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Time Range: {filters.startTimeRange[0]}:00 - {filters.startTimeRange[1]}:00
            </label>
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={filters.startTimeRange[0]}
                  onChange={(e) => onFilterChange('startTimeRange', [parseInt(e.target.value), filters.startTimeRange[1]])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="text-sm text-gray-500 text-center mt-1">Start</div>
              </div>
              <div className="flex-1">
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={filters.startTimeRange[1]}
                  onChange={(e) => onFilterChange('startTimeRange', [filters.startTimeRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="text-sm text-gray-500 text-center mt-1">End</div>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-6 flex flex-wrap gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlyOpen}
                onChange={(e) => onFilterChange('onlyOpen', e.target.checked)}
                className="rounded border-gray-300 text-uva-orange focus:ring-uva-orange"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Open Only</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inPersonOnly}
                onChange={(e) => onFilterChange('inPersonOnly', e.target.checked)}
                className="rounded border-gray-300 text-uva-orange focus:ring-uva-orange"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">In-Person Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;