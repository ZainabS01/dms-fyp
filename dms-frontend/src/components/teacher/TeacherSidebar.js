import React, { useState } from 'react';

const TeacherSidebar = ({ activeTab, setActiveTab, sidebarOpen, toggleSidebar, teacherName, teacherProfilePic, isHOD }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'students', label: 'STUDENTS', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'verification', label: 'STUDENT VERIFY', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'academic_data', label: 'ACADEMIC DATA', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'upload_results', label: 'UPLOAD RESULTS', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z' },
    { id: 'attendance', label: 'ATTENDANCE', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'queries', label: 'QUERIES', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'tasks', label: 'TASKS', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'timetable', label: 'TIMETABLE', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <>
      <aside className={`fixed top-0 bottom-0 left-0 z-[200] w-64 bg-[#001f3f] text-white p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-white/5 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* Brand Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-5 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab('profile')}>
          <div className="flex items-center gap-3">
            {teacherProfilePic ? (
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden shrink-0 border-2 border-[#d4a017]">
                <img src={`${process.env.REACT_APP_API_URL}${teacherProfilePic}`} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/20 shrink-0 border-2 border-[#d4a017] text-[#001f3f] font-black text-xl">
                {teacherName ? teacherName.charAt(0).toUpperCase() : 'T'}
              </div>
            )}
            <div>
              <h1 className="font-black text-sm tracking-wider text-white uppercase line-clamp-1" title={teacherName || 'FACULTY'}>{teacherName || 'FACULTY'}</h1>
              <p className="text-[10px] font-bold text-[#d4a017] tracking-[0.2em] uppercase">{isHOD ? 'HOD Desk' : 'Teacher Desk'}</p>
            </div>
          </div>
        </div>

        {/* Nav Links and Logout */}
        <div className="flex-1 overflow-hidden pr-2 flex flex-col pb-4">
          <nav className="space-y-[6px] flex-1 overflow-hidden pr-1">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`w-full flex items-center gap-4 px-4 py-[11px] rounded-lg font-bold text-[11px] tracking-wider uppercase transition-all duration-300 group
                  ${activeTab === item.id 
                    ? 'bg-gradient-to-r from-[#d4a017] to-[#b8860b] text-[#001f3f] shadow-lg shadow-[#d4a017]/20 scale-[1.02]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                  }`}
              >
                <svg className={`w-4 h-4 shrink-0 transition-colors ${activeTab === item.id ? 'text-[#001f3f]' : 'text-slate-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="pt-5 mt-3 border-t border-white/10 shrink-0">
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="w-full flex items-center gap-4 px-4 py-[11px] rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-bold text-[11px] tracking-wider uppercase transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modern Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Logout Confirm</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Are you sure you want to end your current session?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors">No, Stay</button>
              <button onClick={handleLogout} className="flex-1 py-3.5 bg-[#001f3f] hover:bg-blue-900 text-white font-bold rounded-lg transition-colors shadow-lg">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherSidebar;