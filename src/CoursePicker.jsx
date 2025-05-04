import React, { useState, useEffect } from "react";

export default function CoursePicker() {
  const [data, setData] = useState([]);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterProfessor, setFilterProfessor] = useState("");
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

  const filteredData = sortedData.filter((row) =>
    (!filterSubject || row.Subject?.toLowerCase().includes(filterSubject.toLowerCase())) &&
    (!filterProfessor || row["Primary Instructor Name"]?.toLowerCase().includes(filterProfessor.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">UVA Course Picker</h1>

      {/* Filters */}
      <div className="mb-4 flex gap-4 justify-center">
        <input
          type="text"
          placeholder="Filter by Subject (e.g., CS)"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="border p-2 w-60"
        />
        <input
          type="text"
          placeholder="Filter by Professor"
          value={filterProfessor}
          onChange={(e) => setFilterProfessor(e.target.value)}
          className="border p-2 w-60"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse border w-full text-sm">
          <thead>
            <tr className="bg-gray-200 text-left">
              {data.length > 0 &&
                Object.keys(data[0]).map((key) => (
                  <th key={key} className="border p-2">
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={index} className="text-center hover:bg-gray-100">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="border p-2">
                      {value || "N/A"}
                    </td>
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
