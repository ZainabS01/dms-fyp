import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import TeacherSidebar from './TeacherSidebar';
import TeacherOverview from './TeacherOverview';
import ManageAttendance from './ManageAttendance';
import TeacherProfile from './TeacherProfile';
import QuerySection from './QuerySection';
import StudentVerification from './StudentVerification';
import StudentAcademicData from './StudentAcademicData'; 
import Students from './Students';   
import TeacherResult from './TeacherResult'; 
import Tasks from './Tasks';
import Timetable from './Timetable';
import TeacherHeader from './TeacherHeader';
import NexiChat from '../nexi/AiChat';

const TeacherDashboard = ({ user, setUser }) => { // 'user' prop is received here
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Defined 'teacher' variable to avoid errors
  const teacher = user;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle Browser Back Button to prevent logging out when navigating tabs
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveTab(hash);
      } else {
        setActiveTab('dashboard');
      }
    };

    const fetchLatestProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error("Profile sync error:", err);
      }
    };

    fetchLatestProfile();

    // Initialize from hash if present
    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (window.location.hash.replace('#', '') !== activeTab) {
      if (activeTab === 'dashboard') {
        window.history.pushState(null, '', window.location.pathname);
      } else {
        window.history.pushState(null, '', `#${activeTab}`);
      }
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <TeacherOverview setActiveTab={setActiveTab} />;
      case 'students': return <Students />;
      case 'verification': return <StudentVerification />;
      case 'attendance': return <ManageAttendance />;
      case 'queries': return <QuerySection userRole="teacher" user={teacher} />;
      case 'nexi': return <NexiChat user={teacher} setActiveTab={setActiveTab} backTab="dashboard" />;
      case 'tasks': return <Tasks user={teacher} />;
      case 'timetable': return <Timetable />;
      case 'profile': return <TeacherProfile />;
      case 'academic_data': return <StudentAcademicData />;
      case 'upload_results': return <TeacherResult />;
      default: return <TeacherOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f1f3f6] overflow-hidden font-sans relative">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-[150] bg-black/40 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
 
      {/* Sidebar */}
      <TeacherSidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false); 
        }} 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
 
      {/* Main Container */}
      <main className={`flex-1 ml-0 md:ml-64 h-full flex flex-col transition-all duration-300 ease-in-out ${activeTab === 'nexi' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
        
        {/* Sticky Header Area */}
        <div className={`sticky top-0 z-30 bg-[#f1f3f6]/80 backdrop-blur-md flex-shrink-0 ${activeTab === 'nexi' ? 'p-1.5 sm:p-3 md:p-4' : 'p-2 sm:p-4 md:p-6 lg:p-8'}`}>
           <TeacherHeader 
             activeTab={activeTab} 
             teacherName={teacher?.name || "TEACHER"} 
             isHOD={teacher?.isHOD}
             onOpenNexi={() => setActiveTab('nexi')}
             setActiveTab={setActiveTab}
             toggleSidebar={toggleSidebar}
           />
        </div>

        {/* Display Current Tab Panel Container */}
        <div className={`px-2 sm:px-4 md:px-6 lg:px-8 ${activeTab === 'nexi' ? 'flex-1 pb-4 min-h-0 overflow-hidden flex flex-col' : 'pb-12'}`}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`mx-auto w-full ${activeTab === 'nexi' ? 'flex-1 h-full flex flex-col max-w-none' : 'max-w-[1600px]'}`}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;