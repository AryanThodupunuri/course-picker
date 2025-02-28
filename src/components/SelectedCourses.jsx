import React from 'react';
import { 
  XMarkIcon, 
  BookmarkIcon,
  TrashIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const SelectedCourses = ({ 
  selectedCourses, 
  onRemoveCourse, 
  onSaveSchedule,
  onLoadSchedule,
  onExportSchedule,
  onShowCalendar,
  totalCredits 
}) => {
  if (selectedCourses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <BookmarkIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Courses Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select courses from the table above to build your schedule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected Courses
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedCourses.length} courses • {totalCredits} credits
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onShowCalendar}
              className="p-2 text-gray-500 hover:text-uva-orange transition-colors"
              title="View Calendar"
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onSaveSchedule}
              className="p-2 text-gray-500 hover:text-uva-orange transition-colors"
              title="Save Schedule"
            >
              <BookmarkIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onExportSchedule}
              className="p-2 text-gray-500 hover:text-uva-orange transition-colors"
              title="Export Schedule"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => selectedCourses.forEach(course => onRemoveCourse(course))}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="Clear All"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="p-6">
        <div className="space-y-3">
          {selectedCourses.map((course, index) => (
            <div 
              key={course.ClassNumber || index}
              className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {course.Title}
                  </h4>
                  <span className="px-2 py-1 text-xs font-medium bg-uva-orange text-white rounded">
                    {course.Units} cr
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>
                    {course.Subject} {course["Catalog Number"]} - Section {course.Section}
                  </div>
                  <div>
                    {course["Primary Instructor Name"] || "TBD"}
                  </div>
                  {course.Days1 && (
                    <div className="font-medium text-gray-600 dark:text-gray-300">
                      {course.Days1}
                    </div>
                  )}
                  {course.Room1 && (
                    <div>
                      📍 {course.Room1}
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => onRemoveCourse(course)}
                className="ml-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove course"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Total Credits:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{totalCredits}</span>
          </div>
          
          {totalCredits > 18 && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
              ⚠️ Heavy course load ({totalCredits} credits). Consider your workload carefully.
            </div>
          )}
          
          {totalCredits < 12 && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
              ℹ️ Less than full-time enrollment ({totalCredits} credits).
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onSaveSchedule}
            className="flex-1 bg-uva-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Save Schedule
          </button>
          <button
            onClick={onExportSchedule}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedCourses;