import React, { useState } from 'react';
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

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <TeacherOverview setActiveTab={setActiveTab} />;
      case 'students': 
        return <Students />;
      case 'verification': 
        return <StudentVerification />;
      case 'attendance': 
        return <ManageAttendance />;
      case 'queries': 
        return <QuerySection userRole="teacher" />; 
      case 'tasks': 
        return <Tasks />;
      case 'timetable': 
        return <Timetable />;
      case 'profile': 
        return <TeacherProfile />;
      
      // Sidebar se aane wali activeTab key 'academic_data' ko handle kiya
      case 'academic_data': 
        return <StudentAcademicData />; // Aapki original file ka component data load hoga
      case 'upload_results': 
        return <TeacherResult />;
      default: 
        return <TeacherOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f1f3f6] overflow-hidden font-sans relative">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar execution passing navigation handlers */}
      <TeacherSidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false); 
        }} 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />

      {/* Main Container Layer */}
      <main className="flex-1 ml-0 md:ml-64 h-full overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out">
        
        {/* Responsive Header */}
        <div className="sticky top-0 z-30 p-4 md:p-6 lg:p-8 bg-[#f1f3f6]/80 backdrop-blur-md">
          <header className="flex justify-between items-center bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border-b-4 border-[#001f3f] gap-2">
            
            <div className="flex items-center gap-3">
              {/* Responsive Mobile Hamburger Toggle button */}
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-xl bg-slate-100 text-[#001f3f] md:hidden hover:bg-slate-200 transition-colors focus:outline-none"
                aria-label="Toggle Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <h2 className="text-sm sm:text-base md:text-xl font-black text-[#001f3f] uppercase italic tracking-tighter truncate">
                Teacher Portal / <span className="text-[#d4a017]">{activeTab.replace('_', ' ')}</span>
              </h2>
            </div>

            <div className="flex items-center shrink-0">
              <span className="bg-[#001f3f] text-white px-3 py-1.5 md:px-5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black tracking-widest shadow-lg shadow-[#001f3f]/20 whitespace-nowrap">
                SESSION 2026
              </span>
            </div>
          </header>
        </div>

        {/* Display Current Tab Panel Container */}
        <div className="px-4 md:px-6 lg:px-8 pb-12">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-[1600px] mx-auto"
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