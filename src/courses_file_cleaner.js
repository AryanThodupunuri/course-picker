const fs = require('fs');

// Read the original JSON file (use correct path from `src/`)
const rawData = fs.readFileSync('../public/updated_courses_full.json', 'utf8');
const data = JSON.parse(rawData);

// Define grade keys to remove
const gradeKeys = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "DFW"];

// Iterate through each item in Sheet1 and delete the grade keys
data.Sheet1.forEach(course => {
    gradeKeys.forEach(key => {
        delete course[key];
    });
});

// Write the cleaned data to a new file
fs.writeFileSync('../public/updated_courses_cleaned.json', JSON.stringify(data, null, 2));

console.log('✅ Grades removed. Cleaned file saved as updated_courses_cleaned.json.');
