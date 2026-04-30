import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ManageAttendance = () => {
  const [view, setView] = useState('menu'); // 'menu', 'mark', 'leaves'

  // Mock Data for Table
  const students = [
    { id: 1, name: 'Student 1', rollNo: '123456', status: 'Pending' },
    { id: 2, name: 'Student 2', rollNo: '654321', status: 'Pending' },
  ];

  if (view === 'mark') {
    return (
      <div className="bg-white p-6 rounded-[35px] shadow-xl border-b-[6px] border-[#001f3f]">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setView('menu')} className="text-[#001f3f] font-black text-xs uppercase underline italic">← Back</button>
          <h2 className="text-xl font-black text-[#001f3f] uppercase italic">Mark Attendance</h2>
          <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full uppercase">23 April 2026</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#001f3f] text-white">
              <th className="p-4 rounded-tl-2xl text-[10px] uppercase">Roll No</th>
              <th className="p-4 text-[10px] uppercase">Student Name</th>
              <th className="p-4 text-[10px] uppercase">Status</th>
              <th className="p-4 rounded-tr-2xl text-[10px] uppercase text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-sm text-slate-600">{s.rollNo}</td>
                <td className="p-4 font-black text-[#001f3f] uppercase text-sm">{s.name}</td>
                <td className="p-4">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">{s.status}</span>
                </td>
                <td className="p-4 flex gap-2 justify-center">
                  <button className="bg-green-500 text-white px-4 py-1.5 rounded-lg font-black text-[9px] uppercase shadow-md hover:bg-green-600">Present</button>
                  <button className="bg-red-500 text-white px-4 py-1.5 rounded-lg font-black text-[9px] uppercase shadow-md hover:bg-red-600">Absent</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-8 text-center">
           <button className="bg-[#001f3f] text-white px-12 py-3 rounded-2xl font-black uppercase italic text-xs shadow-xl active:scale-95 transition-all">Submit Attendance</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setView('mark')}
        className="w-full max-w-md bg-white border-b-[8px] border-[#001f3f] p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-4 group"
      >
        <span className="text-4xl group-hover:animate-bounce">📝</span>
        <span className="font-black text-[#001f3f] uppercase italic tracking-tighter text-xl">Mark Attendance</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setView('leaves')}
        className="w-full max-w-md bg-white border-b-[8px] border-[#d4a017] p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-4 group"
      >
        <span className="text-4xl group-hover:animate-bounce">✉️</span>
        <span className="font-black text-[#001f3f] uppercase italic tracking-tighter text-xl">Check Leave Applications</span>
      </motion.button>
    </div>
  );
};

export default ManageAttendance;