import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const StudentSidebar = ({ setActivePage, activePage, onLogoutTrigger, sidebarOpen, toggleSidebar }) => {

  const menuItems = [
    { key: 'overview', label: 'MY PROFILE', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { key: 'attendance', label: 'ATTENDANCE', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { key: 'task', label: 'TASKS & PROJECTS', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { key: 'result', label: 'ACADEMIC RESULT', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z' }, 
    { key: 'timetable', label: 'TIMETABLE', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'queries', label: 'QUERY HUB', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }, 
    { key: 'data', label: 'COURSE DATA', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { key: 'nexi', label: 'NEXI AI', icon: 'M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' }
  ];

  return (
    <>
      <div className={`w-64 bg-[#001f3f] text-white p-6 flex flex-col fixed inset-y-0 left-0 z-[200] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[4px_0_24px_rgba(0,0,0,0.3)] border-r border-white/5 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Brand Header */}
        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6 pt-16 md:pt-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#d4a017] to-[#fcd34d] rounded-xl flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-wider text-white italic">DMS PORTAL</h1>
              <p className="text-[10px] font-bold text-[#d4a017] tracking-[0.2em] uppercase">Student Desk</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-sidebar-scroll">
          {menuItems.map((item) => (
            <button 
              key={item.key} 
              onClick={() => { setActivePage(item.key); toggleSidebar(); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-[11px] tracking-wider uppercase transition-all duration-300 group
                ${activePage === item.key 
                  ? 'bg-gradient-to-r from-[#d4a017] to-[#b8860b] text-[#001f3f] shadow-lg shadow-[#d4a017]/20 scale-[1.02]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white hover:pl-6'
                }`}
            >
              <svg className={`w-4 h-4 shrink-0 transition-colors ${activePage === item.key ? 'text-[#001f3f]' : 'text-slate-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="pt-6 mt-6 border-t border-white/10">
          <button 
            onClick={() => {
              toggleSidebar();
              onLogoutTrigger();
            }}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-bold text-[11px] tracking-wider uppercase transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>LOGOUT</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default StudentSidebar;