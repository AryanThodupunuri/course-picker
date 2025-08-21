import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarView = ({ selectedCourses, onClose }) => {
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
        
        calendarEvents.push({
          id: `${course.ClassNumber}-${dayNum}`,
          title: `${course.Subject} ${course["Catalog Number"]}`,
          start: startDate,
          end: endDate,
          resource: {
            course: course,
            instructor: course["Primary Instructor Name"] || 'TBD',
            room: course.Room1,
            gpa: course.GPA
          }
        });
      });
    });
    
    return calendarEvents;
  }, [selectedCourses]);

  // Custom event component with course info
  const EventComponent = ({ event }) => (
    <div style={{ fontSize: '12px', lineHeight: '1.2' }}>
      <div style={{ fontWeight: 'bold' }}>
        {event.title}
      </div>
      <div style={{ opacity: 0.9 }}>
        {event.resource.instructor}
      </div>
      {event.resource.room && (
        <div style={{ opacity: 0.8 }}>
          📍 {event.resource.room}
        </div>
      )}
    </div>
  );

  // Custom event style getter based on GPA
  const eventStyleGetter = (event) => {
    const gpa = parseFloat(event.resource.gpa);
    let backgroundColor = '#3b82f6'; // Default blue
    
    if (!isNaN(gpa)) {
      if (gpa >= 3.7) backgroundColor = '#10b981'; // Green for high GPA
      else if (gpa >= 3.0) backgroundColor = '#f59e0b'; // Yellow for medium GPA  
      else backgroundColor = '#ef4444'; // Red for low GPA
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        fontSize: '11px'
      }
    };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: 'var(--uva-navy)' }}>
              Weekly Schedule
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              {selectedCourses.length} courses selected
            </p>
          </div>
          
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1.25rem'
            }}
            title="Close Calendar"
          >
            ✖
          </button>
        </div>

        {/* Calendar Content */}
        <div style={{ padding: '1.5rem', height: '70vh', minHeight: '500px' }}>
          {events.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>No Schedule</div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
                No Schedule to Display
              </h3>
              <p>Select courses with valid schedules to see your weekly calendar.</p>
            </div>
          ) : (
            <div style={{ height: '100%' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
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
              />
            </div>
          )}

          {/* Legend */}
          {events.length > 0 && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                GPA Color Legend:
              </h4>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '16px', height: '16px', background: '#10b981', borderRadius: '4px' }}></div>
                  <span>High GPA (≥3.7)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '16px', height: '16px', background: '#f59e0b', borderRadius: '4px' }}></div>
                  <span>Medium GPA (3.0-3.7)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '16px', height: '16px', background: '#ef4444', borderRadius: '4px' }}></div>
                  <span>Low GPA (&lt;3.0)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '16px', height: '16px', background: '#3b82f6', borderRadius: '4px' }}></div>
                  <span>No GPA Data</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '1rem 1.5rem', 
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Showing schedule for current week • Times in your local timezone
          </div>
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Close Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;