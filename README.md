<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000" />
  <img src="https://img.shields.io/badge/JSON-292929?style=for-the-badge&logo=json&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

# UVA CS Course Planner
A course planning tool built with React to help UVA Computer Science students effortlessly search, filter, and plan their semester schedules. The tool offers rich filtering options, conflict detection, and visual cues to help students build a better schedule.

👉 **Live App:** [course-picker.vercel.app](https://course-picker.vercel.app)


## Features
### Filtering Courses
- **You can filter courses by multiple criteria**
  - Subject, Professor, Type, GPA, Credits – Managed with useState; updates in real time.
  - Meeting Days & Time Range – Includes weekday checkboxes and a time slider.
  - Keyword Search – Matches in course title and description (case-insensitive).

- **By meeting days and time range**
  - There are checkboxes for each weekday (like Mo/We/Fr) and sliders for setting the time window. I wrote a `parseStartTime()` function that uses regex to extract time info (like “10:00am”) and convert it into a number using 24-hour format. This lets us filter courses based on when they start.

- **By keyword**
  The keyword input checks both the course title and description. It’s a case-insensitive match and runs on every keystroke using `.toLowerCase().includes()` inside the filter logic.

---

### GPA-Based Row Coloring
- Rows are color-coded to reflect average GPA:
  - 🟩 Green for GPA ≥ 3.7
  - 🟨 Yellow for 3.0 ≤ GPA < 3.7
  - 🟥 Red for GPA < 3.0
- Implemented using a helper function `getGPAClass()` that returns the appropriate CSS class.

---

### Conflict Detection
- When a course is selected using the “Select” button, the app checks whether the course overlaps in time with any previously selected courses.
- If it finds a conflict, it shows a warning message at the top. If not, the course gets added to the `selectedCourses` array in state.
- Logic is handled by `checkConflicts()` which compares parsed start/end times and overlapping days.

---

### Table Sorting
- Clicking on any table header sorts the column in ascending/descending order.
- Sorting is handled through `handleSort()` and tracked using `sortKey` and `sortOrder` state.

---

### UI Design
- The app uses a compact, responsive layout.
- Styled with UVA brand colors (navy + orange) and a light academic theme.
- Filter section is collapsible via the “Show/Hide Filters” button.
- Summary box at the top explains the purpose of the tool.

---

# Built With
- **React.js** - Functional components and hooks
- **HTML + CSS** – Custom styling with UVA branding
- **JavaScript** – For filtering, sorting, and time parsing logic
- **JSON** - Local data loaded from public/courses.json
- **Python/Pandas** – Used for merging and preprocessing datasets before frontend consumption
- **Vercel** - For deployment

# Dataset Info
- **Spring 2025 Course Data** – Pulled from SIS or public course listings
- **Historical GPA Data** – Merged using Subject, Catalog Number, and Instructor
- The merged dataset is stored in public/courses.json and includes:
    - Spring 2025 schedule data from UVA SIS
    - Historical GPA data joined using course subject, catalog number, and instructor name

# How to Run Locally
**1. Clone the repo**
git clone https://github.com/AryanThodupunuri/course-picker.git
cd course-picker

**2. Install dependencies**
npm install

**3. Start the development server**
npm start

# Future Improvements
- Calendar view of selected classes
- Smarter optimization using genetic algorithms
- Real-time data sync from SIS API
- Professor ratings from RateMyProfessors or UVA-specific reviews
