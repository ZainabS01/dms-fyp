import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/students');
        setStudents(res.data);
      } catch (err) { console.error(err); }
    };
    fetchStudents();
  }, []);

  return (
    <div className="w-full animate-fadeIn">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] uppercase italic">
            Student <span className="text-[#d4a017]">Management</span>
          </h1>
          <div className="h-1.5 w-20 bg-[#d4a017] rounded-full mt-2"></div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search by Roll No..." 
            className="pl-6 pr-12 py-4 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-[#d4a017] w-80 text-sm"
          />
        </div>
      </div>

      {/* Table Container - Isay full width (w-full) hona chahiye */}
      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-[#001f3f] text-white uppercase text-[11px] tracking-[0.2em]">
            <tr>
              <th className="px-8 py-6">Roll No</th>
              <th className="px-8 py-6">Full Name</th>
              <th className="px-8 py-6">Department</th>
              <th className="px-8 py-6">Semester</th>
              <th className="px-8 py-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 font-black text-[#001f3f]">{student.rollNo || '888888'}</td>
                <td className="px-8 py-6 font-bold text-slate-600">{student.name}</td>
                <td className="px-8 py-6 text-xs font-black text-blue-500 uppercase">{student.department}</td>
                <td className="px-8 py-6 font-black text-[#d4a017]">{student.semester}</td>
                <td className="px-8 py-6 flex justify-center gap-3">
                  <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all">Edit</button>
                  <button className="bg-red-100 text-red-500 px-4 py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentManagement;