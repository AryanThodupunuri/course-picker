// Utility functions for schedule management

export const parseStartTime = (daysStr) => {
  if (!daysStr) return null;
  
  const match = daysStr.match(/(\d+):(\d+)(am|pm)/i);
  if (!match) return null;
  
  let [, hour, minute, period] = match;
  hour = parseInt(hour);
  minute = parseInt(minute);
  
  if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
  if (period.toLowerCase() === "am" && hour === 12) hour = 0;
  
  return hour + minute / 60;
};

export const parseEndTime = (daysStr) => {
  if (!daysStr) return null;
  
  const match = daysStr.match(/-\s*(\d+):(\d+)(am|pm)/i);
  if (!match) return null;
  
  let [, hour, minute, period] = match;
  hour = parseInt(hour);
  minute = parseInt(minute);
  
  if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
  if (period.toLowerCase() === "am" && hour === 12) hour = 0;
  
  return hour + minute / 60;
};

export const extractDays = (daysStr) => {
  if (!daysStr) return [];
  
  const dayMapping = {
    'Mo': 'Monday',
    'Tu': 'Tuesday', 
    'We': 'Wednesday',
    'Th': 'Thursday',
    'Fr': 'Friday',
    'Sa': 'Saturday',
    'Su': 'Sunday'
  };
  
  const days = [];
  const dayPattern = /(Mo|Tu|We|Th|Fr|Sa|Su)/g;
  let match;
  
  while ((match = dayPattern.exec(daysStr)) !== null) {
    if (dayMapping[match[1]]) {
      days.push(match[1]);
    }
  }
  
  return days;
};

export const checkConflicts = (newCourse, existingCourses) => {
  if (!newCourse.Days1 || !existingCourses.length) return null;
  
  const newStart = parseStartTime(newCourse.Days1);
  const newEnd = parseEndTime(newCourse.Days1) || (newStart + 1); // Default 1 hour if end time not found
  const newDays = extractDays(newCourse.Days1);
  
  if (!newStart || !newDays.length) return null;
  
  for (const existing of existingCourses) {
    if (!existing.Days1) continue;
    
    const existingStart = parseStartTime(existing.Days1);
    const existingEnd = parseEndTime(existing.Days1) || (existingStart + 1);
    const existingDays = extractDays(existing.Days1);
    
    if (!existingStart || !existingDays.length) continue;
    
    // Check for overlapping days
    const sharedDays = newDays.filter(day => existingDays.includes(day));
    
    if (sharedDays.length > 0) {
      // Check for overlapping times
      if (newStart < existingEnd && newEnd > existingStart) {
        return {
          course: existing,
          days: sharedDays,
          message: `Time conflict with ${existing.Title} (${existing.Subject} ${existing["Catalog Number"]}) on ${sharedDays.join(', ')}`
        };
      }
    }
  }
  
  return null;
};

export const calculateTotalCredits = (courses) => {
  return courses.reduce((total, course) => {
    const credits = parseFloat(course.Units) || 0;
    return total + credits;
  }, 0);
};

export const saveScheduleToStorage = (courses, name = 'My Schedule') => {
  try {
    const schedules = getSchedulesFromStorage();
    const newSchedule = {
      id: Date.now().toString(),
      name,
      courses,
      createdAt: new Date().toISOString(),
      totalCredits: calculateTotalCredits(courses)
    };
    
    schedules.push(newSchedule);
    localStorage.setItem('uva_course_schedules', JSON.stringify(schedules));
    
    return newSchedule;
  } catch (error) {
    console.error('Error saving schedule:', error);
    return null;
  }
};

export const getSchedulesFromStorage = () => {
  try {
    const schedules = localStorage.getItem('uva_course_schedules');
    return schedules ? JSON.parse(schedules) : [];
  } catch (error) {
    console.error('Error loading schedules:', error);
    return [];
  }
};

export const deleteScheduleFromStorage = (scheduleId) => {
  try {
    const schedules = getSchedulesFromStorage();
    const filtered = schedules.filter(schedule => schedule.id !== scheduleId);
    localStorage.setItem('uva_course_schedules', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return false;
  }
};

export const exportScheduleToPDF = async (courses, scheduleName = 'My Schedule') => {
  try {
    // Import jsPDF dynamically to avoid loading issues
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let y = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(35, 45, 75); // UVA Navy
    doc.text(scheduleName, 20, y);
    y += 15;
    
    // Generated date
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, y);
    y += 20;
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Courses: ${courses.length}`, 20, y);
    doc.text(`Total Credits: ${calculateTotalCredits(courses)}`, 120, y);
    y += 20;
    
    // Course list
    doc.setFontSize(14);
    doc.text('Courses:', 20, y);
    y += 10;
    
    courses.forEach((course, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      // Course title and details
      const title = `${course.Subject} ${course["Catalog Number"]} - ${course.Title}`;
      doc.text(title, 20, y);
      y += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      
      const details = [
        `Section: ${course.Section}`,
        `Instructor: ${course["Primary Instructor Name"] || 'TBD'}`,
        `Credits: ${course.Units}`,
        `Status: ${course.Status}`
      ].join(' • ');
      
      doc.text(details, 25, y);
      y += 6;
      
      if (course.Days1) {
        doc.text(`Schedule: ${course.Days1}`, 25, y);
        y += 6;
      }
      
      if (course.Room1) {
        doc.text(`Location: ${course.Room1}`, 25, y);
        y += 6;
      }
      
      y += 5; // Space between courses
    });
    
    // Save the PDF
    const filename = `${scheduleName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const exportScheduleToCSV = (courses, scheduleName = 'My Schedule') => {
  try {
    const headers = [
      'Class Number',
      'Subject',
      'Catalog Number', 
      'Section',
      'Title',
      'Instructor',
      'Credits',
      'Status',
      'Schedule',
      'Room',
      'GPA'
    ];
    
    const rows = courses.map(course => [
      course.ClassNumber || '',
      course.Subject || '',
      course["Catalog Number"] || '',
      course.Section || '',
      course.Title || '',
      course["Primary Instructor Name"] || '',
      course.Units || '',
      course.Status || '',
      course.Days1 || '',
      course.Room1 || '',
      course.GPA || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${scheduleName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    return true;
  } catch (error) {
    console.error('Error generating CSV:', error);
    return false;
  }
};