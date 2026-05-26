import React from 'react';

const TeacherSidebar = ({ activeTab, setActiveTab, sidebarOpen, toggleSidebar }) => {
  
  // Navigation links array - Added RESULTS explicitly
  const navItems = [
  { id: 'dashboard', label: 'DASHBOARD', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'students', label: 'STUDENTS', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'verification', label: 'STUDENT VERIFY', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  
  // 1. Purani file ka option (Academic Data View)
  { id: 'academic_data', label: 'ACADEMIC DATA', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  
  // 2. Nayi Upload karne wali file ka option (Results Upload)
  { id: 'upload_results', label: 'UPLOAD RESULTS', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z' },
  
  { id: 'attendance', label: 'ATTENDANCE', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'queries', label: 'QUERIES', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { id: 'tasks', label: 'TASKS', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 'timetable', label: 'TIMETABLE', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'profile', label: 'PROFILE', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
];

  return (
    <aside 
      className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#001f3f] text-white p-6 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out border-r border-white/5
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      {/* Brand Header with Logo Image */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#d4a017] rounded-xl flex items-center justify-center shadow-lg shadow-[#d4a017]/20 overflow-hidden">
            <img 
              src="/logo.png" 
              alt="DMS Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-wider uppercase italic">DMS PORTAL</h1>
            <p className="text-[10px] font-bold text-[#d4a017] tracking-widest uppercase">TEACHER</p>
          </div>
        </div>
        
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors md:hidden focus:outline-none"
          aria-label="Close Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Links Area */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 select-none custom-sidebar-scroll">
        {navItems.map((item) => {
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 group relative
                ${isSelected 
                  ? 'bg-[#d4a017] text-[#001f3f] shadow-lg shadow-[#d4a017]/10 scale-[1.02]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <svg 
                className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 
                  ${isSelected ? 'text-[#001f3f]' : 'text-slate-400 group-hover:text-white'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4 mt-4">
        <button 
          onClick={() => alert('Logging out...')}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-bold text-xs tracking-wider uppercase border border-white/5 hover:border-red-500/20 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>LOGOUT</span>
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;