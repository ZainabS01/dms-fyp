import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';


// Landing Page Components
import Navbar from './components/landing-page/Navbar';
import Home from './pages/Home'; 
import About from './components/landing-page/About';
import Footer from './components/landing-page/Footer';
import Contact from './components/landing-page/Contact-Us';
import Departments from './components/landing-page/Departments';
import Registration from './components/landing-page/Registration';
import Login from './components/landing-page/Login';  
import ForgotPasswordModal from './components/landing-page/ForgotPasswordModal'; 

// Dashboard Components
import StudentDashboard from './components/student/StudentDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard'; 
import AdminDashboard from './components/admin/AdminDashboard';


// --- LayoutHandler: Handles UI Flow and Sidebar/Navbar logic ---
function LayoutHandler({ user, setUser, onLogout }) {
  const location = useLocation();
  // Checks if we are on any dashboard page
  const isDashboard = location.pathname.includes('dashboard');

  return (
    <div className="app-container">
      {/* Show Navbar only when outside the dashboard */}
      {!isDashboard && <Navbar />}
      
      <main className={isDashboard ? "dashboard-layout" : "page-content"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgotPasswordModal />} />
          
          <Route 
            path="/login" 
            element={<Login setUser={setUser} />} 
          />

          {/* PROTECTED ADMIN ROUTE */}
          <Route 
            path="/admin-dashboard/*" 
            element={
              user && user.role?.toLowerCase() === 'admin' ? (
                <AdminDashboard user={user} setUser={setUser} onLogout={onLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* PROTECTED TEACHER ROUTE */}
          <Route 
            path="/teacher-dashboard/*" 
            element={
              user && user.role?.toLowerCase() === 'teacher' ? (
                <TeacherDashboard user={user} setUser={setUser} onLogout={onLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* PROTECTED STUDENT ROUTE */}
          <Route 
            path="/student-dashboard/*" 
            element={
              user && user.role?.toLowerCase() === 'student' ? (
                <StudentDashboard user={user} setUser={setUser} onLogout={onLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Fallback: Redirect to Home if path doesn't match */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Show Footer only on landing pages */}
      {!isDashboard && <Footer />}
    </div>
  );
}

// --- Main App Component ---
function App() {
  // Persistence logic: User stays logged in on page refresh
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      return (savedUser && token) ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Storage error:", error);
      return null;
    }
  });

  // Sync localStorage when user state changes (Login/Logout)
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    toast.success("Successfully logged out!", {
        style: { background: '#001f3f', color: '#fff', borderRadius: '15px' }
    });
  };

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <LayoutHandler user={user} setUser={setUser} onLogout={handleLogout} />
    </Router>
  );
}

export default App;


// import React from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';

// function App() {
//   return (
//     <BrowserRouter>
//       <div className="App">
//         <h1>Testing: Website is working!</h1>
//       </div>
//     </BrowserRouter>
//   );
// }
// export default App;