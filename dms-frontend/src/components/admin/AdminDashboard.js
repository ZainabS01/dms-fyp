import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { motion } from 'framer-motion';

// Pages
import FacultyManagement from './FacultyManagement';
import AttendanceOversight from './AttendanceOversight';
import Noticeboard from './NoticeBoard';  
import StudentManagement from './StudentManagement';  
import TeacherVerification from './TeacherVerification';
import QuerySection from './QuerySection';

const AdminDashboard = () => {

  // Stats View Component (Main Home Screen of Dashboard)
  const StatsView = () => {
    const stats = [
      { title: 'Total Students', value: '450', color: 'border-blue-500' },
      { title: 'Total Faculty', value: '32', color: 'border-green-500' },
      { title: 'Present Today', value: '88%', color: 'border-[#d4a017]' },
      { title: 'Pending Tasks', value: '05', color: 'border-purple-500' },
    ];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto"
      >
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] uppercase italic tracking-tighter">
              System <span className="text-[#d4a017]">Overview</span>
            </h1>
            <div className="h-1.5 w-20 bg-[#d4a017] rounded-full mt-1"></div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              whileHover={{ y: -10 }} 
              key={index} 
              className={`bg-white p-8 rounded-[35px] shadow-xl border-b-[10px] ${stat.color} transition-all`}
            >
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.title}</p>
              <h2 className="text-5xl font-black text-[#001f3f] mt-3 tracking-tighter">{stat.value}</h2>
            </motion.div>
          ))}
        </div>

        {/* Hero Section / Banner */}
        <div className="mt-12 bg-[#001f3f] p-16 rounded-[50px] text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-tight">
              Department Control <br /> 
              <span className="text-[#d4a017]">Management Panel</span>
            </h2>
            <p className="mt-4 text-slate-400 font-medium max-w-md">
              Access real-time analytics, manage faculty records, and monitor student performance from a centralized hub.
            </p>
            <button className="mt-10 bg-[#d4a017] hover:bg-white text-[#001f3f] px-12 py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest transition-all shadow-lg">
              Generate System Report
            </button>
          </div>
          
          {/* Background Decorative Circle */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl"></div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      {/* Sidebar: Iski width AdminSidebar mein 'w-72' honi chahiye */}
      <AdminSidebar activeTab="Dashboard" />
      
      {/* Main Content: ml-72 sidebar ki jagah chorrne ke liye zaroori hai */}
      <main className="flex-1 ml-72 p-12 overflow-x-hidden">
        <Routes>
          {/* Default view jab /admin-dashboard khule */}
          <Route index element={<StatsView />} />
          
          {/* Sub-pages */}
          <Route path="faculty-management" element={<FacultyManagement />} />
          <Route path="student-management" element={<StudentManagement />} />
          <Route path="attendance-oversight" element={<AttendanceOversight />} />
          <Route path="notice-board" element={<Noticeboard />} />
          <Route path="teacher-verification" element={<TeacherVerification />} />
          <Route path="queries" element={<QuerySection />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;