import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiMenu, FiArrowLeft } from 'react-icons/fi';
import { Trash2 } from 'lucide-react';
import axios from 'axios';

const TeacherHeader = ({ activeTab, teacherName, teacherProfilePic, isHOD, onOpenNexi, setActiveTab, toggleSidebar }) => {
  const displayTitle = activeTab ? activeTab.replace('_', ' ') : 'Dashboard';
  const [notices, setNotices] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const getNoticeStyle = (type) => {
    switch(type) {
      case 'Attendance': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '📅' };
      case 'Result': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📊' };
      case 'Query': return { bg: 'bg-purple-100', text: 'text-purple-700', icon: '❓' };
      case 'Course': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '📚' };
      default: return { bg: 'bg-[#001f3f]', text: 'text-[#d4a017]', icon: '🔔' }; 
    }
  };

  const handleNoticeClick = (notice) => {
    if (notice.link && setActiveTab) {
      setActiveTab(notice.link);
    }
    setShowNotifications(false);
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/notices/${id}`);
      setNotices(notices.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notice:', error);
    }
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/notices?role=teacher`);
        setNotices(response.data);
      } catch (error) {
        console.error('Error fetching notices:', error);
      }
    };
    fetchNotices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 sm:h-20 lg:h-24 bg-white border-b border-slate-100 flex items-center justify-between px-2 sm:px-6 lg:px-10 sticky top-0 z-[100] shadow-sm">
      
      {/* 1. LEFT SIDE: TITLE */}
      <div className="flex items-center gap-1.5 sm:gap-4 ml-1 md:ml-0 flex-shrink-0">
        {/* Hamburger Menu for Mobile */}
        <button 
          onClick={toggleSidebar} 
          className="md:hidden p-1.5 text-[#001f3f] bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0 shadow-sm border border-slate-100"
        >
          <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Back Button for all screens when not on overview */}
        {activeTab && activeTab.toLowerCase() !== 'overview' && activeTab.toLowerCase() !== 'dashboard' && (
          <button 
            onClick={() => setActiveTab && setActiveTab('dashboard')} 
            className="p-1.5 text-[#001f3f] bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0 shadow-sm border border-slate-100 ml-1"
            title="Go Back"
          >
            <FiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        <div className="h-8 sm:h-10 w-[1px] bg-slate-200 hidden md:block mx-1 sm:mx-2"></div>
        <motion.h2 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[#001f3f] font-black uppercase tracking-tight text-sm sm:text-xl lg:text-3xl flex items-center gap-1.5 sm:gap-3 flex-shrink-0 drop-shadow-sm"
        >
          {displayTitle}
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#d4a017] rounded-full shadow-[0_0_10px_rgba(212,160,23,0.6)] flex-shrink-0"></span>
        </motion.h2>
      </div>

      {/* 2. RIGHT SIDE: NEXI AI, BELL, PROFILE */}
      <div className="flex items-center gap-1.5 sm:gap-4 lg:gap-6 flex-shrink-0">
        
        {/* NEXI AI BUTTON */}
        {activeTab !== 'nexi' && (
          <motion.div 
            onClick={onOpenNexi}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-1 sm:gap-3 px-1.5 sm:px-4 py-1.5 md:py-2.5 bg-[#f8fbff] border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-50 transition-all h-8 sm:h-12 md:h-14 flex-shrink-0"
          >
             <img src="/nexi.png" alt="Nexi" className="w-5 h-5 sm:w-8 sm:h-8 object-contain flex-shrink-0" />
             <div className="text-left leading-tight hidden sm:block">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-tighter leading-none">AI Assistant</p>
                <p className="text-[11px] md:text-[13px] font-black text-[#001f3f] uppercase tracking-wider leading-tight">NEXI AI</p>
             </div>
          </motion.div>
        )}

        {/* NOTIFICATION ICON & DROPDOWN */}
        <div className="relative" ref={notifRef}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white text-[#001f3f] rounded-lg cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all border border-slate-200 shadow-sm flex items-center justify-center relative flex-shrink-0"
          >
            <FiBell className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
            {notices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border border-white shadow-sm"></span>
            )}
          </div>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed top-20 left-4 right-4 md:absolute md:top-16 md:right-0 md:left-auto md:w-96 bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-black text-[#001f3f] text-sm uppercase tracking-wider">Notifications</h3>
                  <div className="bg-[#001f3f] text-[#d4a017] text-[10px] font-black px-2 py-1 rounded-md">
                    {notices.length} NEW
                  </div>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                  {notices.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      <p className="text-sm font-semibold">No new notifications</p>
                    </div>
                  ) : (
                    notices.map((notice) => {
                      const style = getNoticeStyle(notice.type);
                      return (
                      <div 
                        key={notice._id} 
                        onClick={() => handleNoticeClick(notice)}
                        className={`p-4 mb-2 mx-2 rounded-lg cursor-pointer transition-all border border-transparent hover:shadow-md relative group ${notice.link ? 'hover:border-blue-200 hover:bg-blue-50/30' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${style.bg}`}>
                            {style.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${style.bg} ${style.text}`}>
                                {notice.type || 'Notice'}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400">
                                  {new Date(notice.createdAt).toLocaleDateString()}
                                </span>
                                <button onClick={(e) => handleDeleteNotification(e, notice._id)} className="text-slate-300 hover:text-red-500 transition-colors" title="Delete Notification">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-black text-[#001f3f] text-sm mb-1 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{notice.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notice.content}</p>
                          </div>
                        </div>
                      </div>
                    )})
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default TeacherHeader;