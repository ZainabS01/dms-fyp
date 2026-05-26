import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiCalendar, FiEdit3, FiAward, 
  FiMessageSquare, FiBook, FiLogOut, FiMenu, FiX 
} from 'react-icons/fi';

const StudentSidebar = ({ setActivePage, activePage, onLogoutTrigger }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { key: 'overview', label: 'My Profile', icon: <FiUser /> },
    { key: 'attendance', label: 'Attendance', icon: <FiCalendar /> },
    { key: 'task', label: 'Tasks & Projects', icon: <FiEdit3 /> },
    { key: 'result', label: 'Academic Result', icon: <FiAward /> }, 
    { key: 'queries', label: 'Query Hub', icon: <FiMessageSquare /> }, 
    { key: 'data', label: 'Course Data', icon: <FiBook /> },
  ];

  return (
    <>
      <div className="lg:hidden fixed top-6 left-6 z-[200]">
        <button onClick={() => setIsOpen(!isOpen)} className="p-3 bg-[#001f3f] text-white rounded-2xl shadow-lg border border-white/10">
          {isOpen ? <FiX size={22}/> : <FiMenu size={22}/>}
        </button>
      </div>

      <div className={`w-72 bg-[#001f3f] text-white flex flex-col fixed inset-y-0 left-0 z-[150] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* --- HEADER-MATCHED LOGO SECTION --- */}
        <div className="flex flex-col items-center bg-[#001831] border-b border-white/5 flex-shrink-0">
          {/* Logo container height matches header (h-24) */}
          <div className="h-24 w-full flex items-center justify-center">
             <div className="w-16 h-16 bg-white rounded-full p-1 shadow-2xl flex items-center justify-center border-[3px] border-[#d4a017]">
                <img src="/logo.png" alt="DMS Logo" className="w-full h-full object-contain rounded-full" />
             </div>
          </div>
          <div className="pb-5 text-center">
             <h1 className="font-black italic uppercase tracking-wider text-lg text-white">DMS Portal</h1>
             <p className="text-[9px] font-black tracking-[0.4em] uppercase text-[#d4a017] mt-1">Student Role</p>
          </div>
        </div>

        {/* --- SCROLLABLE MENU --- */}
        <nav className="flex-1 mt-4 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button 
              key={item.key} 
              onClick={() => { setActivePage(item.key); setIsOpen(false); }}
              className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 relative ${
                activePage === item.key ? 'bg-[#d4a017] text-[#001f3f] font-black shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span className="mr-4 text-xl">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout at Bottom */}
        <div className="p-6 mt-auto">
          <button onClick={onLogoutTrigger} className="w-full flex items-center justify-center gap-3 bg-red-500/10 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-600 hover:text-white transition-all border border-red-500/10">
            <span>Logout Portal</span> <FiLogOut strokeWidth={3} />
          </button>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 160, 23, 0.1); border-radius: 10px; }
        `}</style>
      </div>
    </>
  );
};

export default StudentSidebar;