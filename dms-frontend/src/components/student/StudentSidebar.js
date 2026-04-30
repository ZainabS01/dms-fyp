import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ setActivePage, activePage, onLogoutTrigger }) => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle state

  const menuItems = [
    { key: 'overview', label: 'My Profile', icon: '👤' },
    { key: 'attendance', label: 'Attendance', icon: '📅' },
    { key: 'task', label: 'Tasks & Projects', icon: '📝' },
    { key: 'result', label: 'Academic Result', icon: '🏆' },
    { key: 'query', label: 'Raise a Query', icon: '❓' },
    { key: 'data', label: 'Course Data', icon: '📂' },
  ];

  return (
    <>
      {/* --- MOBILE TOGGLE BUTTON --- */}
      <div className="lg:hidden fixed top-6 left-6 z-[200]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-[#002147] text-white rounded-2xl shadow-lg border border-white/10"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* --- SIDEBAR OVERLAY (Mobile) --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- MAIN SIDEBAR --- */}
      <div className={`
        w-72 bg-[#002147] text-white flex flex-col fixed inset-y-0 left-0 shadow-2xl z-[150] overflow-hidden transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* 1. LOGO SECTION */}
        <div className="p-10 text-center border-b border-white/5 flex-shrink-0">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-16 h-16 bg-white rounded-[1.25rem] mx-auto mb-4 flex items-center justify-center shadow-xl"
          >
            <span className="text-[#002147] font-black text-2xl italic">UOG</span>
          </motion.div>
          <p className="text-[10px] font-black tracking-[0.4em] uppercase text-yellow-500 opacity-90">Student Portal</p>
        </div>

        {/* 2. NAVIGATION MENU */}
        <nav className="flex-1 mt-6 px-5 space-y-3 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActivePage(item.key);
                setIsOpen(false); // Mobile par click ke baad close ho jaye
              }}
              className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group relative ${
                activePage === item.key 
                ? 'bg-[#EAB308] text-[#002147] font-black shadow-lg shadow-yellow-500/20 scale-105' 
                : 'hover:bg-white/5 text-blue-100 hover:pl-7'
              }`}
            >
              {activePage === item.key && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-1.5 h-8 bg-[#002147] rounded-r-full"
                />
              )}
              <span className="mr-4 text-xl group-hover:scale-125 transition-transform">
                {item.icon}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* 3. LOGOUT SECTION */}
        <div className="p-6 bg-[#00142d] border-t border-white/5 mt-auto flex-shrink-0">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogoutTrigger} 
            className="w-full group flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 text-white shadow-2xl shadow-red-900/40"
          >
            <span>Logout Portal</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">🚪</span>
          </motion.button>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;