import React from 'react';
import { AcademicCapIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Header = ({ darkMode, setDarkMode }) => {
  return (
    <header className="bg-uva-navy dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="h-8 w-8 text-uva-orange" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                UVA CS Course Planner
              </h1>
              <p className="text-gray-300 text-sm hidden sm:block">
                Build your perfect semester schedule
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;