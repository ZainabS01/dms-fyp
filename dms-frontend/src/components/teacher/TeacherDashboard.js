import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TeacherSidebar from './TeacherSidebar';
import TeacherOverview from './TeacherOverview';
import ManageAttendance from './ManageAttendance';
import StudentQueries from './StudentQueries';
import TeacherProfile from './TeacherProfile';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Content change logic based on sidebar clicks
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <TeacherOverview />;
      case 'attendance': return <ManageAttendance />;
      case 'queries': return <StudentQueries />;
      case 'profile': return <TeacherProfile />;
      default: return <TeacherOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f1f3f6]">
      {/* Sidebar - Pass state to control view */}
      <TeacherSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-3xl shadow-sm border-b-4 border-[#001f3f]">
          <h2 className="text-xl font-black text-[#001f3f] uppercase italic">
            Teacher Portal / <span className="text-[#d4a017]">{activeTab}</span>
          </h2>
          <div className="flex items-center gap-4">
            <span className="bg-[#001f3f] text-white px-4 py-1 rounded-full text-[10px] font-bold">
              SESSION 2026
            </span>
          </div>
        </header>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default TeacherDashboard;