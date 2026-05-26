import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherVerification = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);

  const handleVerify = async (id, status) => {
    // Backend logic to update status to 'approved' or 'rejected'
    alert(`Teacher ${status === 'approved' ? 'Verified' : 'Rejected'}`);
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-[#001f3f] uppercase italic mb-10">Teacher <span className="text-[#d4a017]">Verification</span></h1>
      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#001f3f] text-white uppercase text-[11px] tracking-widest">
            <tr>
              <th className="px-8 py-6">Name</th>
              <th className="px-8 py-6">Department</th>
              <th className="px-8 py-6">Document</th>
              <th className="px-8 py-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Example Row */}
            <tr className="hover:bg-slate-50">
              <td className="px-8 py-6 font-bold">Dr. Ahmed</td>
              <td className="px-8 py-6 text-blue-600 font-black">CS</td>
              <td className="px-8 py-6"><button className="text-xs underline text-slate-400">View Degree.pdf</button></td>
              <td className="px-8 py-6 flex justify-center gap-4">
                <button onClick={() => handleVerify(1, 'approved')} className="bg-green-100 text-green-600 px-6 py-2 rounded-xl font-black text-[10px] uppercase">Approve</button>
                <button onClick={() => handleVerify(1, 'rejected')} className="bg-red-100 text-red-600 px-6 py-2 rounded-xl font-black text-[10px] uppercase">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default TeacherVerification;