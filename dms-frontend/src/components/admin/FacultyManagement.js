import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    const fetchFaculty = async () => {
      const res = await axios.get('http://localhost:5000/api/admin/faculty');
      setFaculty(res.data);
    };
    fetchFaculty();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar activeTab="Faculty" />
      <main className="flex-1 ml-72 p-10">
        <h1 className="text-3xl font-black text-[#001f3f] uppercase italic mb-8">Faculty Directory</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faculty.map((teacher) => (
            <div key={teacher._id} className="bg-white p-6 rounded-[25px] shadow-md flex items-center gap-6 border-l-8 border-[#d4a017]">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl">👨‍🏫</div>
              <div>
                <h3 className="text-lg font-black text-[#001f3f]">{teacher.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{teacher.department} | ID: {teacher.teacherId}</p>
                <div className="mt-3 flex gap-2">
                  <button className="text-[9px] font-black uppercase text-blue-600 border border-blue-600 px-3 py-1 rounded-md">Message</button>
                  <button className="text-[9px] font-black uppercase text-red-600 border border-red-600 px-3 py-1 rounded-md">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FacultyManagement;