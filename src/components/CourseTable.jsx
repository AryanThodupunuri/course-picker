import React, { useState, useMemo } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const CourseTable = ({ 
  data, 
  sortKey, 
  sortOrder, 
  onSort, 
  onSelectCourse, 
  conflictWarning,
  selectedCourses 
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Define which columns to show on mobile vs desktop
  const mobileColumns = ['Title', 'Primary Instructor Name', 'GPA', 'Select'];
  const desktopColumns = ['ClassNumber', 'Title', 'Primary Instructor Name', 'Subject', 'Units', 'Status', 'Days1', 'GPA', 'Select'];

  const getGPABadge = (gpa) => {
    const num = parseFloat(gpa);
    if (isNaN(num)) return null;
    
    if (num >= 3.7) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
        {gpa}
      </span>;
    } else if (num >= 3.0) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
        {gpa}
      </span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
        {gpa}
      </span>;
    }
  };

  const getStatusBadge = (status) => {
    const isOpen = status?.toLowerCase() === 'open';
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isOpen 
          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      }`}>
        {status}
      </span>
    );
  };

  const toggleRowExpansion = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const isSelected = (course) => {
    return selectedCourses.some(selected => selected.ClassNumber === course.ClassNumber);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      
      // Handle numeric values
      if (sortKey === 'GPA' || sortKey === 'Units' || sortKey === 'ClassNumber') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (aVal && bVal) {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      } else {
        aVal = aVal || '';
        bVal = bVal || '';
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const SortableHeader = ({ columnKey, children, className = "" }) => (
    <th 
      onClick={() => onSort(columnKey)}
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${className}`}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortKey === columnKey && (
          sortOrder === 'asc' ? 
          <ChevronUpIcon className="h-4 w-4" /> : 
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </div>
    </th>
  );

  // Mobile card view
  const MobileCard = ({ course, index }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {course.Title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {course.Subject} {course["Catalog Number"]} - Section {course.Section}
          </p>
        </div>
        {course.GPA && getGPABadge(course.GPA)}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <UserIcon className="h-4 w-4 mr-2" />
          {course["Primary Instructor Name"] || "TBD"}
        </div>
        
        {course.Days1 && (
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <ClockIcon className="h-4 w-4 mr-2" />
            {course.Days1}
          </div>
        )}
        
        {course.Room1 && (
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <MapPinIcon className="h-4 w-4 mr-2" />
            {course.Room1}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {getStatusBadge(course.Status)}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {course.Units} credits
            </span>
          </div>
          
          <button
            onClick={() => onSelectCourse(course)}
            disabled={isSelected(course)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              isSelected(course)
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-uva-orange hover:bg-orange-600 text-white'
            }`}
          >
            {isSelected(course) ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
      
      {expandedRows.has(index) && course.Description && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {course.Description}
          </p>
        </div>
      )}
      
      {course.Description && (
        <button
          onClick={() => toggleRowExpansion(index)}
          className="mt-2 text-xs text-uva-orange hover:text-orange-600 font-medium"
        >
          {expandedRows.has(index) ? 'Show Less' : 'Show Description'}
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Conflict Warning */}
      {conflictWarning && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center text-red-800 dark:text-red-200">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">{conflictWarning}</span>
          </div>
        </div>
      )}

      {/* Mobile View */}
      <div className="md:hidden p-4">
        {sortedData.length === 0 ? (
          <div className="text-center py-8">
            <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No courses match your filters.</p>
          </div>
        ) : (
          sortedData.map((course, index) => (
            <MobileCard key={course.ClassNumber || index} course={course} index={index} />
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block table-container">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              <SortableHeader columnKey="ClassNumber">Class #</SortableHeader>
              <SortableHeader columnKey="Title">Title</SortableHeader>
              <SortableHeader columnKey="Primary Instructor Name">Instructor</SortableHeader>
              <SortableHeader columnKey="Subject">Subject</SortableHeader>
              <SortableHeader columnKey="Units">Credits</SortableHeader>
              <SortableHeader columnKey="Status">Status</SortableHeader>
              <SortableHeader columnKey="Days1">Schedule</SortableHeader>
              <SortableHeader columnKey="GPA">GPA</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={desktopColumns.length} className="px-4 py-8 text-center">
                  <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No courses match your filters.</p>
                </td>
              </tr>
            ) : (
              sortedData.map((course, index) => (
                <tr 
                  key={course.ClassNumber || index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {course.ClassNumber || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {course.Title || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Section {course.Section}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {course["Primary Instructor Name"] || 'TBD'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {course.Subject} {course["Catalog Number"]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {course.Units || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(course.Status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div>
                      {course.Days1 && (
                        <div className="text-sm">{course.Days1}</div>
                      )}
                      {course.Room1 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{course.Room1}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getGPABadge(course.GPA)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectCourse(course)}
                      disabled={isSelected(course)}
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                        isSelected(course)
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-uva-orange hover:bg-orange-600 text-white'
                      }`}
                    >
                      {isSelected(course) ? (
                        'Selected'
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Select
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseTable;