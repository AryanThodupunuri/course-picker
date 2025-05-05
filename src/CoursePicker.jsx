import React, { useState, useEffect } from "react";
import "./CoursePicker.css";

export default function CoursePicker() {
  const [data, setData] = useState([]);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterProfessor, setFilterProfessor] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCredits, setFilterCredits] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [filterDays, setFilterDays] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetch("/courses.json")
      .then((response) => response.json())
      .then((jsonData) => {
        if (jsonData.Sheet1 && Array.isArray(jsonData.Sheet1)) {
          setData(jsonData.Sheet1);
        } else {
          console.error("JSON format incorrect.");
        }
      })
      .catch((error) => console.error("Error loading course data:", error));
  }, []);

  const handleSort = (key) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey] || "";
    const valB = b[sortKey] || "";
    return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const filteredData = sortedData.filter((row) => {
    const subjectMatch = !filterSubject || row.Subject?.toLowerCase().includes(filterSubject.toLowerCase());
    const professorMatch = !filterProfessor || row["Instructor(s)"].toLowerCase().includes(filterProfessor.toLowerCase());
    const typeMatch = !filterType || row.Type?.toLowerCase().includes(filterType.toLowerCase());
    const creditsMatch = !filterCredits || row.Units?.replace(/[^\d]/g, '') === filterCredits;
    const openMatch = !onlyOpen || row.Enrollment?.toLowerCase() === "open";
    const timeMatch = !filterTime || (row.Days && row.Days.match(/\d{1,2}:\d{2}[ap]m/i)?.[0] < filterTime);
    const daysMatch = !filterDays || (row.Days && row.Days.toLowerCase().includes(filterDays.toLowerCase()));

    return subjectMatch && professorMatch && typeMatch && creditsMatch && openMatch && timeMatch && daysMatch;
  });

  return (
    <div className="course-picker-container">
      <h1 className="course-picker-title">UVA Course Picker</h1>

      {/* Filters */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filter by Subject (e.g., CS)"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Professor"
          value={filterProfessor}
          onChange={(e) => setFilterProfessor(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Type (e.g., Lecture)"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        />
        <input
          type="number"
          placeholder="Credits (e.g., 3)"
          value={filterCredits}
          onChange={(e) => setFilterCredits(e.target.value)}
        />
        <input
          type="text"
          placeholder="Before Time (e.g., 2:00pm)"
          value={filterTime}
          onChange={(e) => setFilterTime(e.target.value)}
        />
        <input
          type="text"
          placeholder="Days (e.g., MoWeFr)"
          value={filterDays}
          onChange={(e) => setFilterDays(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={() => setOnlyOpen(!onlyOpen)}
          />
          Open Classes Only
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="course-table">
          <thead>
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    style={{ cursor: "pointer" }}
                  >
                    {key} {sortKey === key ? (sortOrder === "asc" ? "⬆" : "⬇") : ""}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value || "N/A"}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={data[0] ? Object.keys(data[0]).length : 1} className="text-center p-4">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
