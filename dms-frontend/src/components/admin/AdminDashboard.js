import React from 'react';
import AdminSidebar from './AdminSidebar';
import { motion } from 'framer-motion';


const AdminDashboard = () => {
  const stats = [
    { title: 'Total Students', value: '450', color: 'border-blue-500' },
    { title: 'Total Faculty', value: '32', color: 'border-green-500' },
    { title: 'Present Today', value: '88%', color: 'border-[#d4a017]' },
    { title: 'Pending Tasks', value: '05', color: 'border-purple-500' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar activeTab="Dashboard" />
      
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#001f3f] uppercase italic">System Overview</h1>
            <div className="h-1.5 w-16 bg-[#d4a017] rounded-full mt-1"></div>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">Current User</p>
              <p className="text-sm font-bold text-[#001f3f]">Super Admin</p>
            </div>
            <div className="w-10 h-10 bg-[#d4a017] rounded-full"></div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              whileHover={{ y: -5 }}
              key={index} 
              className={`bg-white p-8 rounded-[30px] shadow-sm border-b-8 ${stat.color}`}
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
              <h2 className="text-4xl font-black text-[#001f3f] mt-2">{stat.value}</h2>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-[#001f3f] p-12 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Department Control <span className="text-[#d4a017]">Panel</span></h2>
            <p className="mt-4 text-slate-300 max-w-xl font-medium italic">Manage department operations, track student attendance, and coordinate with faculty members efficiently.</p>
            <button className="mt-8 bg-[#d4a017] text-[#001f3f] px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-105 transition-all">Generate Report</button>
          </div>
          <div className="absolute right-[-50px] bottom-[-50px] opacity-10 text-[200px] font-black italic select-none">DMS</div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;