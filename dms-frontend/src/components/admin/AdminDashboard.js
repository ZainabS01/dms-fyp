import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminOverview from './AdminOverview';
import AdminProfile from './AdminProfile';

import StudentManagement from './StudentManagement';
import FacultyManagement from './FacultyManagement';
import TeacherVerification from './TeacherVerification';
import QuerySection from './QuerySection';
import Noticeboard from './NoticeBoard';
import NexiChat from '../nexi/AiChat';
import DepartmentManagement from './DepartmentManagement';
import AdminTimetable from './AdminTimetable';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminInfo = user || { name: "SUPER ADMIN", role: "ADMIN" };

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
      case 'dashboard': return <AdminOverview setActiveTab={setActiveTab} />;
      case 'student_management': return <StudentManagement />;
      case 'faculty_management': return <FacultyManagement />;
      case 'teacher_verification': return <TeacherVerification />;
      case 'queries': return <QuerySection userRole="admin" user={adminInfo} />;
      case 'notice_board': return <Noticeboard />;
      case 'profile': return <AdminProfile user={adminInfo} />;
      case 'nexi': return <NexiChat user={adminInfo} setActiveTab={setActiveTab} backTab="dashboard" />;
      case 'department_management': 
        return <DepartmentManagement />;
      case 'timetable': return <AdminTimetable />;
      default: return <AdminOverview setActiveTab={setActiveTab} />;
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
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false); 
        }} 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        adminName={adminInfo.name}
        adminProfilePic={adminInfo.profilePic}
      />
 
      {/* Main Container */}
      <main className={`flex-1 ml-0 md:ml-64 h-full flex flex-col transition-all duration-300 ease-in-out ${(activeTab === 'nexi' || activeTab === 'dashboard') ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
        
        {/* Sticky Header Area */}
        <div className={`sticky top-0 z-30 bg-[#f1f3f6]/80 backdrop-blur-md flex-shrink-0 ${activeTab === 'nexi' ? 'p-1.5 sm:p-3 md:p-4' : 'p-0'}`}>
           <AdminHeader 
             activeTab={activeTab} 
             adminName={adminInfo.name} 
             adminProfilePic={adminInfo.profilePic}
             onOpenNexi={() => setActiveTab('nexi')}
             setActiveTab={setActiveTab}
             toggleSidebar={toggleSidebar}
           />
        </div>

        {/* Display Current Tab Panel Container */}
        <div className={`px-4 pt-6 sm:px-6 md:px-8 lg:px-10 ${(activeTab === 'nexi' || activeTab === 'dashboard') ? 'flex-1 pb-4 min-h-0 overflow-hidden flex flex-col' : 'pb-12'}`}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`mx-auto w-full ${(activeTab === 'nexi' || activeTab === 'dashboard') ? 'flex-1 h-full flex flex-col min-h-0 max-w-[1600px]' : 'max-w-[1600px]'}`}
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

export default AdminDashboard;