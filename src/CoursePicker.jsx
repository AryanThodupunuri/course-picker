import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function CoursePicker() {
  const [data, setData] = useState([]);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterProfessor, setFilterProfessor] = useState("");

  // Function to handle file upload and read Excel data
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert to JSON
      setData(sheetData); // Store in state
    };

    reader.readAsBinaryString(file);
  };

  // Filter data based on user input
  const filteredData = data.filter((row) =>
    (filterSubject ? row.Subject?.toLowerCase().includes(filterSubject.toLowerCase()) : true) &&
    (filterProfessor ? row["Primary Instructor Name"]?.toLowerCase().includes(filterProfessor.toLowerCase()) : true)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">UVA Course Picker</h1>
      
      {/* File Upload */}
      <div className="mb-4 text-center">
        <input type="file" accept=".xlsx" onChange={handleFileUpload} className="border p-2" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4 justify-center">
        <input
          type="text"
          placeholder="Filter by Subject (e.g., CS, MATH)"
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

      {/* Course Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse border w-full text-sm">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="border p-2">Subject</th>
              <th className="border p-2">Catalog #</th>
              <th className="border p-2">Class Title</th>
              <th className="border p-2">Professor</th>
              <th className="border p-2">GPA</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={index} className="text-center">
                  <td className="border p-2">{row.Subject}</td>
                  <td className="border p-2">{row["Catalog Number"]}</td>
                  <td className="border p-2">{row["Class Title"]}</td>
                  <td className="border p-2">{row["Primary Instructor Name"]}</td>
                  <td className="border p-2">{row["Course GPA"]}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4">No courses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
