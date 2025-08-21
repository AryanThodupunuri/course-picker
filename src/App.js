import React, { useState, useEffect, useMemo, useCallback } from "react";
import CalendarView from "./components/CalendarView";
import LoginForm from "./components/LoginForm";
import { 
  checkConflicts, 
  calculateTotalCredits, 
  saveScheduleToStorage,
  exportScheduleToPDF,
  exportScheduleToCSV,
  parseStartTime 
} from "./utils/scheduleUtils";

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    filterSubject: "",
    filterProfessor: "",
    filterType: "",
    filterCredits: "",
    minGPA: "",
    onlyOpen: false,
    inPersonOnly: false,
    sortKey: null,
    sortOrder: "asc",
    selectedDays: { Mo: false, Tu: false, We: false, Th: false, Fr: false },
    startTimeRange: [8, 18],
    searchKeyword: "",
    showFilters: true,
  });

  // Course selection state
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [conflictWarning, setConflictWarning] = useState("");

  // Check for existing user session
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('courseplanner_currentuser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(process.env.PUBLIC_URL + "/courses.json");
        const jsonData = await response.json();
        
        if (jsonData.Sheet1 && Array.isArray(jsonData.Sheet1)) {
          setData(jsonData.Sheet1);
        }
      } catch (error) {
        console.error("Error loading course data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourseData();
  }, []);

  // Load saved schedule from localStorage
  useEffect(() => {
    const savedCourses = localStorage.getItem('currentSchedule');
    if (savedCourses) {
      try {
        setSelectedCourses(JSON.parse(savedCourses));
      } catch (error) {
        console.error('Error loading saved schedule:', error);
      }
    }
  }, []);

  // Save current schedule to localStorage
  useEffect(() => {
    localStorage.setItem('currentSchedule', JSON.stringify(selectedCourses));
  }, [selectedCourses]);

  // Filter courses based on current filters
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const subjectMatch = !filters.filterSubject || 
        row.Subject?.toLowerCase().includes(filters.filterSubject.toLowerCase());
      
      const professorMatch = !filters.filterProfessor || 
        row["Primary Instructor Name"]?.toLowerCase().includes(filters.filterProfessor.toLowerCase());
      
      const typeMatch = !filters.filterType || 
        row.Type?.toLowerCase().includes(filters.filterType.toLowerCase());
      
      const creditsMatch = !filters.filterCredits || 
        row.Units?.toString() === filters.filterCredits;
      
      const gpaMatch = !filters.minGPA || 
        parseFloat(row.GPA || 0) >= parseFloat(filters.minGPA);
      
      const openMatch = !filters.onlyOpen || 
        row.Status?.toLowerCase() === "open";
      
      const inPersonMatch = !filters.inPersonOnly || 
        row["Instruction Mode"]?.toLowerCase().includes("in person");

      const startTime = parseStartTime(row.Days1 || row.Days);
      const timeMatch = startTime === null || 
        (startTime >= filters.startTimeRange[0] && startTime <= filters.startTimeRange[1]);

      const activeDays = Object.entries(filters.selectedDays)
        .filter(([_, checked]) => checked)
        .map(([day]) => day);
      const daysMatch = activeDays.length === 0 || 
        activeDays.every((day) => row.Days1?.includes(day));

      const keywordMatch = !filters.searchKeyword ||
        row.Title?.toLowerCase().includes(filters.searchKeyword.toLowerCase()) ||
        row.Description?.toLowerCase().includes(filters.searchKeyword.toLowerCase()) ||
        row["Primary Instructor Name"]?.toLowerCase().includes(filters.searchKeyword.toLowerCase());

      return subjectMatch && professorMatch && typeMatch && creditsMatch &&
        gpaMatch && openMatch && inPersonMatch && timeMatch && daysMatch && keywordMatch;
    });
  }, [data, filters]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    if (key === 'clearAll') {
      setFilters({
        filterSubject: "",
        filterProfessor: "",
        filterType: "",
        filterCredits: "",
        minGPA: "",
        onlyOpen: false,
        inPersonOnly: false,
        sortKey: null,
        sortOrder: "asc",
        selectedDays: { Mo: false, Tu: false, We: false, Th: false, Fr: false },
        startTimeRange: [8, 18],
        searchKeyword: "",
        showFilters: true,
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  }, []);

  // Handle sorting
  const handleSort = useCallback((key) => {
    setFilters(prev => ({
      ...prev,
      sortKey: key,
      sortOrder: prev.sortKey === key && prev.sortOrder === "asc" ? "desc" : "asc"
    }));
  }, []);

  // Handle course selection
  const handleSelectCourse = useCallback((course) => {
    const conflict = checkConflicts(course, selectedCourses);
    
    if (conflict) {
      setConflictWarning(conflict.message);
      setTimeout(() => setConflictWarning(""), 5000);
    } else {
      setSelectedCourses(prev => [...prev, course]);
      setConflictWarning("");
    }
  }, [selectedCourses]);

  // Handle course removal
  const handleRemoveCourse = useCallback((courseToRemove) => {
    setSelectedCourses(prev => 
      prev.filter(course => course.ClassNumber !== courseToRemove.ClassNumber)
    );
    setConflictWarning("");
  }, []);

  // Handle user login
  const handleLogin = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Handle user logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('courseplanner_currentuser');
    setUser(null);
    setSelectedCourses([]);
  }, []);

  // Calculate total credits
  const totalCredits = useMemo(() => {
    return calculateTotalCredits(selectedCourses);
  }, [selectedCourses]);

  // Handle schedule operations
  const handleSaveSchedule = useCallback(() => {
    const scheduleName = prompt('Enter a name for your schedule:', 'My Schedule');
    if (scheduleName && selectedCourses.length > 0) {
      const saved = saveScheduleToStorage(selectedCourses, scheduleName);
      if (saved) {
        alert('Schedule saved successfully!');
      } else {
        alert('Error saving schedule. Please try again.');
      }
    }
  }, [selectedCourses]);

  const handleExportSchedule = useCallback(async () => {
    if (selectedCourses.length === 0) {
      alert('Please select some courses first.');
      return;
    }

    const format = prompt('Export format?\nEnter "pdf" for PDF or "csv" for CSV:', 'pdf');
    
    if (format?.toLowerCase() === 'pdf') {
      const success = await exportScheduleToPDF(selectedCourses, 'My Schedule');
      if (success) {
        alert('PDF exported successfully!');
      } else {
        alert('Error exporting PDF. Please try again.');
      }
    } else if (format?.toLowerCase() === 'csv') {
      const success = exportScheduleToCSV(selectedCourses, 'My Schedule');
      if (success) {
        alert('CSV exported successfully!');
      } else {
        alert('Error exporting CSV. Please try again.');
      }
    }
  }, [selectedCourses]);

  // Get GPA badge class
  const getGPABadgeClass = (gpa) => {
    const num = parseFloat(gpa);
    if (isNaN(num)) return "";
    if (num >= 3.7) return "badge badge-green";
    if (num >= 3.0) return "badge badge-yellow";
    return "badge badge-red";
  };

  const getStatusBadgeClass = (status) => {
    return status?.toLowerCase() === 'open' ? "badge badge-green" : "badge badge-red";
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!filters.sortKey) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let aVal = a[filters.sortKey];
      let bVal = b[filters.sortKey];
      
      if (filters.sortKey === 'GPA' || filters.sortKey === 'Units' || filters.sortKey === 'ClassNumber') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (aVal && bVal) {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      } else {
        aVal = aVal || '';
        bVal = bVal || '';
      }
      
      if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, filters.sortKey, filters.sortOrder]);

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div>
          <div className="spinner"></div>
          <p style={{textAlign: 'center', marginTop: '1rem'}}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show course data loading
  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div>
          <div className="spinner"></div>
          <p style={{textAlign: 'center', marginTop: '1rem'}}>Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>UVA CS Course Planner</h1>
              <p style={{fontSize: '0.875rem', margin: '0.25rem 0 0 0', opacity: 0.8}}>
                Build your perfect semester schedule
              </p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <span style={{fontSize: '0.875rem', opacity: 0.8}}>
                Welcome, {user.name}
              </span>
              <button 
                className="btn btn-secondary"
                onClick={() => setDarkMode(!darkMode)}
                title="Toggle dark mode"
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleLogout}
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container main-content">
        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{data.length}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{filteredData.length}</div>
            <div className="stat-label">Filtered Results</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{selectedCourses.length}</div>
            <div className="stat-label">Selected Courses</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{totalCredits}</div>
            <div className="stat-label">Total Credits</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-header">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h2 style={{margin: 0, fontSize: '1.125rem', fontWeight: 600}}>
                  🔍 Filters
                </h2>
                <p style={{margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.7}}>
                  {filteredData.length} of {data.length} courses
                </p>
              </div>
              <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleFilterChange('clearAll')}
                  style={{fontSize: '0.75rem', padding: '0.25rem 0.75rem'}}
                >
                  Clear All
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleFilterChange('showFilters', !filters.showFilters)}
                >
                  {filters.showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>
            </div>
          </div>
          
          {filters.showFilters && (
            <div className="card-body animate-fade-in">
              <div className="filter-grid">
                <div className="form-group">
                  <label className="form-label">🔍 Search</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Course title, description, or instructor..."
                    value={filters.searchKeyword}
                    onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., CS"
                    value={filters.filterSubject}
                    onChange={(e) => handleFilterChange('filterSubject', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Professor</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Professor name"
                    value={filters.filterProfessor}
                    onChange={(e) => handleFilterChange('filterProfessor', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={filters.filterType}
                    onChange={(e) => handleFilterChange('filterType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Lecture">Lecture</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <select
                    className="form-select"
                    value={filters.filterCredits}
                    onChange={(e) => handleFilterChange('filterCredits', e.target.value)}
                  >
                    <option value="">All Credits</option>
                    <option value="1">1 Credit</option>
                    <option value="3">3 Credits</option>
                    <option value="4">4 Credits</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Min GPA</label>
                  <input
                    type="number"
                    className="form-input"
                    step="0.1"
                    min="0"
                    max="4.0"
                    placeholder="e.g., 3.5"
                    value={filters.minGPA}
                    onChange={(e) => handleFilterChange('minGPA', e.target.value)}
                  />
                </div>
              </div>

              <div style={{marginTop: '1.5rem'}}>
                <label className="form-label">📅 Meeting Days</label>
                <div className="day-checkboxes">
                  {['Mo', 'Tu', 'We', 'Th', 'Fr'].map((day) => (
                    <button
                      key={day}
                      className={`day-checkbox ${filters.selectedDays[day] ? 'active' : ''}`}
                      onClick={() => handleFilterChange('selectedDays', {...filters.selectedDays, [day]: !filters.selectedDays[day]})}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="time-range">
                <label className="form-label">
                  🕐 Time Range: {filters.startTimeRange[0]}:00 - {filters.startTimeRange[1]}:00
                </label>
                <div className="range-inputs">
                  <div className="range-input">
                    <input
                      type="range"
                      min="0"
                      max="23"
                      value={filters.startTimeRange[0]}
                      onChange={(e) => handleFilterChange('startTimeRange', [parseInt(e.target.value), filters.startTimeRange[1]])}
                    />
                    <div style={{textAlign: 'center', fontSize: '0.75rem', marginTop: '0.25rem'}}>Start</div>
                  </div>
                  <div className="range-input">
                    <input
                      type="range"
                      min="1"
                      max="24"
                      value={filters.startTimeRange[1]}
                      onChange={(e) => handleFilterChange('startTimeRange', [filters.startTimeRange[0], parseInt(e.target.value)])}
                    />
                    <div style={{textAlign: 'center', fontSize: '0.75rem', marginTop: '0.25rem'}}>End</div>
                  </div>
                </div>
              </div>

              <div style={{marginTop: '1.5rem', display: 'flex', gap: '1rem'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={filters.onlyOpen}
                    onChange={(e) => handleFilterChange('onlyOpen', e.target.checked)}
                  />
                  <span style={{fontSize: '0.875rem'}}>Open Only</span>
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={filters.inPersonOnly}
                    onChange={(e) => handleFilterChange('inPersonOnly', e.target.checked)}
                  />
                  <span style={{fontSize: '0.875rem'}}>In-Person Only</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem'}}>
          {/* Course Table */}
          <div className="card">
            {conflictWarning && (
              <div style={{padding: '1rem', background: '#fecaca', color: '#991b1b', borderBottom: '1px solid #f87171'}}>
                ⚠️ {conflictWarning}
              </div>
            )}
            
            <div className="table-container">
              <table className="course-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('ClassNumber')}>
                      Class # {filters.sortKey === 'ClassNumber' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('Title')}>
                      Title {filters.sortKey === 'Title' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('Primary Instructor Name')}>
                      Instructor {filters.sortKey === 'Primary Instructor Name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('Units')}>
                      Credits {filters.sortKey === 'Units' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('Status')}>
                      Status {filters.sortKey === 'Status' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('Days1')}>Schedule</th>
                    <th onClick={() => handleSort('GPA')}>
                      GPA {filters.sortKey === 'GPA' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>
                        <div>
                          <p>🎓</p>
                          <p style={{marginTop: '0.5rem'}}>No courses match your filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((course, index) => (
                      <tr key={course.ClassNumber || index}>
                        <td>{course.ClassNumber || 'N/A'}</td>
                        <td>
                          <div style={{fontWeight: 500}}>{course.Title || 'N/A'}</div>
                          <div style={{fontSize: '0.75rem', opacity: 0.7}}>
                            {course.Subject} {course["Catalog Number"]} - Section {course.Section}
                          </div>
                        </td>
                        <td>{course["Primary Instructor Name"] || 'TBD'}</td>
                        <td>{course.Units || 'N/A'}</td>
                        <td>
                          <span className={getStatusBadgeClass(course.Status)}>
                            {course.Status}
                          </span>
                        </td>
                        <td>
                          {course.Days1 && (
                            <div>
                              <div style={{fontSize: '0.875rem'}}>{course.Days1}</div>
                              {course.Room1 && (
                                <div style={{fontSize: '0.75rem', opacity: 0.7}}>📍 {course.Room1}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {course.GPA && (
                            <span className={getGPABadgeClass(course.GPA)}>
                              {parseFloat(course.GPA).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleSelectCourse(course)}
                            disabled={selectedCourses.some(selected => selected.ClassNumber === course.ClassNumber)}
                            style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}
                          >
                            {selectedCourses.some(selected => selected.ClassNumber === course.ClassNumber) ? 'Selected' : '+ Select'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Courses */}
          <div className="card">
            <div className="card-header">
              <h3 style={{margin: 0, fontSize: '1.125rem', fontWeight: 600}}>
                📚 Selected Courses
              </h3>
              <p style={{margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.7}}>
                {selectedCourses.length} courses • {totalCredits} credits
              </p>
            </div>
            <div className="card-body">
              {selectedCourses.length === 0 ? (
                <div style={{textAlign: 'center', padding: '2rem'}}>
                  <div style={{fontSize: '2rem', marginBottom: '1rem'}}>📋</div>
                  <h4 style={{margin: '0 0 0.5rem 0'}}>No Courses Selected</h4>
                  <p style={{fontSize: '0.875rem', opacity: 0.7}}>
                    Select courses from the table to build your schedule.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{marginBottom: '1rem'}}>
                    {selectedCourses.map((course, index) => (
                      <div key={course.ClassNumber || index} className="selected-course">
                        <div className="selected-course-info">
                          <h4>{course.Title}</h4>
                          <div className="selected-course-meta">
                            <div>{course.Subject} {course["Catalog Number"]} - Section {course.Section}</div>
                            <div>{course["Primary Instructor Name"] || "TBD"}</div>
                            {course.Days1 && <div>🕐 {course.Days1}</div>}
                            {course.Room1 && <div>📍 {course.Room1}</div>}
                          </div>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <span className="badge" style={{background: 'var(--uva-orange)', color: 'white', fontSize: '0.75rem'}}>
                            {course.Units} cr
                          </span>
                          <button
                            onClick={() => handleRemoveCourse(course)}
                            style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem'}}
                            title="Remove course"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{marginTop: '1rem', padding: '1rem 0', borderTop: '1px solid #e5e7eb'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                      <span>Total Credits:</span>
                      <span style={{fontWeight: 600}}>{totalCredits}</span>
                    </div>
                    
                    {totalCredits > 18 && (
                      <div style={{padding: '0.5rem', background: '#fef3c7', color: '#92400e', borderRadius: '0.25rem', fontSize: '0.75rem', marginTop: '0.5rem'}}>
                        ⚠️ Heavy course load ({totalCredits} credits). Consider your workload carefully.
                      </div>
                    )}
                    
                    {totalCredits < 12 && totalCredits > 0 && (
                      <div style={{padding: '0.5rem', background: '#dbeafe', color: '#1e40af', borderRadius: '0.25rem', fontSize: '0.75rem', marginTop: '0.5rem'}}>
                        ℹ️ Less than full-time enrollment ({totalCredits} credits).
                      </div>
                    )}
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
                    <button className="btn btn-primary" onClick={handleSaveSchedule}>
                      💾 Save Schedule
                    </button>
                    <button className="btn btn-secondary" onClick={handleExportSchedule}>
                      📄 Export Schedule
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowCalendar(true)}>
                      📅 View Calendar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* GPA Legend */}
        <div className="card">
          <div className="card-body">
            <h3 style={{margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600}}>GPA Legend</h3>
            <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div className="badge badge-green">3.7+</div>
                <span style={{fontSize: '0.875rem'}}>High GPA (Easier)</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div className="badge badge-yellow">3.0-3.7</div>
                <span style={{fontSize: '0.875rem'}}>Medium GPA</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div className="badge badge-red">&lt;3.0</div>
                <span style={{fontSize: '0.875rem'}}>Low GPA (Challenging)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer style={{background: 'white', borderTop: '1px solid #e5e7eb', padding: '2rem 0', marginTop: '3rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280'}}>
        <div className="container">
          <p>Created by Aryan Thodupunuri and Nikhil Kapadia • Enhanced with modern UI/UX and advanced features</p>
          <p style={{fontSize: '0.75rem', marginTop: '0.5rem'}}>Data updated for Spring 2025 • Not affiliated with UVA SIS</p>
        </div>
      </footer>

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarView
          selectedCourses={selectedCourses}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}

export default App;