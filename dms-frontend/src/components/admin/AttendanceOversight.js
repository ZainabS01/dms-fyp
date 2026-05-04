import React from 'react';
import AdminSidebar from './AdminSidebar';
import { FiCheckCircle, FiXCircle, FiBarChart2 } from 'react-icons/fi';

const AttendanceOversight = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar activeTab="Attendance" />
      
      <main className="flex-1 ml-72 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-[#001f3f] uppercase italic">Attendance Oversight</h1>
          <div className="h-1.5 w-16 bg-[#d4a017] rounded-full mt-1"></div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[30px] shadow-sm border-l-8 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Average Presence</p>
                <h2 className="text-3xl font-black text-[#001f3f]">94%</h2>
              </div>
              <FiCheckCircle className="text-3xl text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[30px] shadow-sm border-l-8 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Absentees</p>
                <h2 className="text-3xl font-black text-[#001f3f]">42</h2>
              </div>
              <FiXCircle className="text-3xl text-red-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[30px] shadow-sm border-l-8 border-[#d4a017]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Faculty Present</p>
                <h2 className="text-3xl font-black text-[#001f3f]">28/32</h2>
              </div>
              <FiBarChart2 className="text-3xl text-[#d4a017]" />
            </div>
          </div>
        </div>

        {/* Attendance Table / Visual */}
        <div className="bg-[#001f3f] p-8 rounded-[40px] text-white">
          <h3 className="text-xl font-black uppercase italic mb-6">Recent Attendance Trends</h3>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {/* Dummy Bar Chart */}
            {[60, 80, 45, 90, 70, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div style={{ height: `${h}%` }} className="w-full bg-[#d4a017] rounded-t-lg opacity-80 hover:opacity-100 transition-all"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceOversight;