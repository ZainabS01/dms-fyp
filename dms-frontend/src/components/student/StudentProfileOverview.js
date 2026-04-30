// src/components/StudentDashboard/ProfileOverview.js
import React from 'react';

const ProfileOverview = () => {
  // Mock data (replace with backend API call)
  const student = {
    name: "Ayesha Khan",
    rollNo: "CS-2022-08",
    dept: "Computer Science",
    semester: "8th",
    attendancePercentage: 82,
    cgpa: 3.82,
    pendingDues: 2,
  };

  return (
    <div className="profile-overview-page">
      {/* 1. Header (image_5 layout) */}
      <div className="page-header">
        <h1>Profile / BE Computer Science</h1>
      </div>

      <div className="profile-dashboard-grid">
        {/* 2. Main Profile Card (Left Side) */}
        <div className="profile-main-card">
          <div className="profile-pic-container">
            <span className="profile-initials">KA</span>
          </div>
          <h3>{student.name}</h3>
          <p>{student.dept}</p>
          <p>Semester: {student.semester}</p>
          <p>Roll No: {student.rollNo}</p>
          <button className="edit-btn">Edit Profile</button>
        </div>

        {/* 3. Action Cards Row (Right Side, top) */}
        <div className="profile-action-cards">
          <button className="action-card">Check Attendance</button>
          <button className="action-card">Latest Task</button>
          <button className="action-card">Class Schedule</button>
          <button className="action-card">Assignments</button>
          <button className="action-card">Result 2k26</button>
        </div>

        {/* 4. Statistics Summary (Right Side, bottom) */}
        <div className="stats-summary-row">
          <div className="stat-summary-card">
            <h4>Attendance</h4>
            <div className="circular-progress-container">
              <span className="percent">{student.attendancePercentage}%</span>
            </div>
          </div>
          <div className="stat-summary-card">
            <h4>CGPA</h4>
            <span className="number-stat">{student.cgpa}</span>
          </div>
          <div className="stat-summary-card">
            <h4>Pending Dues</h4>
            <span className="number-stat">{student.pendingDues}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;