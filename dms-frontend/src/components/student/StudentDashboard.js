import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './StudentSidebar';
import Overview from './StudentOverview';
import Attendance from './StudentAttendance';
import Task from './StudentTask';
import StudentResult from './StudentResult';
import CourseData from './StudentCourseData';
import QuerySection from './QuerySection'; 
import StudentHeader from './StudentHeader';
import StudentTimetable from './StudentTimetable';
// NEXI AI Import
import NexiChat from '../nexi/AiChat'; 

const StudentDashboard = ({ user, setUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [academicData, setAcademicData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // NEXI State
  const [isNexiOpen, setIsNexiOpen] = useState(false); 
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : user;
    } catch (e) {
      return user;
    }
  });

  useEffect(() => {
    const syncData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: { 'x-auth-token': token }
        });

        if (userRes.data.success) {
          const freshUser = userRes.data.user;
          setCurrentUser(freshUser);
          if (setUser) setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }

        const academicRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/academic-record`, {
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
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/update/${currentUser._id}`, updatedFields);
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Logout Confirm</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Are you sure you want to end your current session?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors">No, Stay</button>
              <button onClick={handleLogout} className="flex-1 py-3.5 bg-[#001f3f] hover:bg-blue-900 text-white font-bold rounded-2xl transition-colors shadow-lg">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-[150] bg-black/40 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <Sidebar 
        activePage={activeTab} 
        setActivePage={(page) => {
          setActiveTab(page);
          setIsNexiOpen(false);
          setSidebarOpen(false);
        }} 
        onLogoutTrigger={() => setShowLogoutModal(true)} 
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 ml-0 md:ml-64 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out">
        
        {/* Updated Header with onOpenNexi prop */}
        <StudentHeader 
            activePage={activeTab === 'queries' ? 'Query Hub' : activeTab === 'nexi' ? 'Nexi AI' : activeTab} 
            userName={getVal('name')} 
            onOpenNexi={() => setActiveTab('nexi')}
            setActiveTab={setActiveTab}
            toggleSidebar={toggleSidebar}
        />

        <main className={`flex-1 bg-[#f8fafc] flex flex-col ${activeTab === 'nexi' ? 'p-3 lg:p-4 overflow-hidden' : 'p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar'}`}>
          <div className={`mx-auto w-full ${activeTab === 'nexi' ? 'h-full flex flex-col max-w-none' : 'max-w-7xl pb-10'}`}>
            {activeTab === 'overview' && (
              <Overview 
                user={currentUser} 
                onUpdate={handleUpdateProfile} 
                academicData={academicData} 
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'attendance' && <Attendance academicData={academicData} />}
            {activeTab === 'task' && <Task studentData={currentUser} />}
            {activeTab === 'result' && (
              <StudentResult 
                studentData={currentUser} 
                user={currentUser}
              />
            )}
            {activeTab === 'queries' && <QuerySection user={currentUser} userRole="student" />}
            {activeTab === 'data' && (
              <CourseData 
                  academicData={academicData} 
                  selectedDept={getVal('department')} 
                  selectedSem={getVal('semester')} 
              />
            )}
            {activeTab === 'timetable' && <StudentTimetable studentData={currentUser} />}
            {activeTab === 'nexi' && (
              <NexiChat 
                user={currentUser} 
                setActiveTab={setActiveTab}
              />
            )}
          </div>
        </main>
      </div>

      {/* NEXI Chat Modal rendering */}
      {isNexiOpen && (
        <NexiChat 
          isOpen={isNexiOpen} 
          onClose={() => setIsNexiOpen(false)} 
          userRole="student" 
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;