import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './StudentSidebar';
import Overview from './StudentOverview';
import Attendance from './StudentAttendance';
import Task from './StudentTask';
import Result from './StudentResult';
import CourseData from './StudentCourseData';
import QuerySection from './QuerySection'; 
import StudentHeader from './StudentHeader';

const StudentDashboard = ({ user, setUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [academicData, setAcademicData] = useState(null); // Teacher's data state
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : user;
    } catch (e) {
      return user;
    }
  });

  // --- MERGED DATA FETCHING LOGIC ---
  useEffect(() => {
    const syncData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // 1. Fetch User Profile Data
        const userRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'x-auth-token': token }
        });

        if (userRes.data.success) {
          const freshUser = userRes.data.user;
          setCurrentUser(freshUser);
          if (setUser) setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }

        // 2. Fetch Teacher's Academic Data (for CourseData & Results)
        // Note: Make sure this route exists in your backend
        const academicRes = await axios.get('http://localhost:5000/api/student/academic-record', {
          headers: { 'x-auth-token': token }
        });
        
        if (academicRes.data) {
          setAcademicData(academicRes.data);
        }

      } catch (err) {
        console.error("Data sync failed:", err);
      }
    };

    syncData();
  }, [setUser]);

  const handleUpdateProfile = async (updatedFields) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/users/update/${currentUser._id}`, updatedFields);
      if (res.data.success) {
        const updatedUser = res.data.user; 
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear(); 
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <p className="text-[#002147] font-bold animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  const getVal = (field) => currentUser?.[field] || currentUser?.user?.[field] || "N/A";

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#002147]/60 backdrop-blur-md px-4">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">👋</div>
            <h3 className="text-2xl font-black text-[#002147] mb-3 uppercase tracking-tighter">Sign Out?</h3>
            <p className="text-slate-500 text-sm font-medium mb-10">Kiya aap waqai session khatam karna chahte hain?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogout} className="w-full py-4 bg-[#e11d48] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all">
                Yes, Sign Out
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full py-4 rounded-2xl font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar 
        activePage={activeTab} 
        setActivePage={setActiveTab} 
        onLogoutTrigger={() => setShowLogoutModal(true)} 
      />

      <div className="flex-1 lg:ml-72 flex flex-col h-full overflow-hidden">
        
        <StudentHeader 
            activePage={activeTab === 'queries' ? 'Query Hub' : activeTab} 
            userName={getVal('name')} 
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 custom-scrollbar bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto pb-10">
            {activeTab === 'overview' && (
              <Overview 
                user={currentUser} 
                onUpdate={handleUpdateProfile} 
                academicData={academicData} // Passing to show CGPA/Attendance
              />
            )}
            {activeTab === 'attendance' && <Attendance academicData={academicData} />}
            {activeTab === 'task' && <Task />}
            {activeTab === 'result' && <Result user={currentUser} academicData={academicData} />}
            {activeTab === 'queries' && <QuerySection userRole="student" />}
            {activeTab === 'data' && (
              <CourseData academicData={academicData} /> // Passing folders data
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;