import React, { useState } from 'react';
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

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminInfo = user || { name: "SUPER ADMIN", role: "ADMIN" };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
      />
 
      {/* Main Container */}
      <main className={`flex-1 ml-0 md:ml-64 h-full flex flex-col transition-all duration-300 ease-in-out ${activeTab === 'nexi' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
        
        {/* Sticky Header Area */}
        <div className={`sticky top-0 z-30 bg-[#f1f3f6]/80 backdrop-blur-md flex-shrink-0 ${activeTab === 'nexi' ? 'p-1.5 sm:p-3 md:p-4' : 'p-2 sm:p-4 md:p-6 lg:p-8'}`}>
           <AdminHeader 
             activeTab={activeTab} 
             adminName={adminInfo.name} 
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

export default AdminDashboard;