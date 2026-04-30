import React from 'react';
import { motion } from 'framer-motion';

const TeacherSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'students', label: 'Students', icon: '🎓' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'tasks', label: 'Tasks', icon: '📝' },
    { id: 'timetable', label: 'Timetable', icon: '⏰' },
    { id: 'queries', label: 'Queries', icon: '💬' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="w-64 min-h-screen bg-[#001f3f] text-white p-6 flex flex-col shadow-2xl">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#001f3f] font-black text-xl shadow-lg">
          D
        </div>
        <h1 className="text-xl font-black tracking-tighter italic">DMS PORTAL</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${
              activeTab === item.id 
              ? 'bg-[#d4a017] text-[#001f3f] shadow-lg scale-105' 
              : 'hover:bg-white/10 text-blue-100/60'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="pt-6 border-t border-white/10">
        <button 
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all"
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
};

export default TeacherSidebar;