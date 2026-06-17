import React, { useState } from 'react';

const AdminSidebar = ({ activeTab, setActiveTab, sidebarOpen, toggleSidebar }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'student_management', label: 'STUDENTS', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'faculty_management', label: 'FACULTY', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'teacher_verification', label: 'TEACHER VERIFY', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'timetable', label: 'TIMETABLE', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'queries', label: 'QUERIES', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'department_management', label: 'DEPARTMENTS', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'notice_board', label: 'NOTICE BOARD', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'nexi', label: 'NEXI AI', icon: 'M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'profile', label: 'PROFILE', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ];

  return (
    <>
      <aside className={`fixed top-0 bottom-0 left-0 z-[200] w-64 bg-[#001f3f] text-white p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-white/5 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* Brand Header */}
        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden shrink-0 p-0.5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-wider text-white">DMS PORTAL</h1>
              <p className="text-[10px] font-bold text-[#d4a017] tracking-[0.2em] uppercase">Admin Desk</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-sidebar-scroll">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-[11px] tracking-wider uppercase transition-all duration-300 group
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-[#d4a017] to-[#b8860b] text-[#001f3f] shadow-lg shadow-[#d4a017]/20 scale-[1.02]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white hover:pl-6'
                }`}
            >
              <svg className={`w-4 h-4 shrink-0 transition-colors ${activeTab === item.id ? 'text-[#001f3f]' : 'text-slate-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="pt-6 mt-6 border-t border-white/10">
          <button 
            onClick={() => setShowLogoutModal(true)} 
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-bold text-[11px] tracking-wider uppercase transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Modern Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
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
    </>
  );
};

export default AdminSidebar;