# UVA Course Optimizer
This is a web application that helps students at the University of Virginia (UVA) build their ideal course schedules. The app pulls course data for Spring 2025 (and historical GPA data) and allows students to filter, search, and optimize schedules based on GPA, class times, and instructor preferences.

# Features
1. Multi-criteria Search
- Filter courses by subject, professor, and minimum GPA.

2. Historical GPA Integration
- GPA data from previous semesters is merged in to help students make informed decisions.

3. Schedule Preferences
- Toggle options to avoid morning or evening classes, allow breaks, and prioritize GPA vs. professor quality.

4. Schedule Conflict Detection
- Prevents students from adding overlapping courses.

5. Optimized Schedule Generator
- Automatically selects the best possible schedule based on user-defined weightings.

6. Course Export (Coming Soon)
- Export your selected schedule to a calendar or PDF.

# Built With
- React.js – UI and interactivity
- TailwindCSS – Responsive styling
- PapaParse – CSV parsing (if using CSV input)
- Python/Pandas – Used for merging and preprocessing datasets before frontend consumption

# Folder Structure

├── public/

│   └── courses.json              # Merged Spring 2025 + GPA dataset

├── src/

│   ├── CoursePicker.jsx         # Main component for course filtering and selection

│   ├── ScheduleView.jsx         # (Optional) Selected course overview / calendar view

│   └── App.js                   # Main entry point

├── README.md

└── package.json

# Dataset Info
Spring 2025 Course Data – Pulled from SIS or public course listings

Historical GPA Data – Merged using Subject, Catalog Number, and Instructor

Final dataset lives in public/courses.json

# How to Run Locally
1. Clone the repo
git clone https://github.com/AryanThodupunuri/course-picker.git
cd uva-course-optimizer

2. Install dependencies
npm install

3. Start the development server
npm start

# Future Improvements
- Calendar view of selected classes

- Smarter optimization using genetic algorithms

- Real-time data sync from SIS API

- Professor ratings from RateMyProfessors or UVA-specific reviews

# Author
Made by Aryan Thodupunuri

UVA Class of 2027 – B.A. Computer Science

Feel free to connect on [LinkedIn](https://www.linkedin.com/in/aryan-thodupunuri/) or reach out via email at [aryan20544@gmail.com](mailto:aryan20544@gmail.com).
