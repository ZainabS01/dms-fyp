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

// --- LayoutHandler: Handles UI flow and Protection Logic ---
function LayoutHandler({ user, setUser, onLogout }) {
  const location = useLocation();
  const isDashboard = location.pathname.includes('dashboard');

  return (
    <div className="app-container">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Navbar sirf landing pages par dikhayen */}
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
          
          {/* LOGIN ROUTE: 
            Direct redirect nahi kiya gaya. Login component decide karega 
            ke user ko verification PIN screen par bhejna hai ya dashboard par.
          */}
          <Route 
            path="/login" 
            element={<Login setUser={setUser} />} 
          />

          {/* PROTECTED TEACHER ROUTE: 
            Sirf tab access hoga jab user authenticated ho aur role 'teacher' ho.
          */}
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

          {/* PROTECTED STUDENT ROUTE:
          */}
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

          {/* Fallback for 404 or unauthorized */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isDashboard && <Footer />}
    </div>
  );
}

// --- Main App Component ---
function App() {
  // Persistence logic: localStorage se data uthana
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      // Accurate Check: User aur Token dono hon tabhi login state maintain hogi
      return (savedUser && token) ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Storage error:", error);
      return null;
    }
  });

  // Jab bhi user state change ho, localStorage update krien
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // Logout ki surat mein sab clear krien security ke liye
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.clear(); // Clear all session data
    toast.success("Successfully logged out!", {
        style: { background: '#001f3f', color: '#fff', borderRadius: '15px' }
    });
  };

  return (
    <Router>
      <LayoutHandler user={user} setUser={setUser} onLogout={handleLogout} />
    </Router>
  );
}

export default App;