import React from 'react';
import { motion } from 'framer-motion';
import { FiBell } from 'react-icons/fi';

const StudentHeader = ({ activePage, userName }) => {
  const displayTitle = activePage ? activePage.replace('-', ' ') : 'Dashboard';

  return (
    <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-[100] shadow-sm">
      
      {/* 1. LEFT SIDE: PAGE TITLE (Aligned with Sidebar Logo line) */}
      <div className="flex items-center gap-4 ml-12 lg:ml-0">
        <div className="h-10 w-[1px] bg-slate-200 hidden lg:block mr-2"></div>
        <motion.h2 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[#001f3f] font-black uppercase italic tracking-tighter text-lg lg:text-2xl flex items-center gap-2"
        >
          {displayTitle}
          <span className="w-2.5 h-2.5 bg-[#d4a017] rounded-full shadow-[0_0_10px_#d4a017]"></span>
        </motion.h2>
      </div>

      {/* 2. RIGHT SIDE: PERFECTLY BALANCED ITEMS */}
      <div className="flex items-center gap-4 lg:gap-6">
        
        {/* --- BALANCED NEXI AI BUTTON --- */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 px-4 py-2.5 bg-[#f8fbff] border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-all group h-14"
        >
           {/* NEXI Logo with balanced scale */}
           <img 
             src="/nexi.png" 
             alt="Nexi" 
             className="w-9 h-9 object-contain" 
           />
           <div className="text-left leading-tight hidden sm:block">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-tighter leading-none">AI Assistant</p>
              <p className="text-[13px] font-black text-[#001f3f] uppercase tracking-wider leading-tight">NEXI AI</p>
           </div>
        </motion.div>

        {/* --- NOTIFICATION ICON (Balanced height) --- */}
        <div className="relative w-14 h-14 bg-slate-50 text-[#001f3f] rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center">
          <FiBell size={24} strokeWidth={2.5} />
          <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        </div>

        {/* --- PROFILE SECTION --- */}
        <div className="flex items-center gap-4 pl-4 border-l border-slate-100 h-14">
           <div className="text-right hidden md:block">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Welcome Back</p>
              <p className="text-sm font-black text-[#001f3f] uppercase tracking-tighter">{userName || 'ZAMI'}</p>
           </div>
           <div className="w-14 h-14 bg-[#001f3f] text-[#d4a017] rounded-xl flex items-center justify-center font-black text-xl shadow-sm border-2 border-white">
              {userName ? userName.charAt(0).toUpperCase() : 'Z'}
           </div>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;