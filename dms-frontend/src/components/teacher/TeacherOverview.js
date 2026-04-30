import React from 'react';
import { motion } from 'framer-motion';

const TeacherOverview = () => {
  const stats = [
    { title: 'Attendance', icon: '📅', color: 'bg-blue-50' },
    { title: 'Tasks', icon: '📝', color: 'bg-orange-50' },
    { title: 'Queries', icon: '💬', color: 'bg-green-50' },
    { title: 'Timetable', icon: '⏰', color: 'bg-purple-50' },
    { title: 'Results', icon: '📊', color: 'bg-red-50' },
    { title: 'Check Leaves', icon: '✉️', color: 'bg-teal-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[35px] shadow-xl border-b-[6px] border-[#001f3f] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-all"
        >
          <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner`}>
            {item.icon}
          </div>
          <h3 className="text-[#001f3f] font-black uppercase tracking-tighter text-lg">{item.title}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Manage {item.title} Details</p>
        </motion.div>
      ))}
    </div>
  );
};

export default TeacherOverview;