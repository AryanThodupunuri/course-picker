import React, { useState, useEffect } from "react";
import "./CoursePicker.css";

export default function CoursePicker() {
  // load course data and manage all filters + state
  const [data, setData] = useState([]);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterProfessor, setFilterProfessor] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCredits, setFilterCredits] = useState("");
  const [minGPA, setMinGPA] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [inPersonOnly, setInPersonOnly] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedDays, setSelectedDays] = useState({ Mo: false, Tu: false, We: false, Th: false, Fr: false });
  const [startTimeRange, setStartTimeRange] = useState([8, 18]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [conflictWarning, setConflictWarning] = useState("");

  // load course data from public folder
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/courses.json")
      .then((response) => response.json())
      .then((jsonData) => {
        if (jsonData.Sheet1 && Array.isArray(jsonData.Sheet1)) {
          setData(jsonData.Sheet1);
        }
      })
      .catch((error) => console.error("error loading course data:", error));
  }, []);

  // sort table when user clicks a column
  const handleSort = (key) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  // helper to convert time strings like "10:00am" into numbers
  const parseStartTime = (daysStr) => {
    const match = daysStr?.match(/(\d+):(\d+)(am|pm)/i);
    if (!match) return null;
    let [, hour, minute, period] = match;
    hour = parseInt(hour);
    minute = parseInt(minute);
    if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (period.toLowerCase() === "am" && hour === 12) hour = 0;
    return hour + minute / 60;
  };

  // check if a new class overlaps with any already selected ones
  const checkConflicts = (newCourse) => {
    const newStart = parseStartTime(newCourse.Days1 || newCourse.Days);
    const newEnd = newStart + 1;
    for (const existing of selectedCourses) {
      if (!existing.Days1 || !newCourse.Days1) continue;
      const sharedDays = ["Mo", "Tu", "We", "Th", "Fr"].filter(
        day => existing.Days1.includes(day) && newCourse.Days1.includes(day)
      );
      if (sharedDays.length > 0) {
        const existingStart = parseStartTime(existing.Days1);
        const existingEnd = existingStart + 1;
        if (newStart < existingEnd && newEnd > existingStart) {
          return `conflict with ${existing["Title"]} on ${sharedDays.join(", ")} at ${newCourse.Days1}`;
        }
      }
    }
    return "";
  };

  // decide which row background to use based on GPA
  const getGPAClass = (gpa) => {
    const num = parseFloat(gpa);
    if (isNaN(num)) return "";
    if (num >= 3.7) return "gpa-high";
    if (num >= 3.0) return "gpa-medium";
    return "gpa-low";
  };

  // apply all filters and return just the rows that match
  const filteredData = data.filter((row) => {
    const subjectMatch = !filterSubject || row.Subject?.toLowerCase().includes(filterSubject.toLowerCase());
    const professorMatch = !filterProfessor || row["Primary Instructor Name"]?.toLowerCase().includes(filterProfessor.toLowerCase());
    const typeMatch = !filterType || row.Type?.toLowerCase().includes(filterType.toLowerCase());
    const creditsMatch = !filterCredits || row.Units?.toString() === filterCredits;
    const gpaMatch = !minGPA || parseFloat(row.GPA || 0) >= parseFloat(minGPA);
    const openMatch = !onlyOpen || row.Status?.toLowerCase() === "open";
    const inPersonMatch = !inPersonOnly || row["Instruction Mode"]?.toLowerCase().includes("in person");

    const startTime = parseStartTime(row.Days1 || row.Days);
    const timeMatch = startTime === null || (startTime >= startTimeRange[0] && startTime <= startTimeRange[1]);

    const activeDays = Object.entries(selectedDays).filter(([_, checked]) => checked).map(([day]) => day);
    const daysMatch = activeDays.length === 0 || activeDays.every((day) => row.Days1?.includes(day));

    const keywordMatch = !searchKeyword ||
      row.Title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      row.Description?.toLowerCase().includes(searchKeyword.toLowerCase());

    return subjectMatch && professorMatch && typeMatch && creditsMatch &&
      gpaMatch && openMatch && inPersonMatch && timeMatch && daysMatch && keywordMatch;
  });

  return (
    <div className="course-picker-container">
      {/* app header and summary box */}
      <h1 className="course-picker-title">UVA CS Course Planner</h1>

      <div className="app-summary">
        <h2>About This App</h2>
        <p>
          This tool helps UVA Computer Science students explore and plan their courses. 
          You can filter by subject, professor, GPA, time, and more. Select courses to build a schedule, the app will warn you about time conflicts. 
          GPA color coding helps you quickly identify course difficulty based on past averages.
        </p>
      </div>

      {/* toggle filter visibility */}
      <button onClick={() => setShowFilters(prev => !prev)}>
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {/* all filter options (shown only if toggle is active) */}
      {showFilters && (
        <div className="filter-container">
          <input type="text" placeholder="Subject (e.g., CS)" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} />
          <input type="text" placeholder="Professor" value={filterProfessor} onChange={(e) => setFilterProfessor(e.target.value)} />
          <input type="text" placeholder="Type (Lecture, Lab)" value={filterType} onChange={(e) => setFilterType(e.target.value)} />
          <input type="number" placeholder="Credits" value={filterCredits} onChange={(e) => setFilterCredits(e.target.value)} />
          <input type="number" step="0.01" placeholder="Min GPA" value={minGPA} onChange={(e) => setMinGPA(e.target.value)} />
          <input type="text" placeholder="Keyword (e.g., AI, design)" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />

          {/* day checkboxes */}
          <div className="day-checkboxes">
            {Object.keys(selectedDays).map((day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={selectedDays[day]}
                  onChange={() => setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }))}
                /> {day}
              </label>
            ))}
          </div>

          {/* start time slider */}
          <div className="time-slider">
            <label>Start Time Range: {startTimeRange[0]}:00–{startTimeRange[1]}:00</label>
            <input type="range" min="0" max="23" value={startTimeRange[0]} onChange={(e) => setStartTimeRange([parseInt(e.target.value), startTimeRange[1]])} />
            <input type="range" min="1" max="24" value={startTimeRange[1]} onChange={(e) => setStartTimeRange([startTimeRange[0], parseInt(e.target.value)])} />
          </div>

          {/* extra checkboxes */}
          <div className="checkbox-row">
            <label><input type="checkbox" checked={onlyOpen} onChange={() => setOnlyOpen(!onlyOpen)} /> Open Only</label>
            <label><input type="checkbox" checked={inPersonOnly} onChange={() => setInPersonOnly(!inPersonOnly)} /> In-Person Only</label>
          </div>
        </div>
      )}

      {/* show time conflict warning if it happens */}
      {conflictWarning && <div className="conflict-warning">⚠️ {conflictWarning}</div>}

      {/* gpa legend to help users understand row coloring */}
      <div className="legend">
        <strong>GPA Legend:</strong>
        <div>🟩 GPA ≥ 3.7</div>
        <div>🟨 3.0 ≤ GPA &lt; 3.7</div>
        <div>🟥 GPA &lt; 3.0</div>
      </div>

      {/* course table */}
      <div className="overflow-x-auto">
        <table className="course-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Class Number</th>
              <th>Title</th>
              <th>Primary Instructor Name</th>
              <th>GPA</th>
              {data.length > 0 && Object.keys(data[0])
                .filter(k => ![
                  "", "Unnamed: 0", "ClassNumber", "Title", "Primary Instructor Name", "GPA",
                  "Instructor2", "Days2", "Room2", "MeetingDates2",
                  "Instructor3", "Days3", "Room3", "MeetingDates3",
                  "Instructor4", "Days4", "Room4", "MeetingDates4",
                  "Topic"
                ].includes(k))
                .map((key) => (
                  <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                    {key} {sortKey === key ? (sortOrder === "asc" ? "⬆" : "⬇") : ""}
                  </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index} className={getGPAClass(row.GPA)}>
                <td>
                  <button onClick={() => {
                    const conflict = checkConflicts(row);
                    if (conflict) setConflictWarning(conflict);
                    else {
                      setSelectedCourses(prev => [...prev, row]);
                      setConflictWarning("");
                    }
                  }}>Select</button>
                </td>
                <td>{row["ClassNumber"] || "N/A"}</td>
                <td>{row["Title"] || "N/A"}</td>
                <td>{row["Primary Instructor Name"] || "N/A"}</td>
                <td>{row["GPA"] || "N/A"}</td>
                {Object.keys(row)
                  .filter(k => ![
                    "", "Unnamed: 0", "ClassNumber", "Title", "Primary Instructor Name", "GPA",
                    "Instructor2", "Days2", "Room2", "MeetingDates2",
                    "Instructor3", "Days3", "Room3", "MeetingDates3",
                    "Instructor4", "Days4", "Room4", "MeetingDates4",
                    "Topic"
                  ].includes(k))
                  .map((key, i) => (
                    <td key={i}>{row[key] || "N/A"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* credit footer */}
      <footer className="credits">
        Created by Aryan Thodupunuri and Nikhil Kapadia
      </footer>
    </div>
  );
}
