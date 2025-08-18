import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import CourseTable from "./components/CourseTable";
import SelectedCourses from "./components/SelectedCourses";
import CalendarView from "./components/CalendarView";
import { 
  checkConflicts, 
  calculateTotalCredits, 
  saveScheduleToStorage,
  getSchedulesFromStorage,
  exportScheduleToPDF,
  exportScheduleToCSV,
  parseStartTime 
} from "./utils/scheduleUtils";

function App() {
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
      setTimeout(() => setConflictWarning(""), 5000); // Clear after 5 seconds
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uva-orange mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Course Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-uva-navy dark:text-uva-orange">
                {data.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-uva-navy dark:text-uva-orange">
                {filteredData.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Filtered Results</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-uva-navy dark:text-uva-orange">
                {selectedCourses.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Selected Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-uva-navy dark:text-uva-orange">
                {totalCredits}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Credits</div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          showFilters={filters.showFilters}
          setShowFilters={(show) => handleFilterChange('showFilters', show)}
          filters={filters}
          onFilterChange={handleFilterChange}
          coursesCount={data.length}
          filteredCount={filteredData.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Table */}
          <div className="lg:col-span-2">
            <CourseTable
              data={filteredData}
              sortKey={filters.sortKey}
              sortOrder={filters.sortOrder}
              onSort={handleSort}
              onSelectCourse={handleSelectCourse}
              conflictWarning={conflictWarning}
              selectedCourses={selectedCourses}
            />
          </div>

          {/* Selected Courses */}
          <div className="lg:col-span-1">
            <SelectedCourses
              selectedCourses={selectedCourses}
              onRemoveCourse={handleRemoveCourse}
              onSaveSchedule={handleSaveSchedule}
              onExportSchedule={handleExportSchedule}
              onShowCalendar={() => setShowCalendar(true)}
              totalCredits={totalCredits}
            />
          </div>
        </div>

        {/* GPA Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            GPA Legend
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded-full border border-green-300 dark:border-green-700"></div>
              <span className="text-gray-600 dark:text-gray-300">GPA ≥ 3.7 (High)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 rounded-full border border-yellow-300 dark:border-yellow-700"></div>
              <span className="text-gray-600 dark:text-gray-300">3.0 ≤ GPA < 3.7 (Medium)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900 rounded-full border border-red-300 dark:border-red-700"></div>
              <span className="text-gray-600 dark:text-gray-300">GPA < 3.0 (Challenging)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarView
          selectedCourses={selectedCourses}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Created by Aryan Thodupunuri and Nikhil Kapadia • Enhanced with modern UI/UX and advanced features
          </p>
          <p className="text-xs mt-2">
            Data updated for Spring 2025 • Not affiliated with UVA SIS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;