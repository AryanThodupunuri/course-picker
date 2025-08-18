import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarView = ({ selectedCourses, onClose, conflictingCourses = [] }) => {
  // Parse course schedule into calendar events
  const events = useMemo(() => {
    const calendarEvents = [];
    
    selectedCourses.forEach((course, courseIndex) => {
      if (!course.Days1) return;
      
      // Parse days and time from Days1 (e.g., "MoWeFr 10:00am - 10:50am")
      const scheduleMatch = course.Days1.match(/(\w+)\s+(\d{1,2}):(\d{2})(am|pm)\s*-\s*(\d{1,2}):(\d{2})(am|pm)/);
      if (!scheduleMatch) return;
      
      const [, daysStr, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = scheduleMatch;
      
      // Convert to 24-hour format
      let startTime24 = parseInt(startHour);
      let endTime24 = parseInt(endHour);
      
      if (startPeriod === 'pm' && startTime24 !== 12) startTime24 += 12;
      if (startPeriod === 'am' && startTime24 === 12) startTime24 = 0;
      if (endPeriod === 'pm' && endTime24 !== 12) endTime24 += 12;
      if (endPeriod === 'am' && endTime24 === 12) endTime24 = 0;
      
      // Map days to numbers (Monday = 1, Sunday = 0)
      const dayMapping = {
        'Mo': 1, 'Tu': 2, 'We': 3, 'Th': 4, 'Fr': 5, 'Sa': 6, 'Su': 0
      };
      
      // Extract individual days (MoWeFr -> ['Mo', 'We', 'Fr'])
      const days = [];
      for (let i = 0; i < daysStr.length; i += 2) {
        const dayCode = daysStr.substr(i, 2);
        if (dayMapping.hasOwnProperty(dayCode)) {
          days.push(dayMapping[dayCode]);
        }
      }
      
      // Create events for each day of the week
      days.forEach(dayNum => {
        // Create a date for this week (using current week for display)
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday
        const diff = dayNum - currentDay;
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + diff);
        
        const startDate = new Date(eventDate);
        startDate.setHours(startTime24, parseInt(startMin), 0, 0);
        
        const endDate = new Date(eventDate);
        endDate.setHours(endTime24, parseInt(endMin), 0, 0);
        
        // Check if this course conflicts with others
        const isConflicting = conflictingCourses.some(conflictId => 
          conflictId === course.ClassNumber
        );
        
        calendarEvents.push({
          id: `${course.ClassNumber}-${dayNum}`,
          title: `${course.Subject} ${course["Catalog Number"]}\n${course["Primary Instructor Name"] || 'TBD'}`,
          start: startDate,
          end: endDate,
          resource: {
            course: course,
            isConflicting: isConflicting,
            room: course.Room1
          }
        });
      });
    });
    
    return calendarEvents;
  }, [selectedCourses, conflictingCourses]);

  // Custom event component
  const EventComponent = ({ event }) => (
    <div className={`p-1 rounded text-xs font-medium ${
      event.resource.isConflicting 
        ? 'bg-red-500 text-white' 
        : 'bg-blue-500 text-white'
    }`}>
      <div className="font-semibold truncate">
        {event.title.split('\n')[0]}
      </div>
      <div className="text-xs opacity-90 truncate">
        {event.title.split('\n')[1]}
      </div>
      {event.resource.room && (
        <div className="text-xs opacity-75 truncate">
          📍 {event.resource.room}
        </div>
      )}
    </div>
  );

  // Custom event style getter
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.resource.isConflicting ? '#ef4444' : '#3b82f6',
      borderRadius: '4px',
      border: 'none',
      color: 'white',
      display: 'block',
      fontSize: '12px',
      padding: '2px 4px'
    };
    return { style };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-6 w-6 text-uva-orange" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Weekly Schedule
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedCourses.length} courses selected
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Calendar Content */}
        <div className="p-6 overflow-auto" style={{ height: 'calc(90vh - 120px)' }}>
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Schedule to Display
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Select courses with valid schedules to see your weekly calendar.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', minHeight: '500px' }}
                defaultView="work_week"
                views={['work_week', 'day']}
                min={new Date(2024, 0, 1, 7, 0, 0)} // 7 AM
                max={new Date(2024, 0, 1, 22, 0, 0)} // 10 PM
                step={30}
                timeslots={2}
                components={{
                  event: EventComponent
                }}
                eventPropGetter={eventStyleGetter}
                dayLayoutAlgorithm="no-overlap"
                className="rbc-calendar"
              />
            </div>
          )}

          {/* Legend */}
          {events.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-300">Regular Course</span>
              </div>
              {conflictingCourses.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-300">Time Conflict</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-300">
              Showing schedule for current week • Times in your local timezone
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-uva-orange hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Close Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;