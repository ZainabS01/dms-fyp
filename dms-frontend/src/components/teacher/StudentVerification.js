import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiUser } from 'react-icons/fi';

const StudentVerification = () => {
  const [pendingStudents, setPendingStudents] = useState([]);

  // To fetch data (Only those students whose status is 'pending')
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/students?status=pending`);
        setPendingStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/students/${id}/${action}`);
      if (res.data.success) {
        alert(`Student ${action === 'approve' ? 'Verified' : 'Rejected'} Successfully!`);
        setPendingStudents(pendingStudents.filter(s => s._id !== id));
      } else {
        alert(res.data.message || 'Action failed!');
      }
    } catch (err) {
      console.error("Error processing student action:", err);
      alert('Error connecting to server.');
    }
  };

  return (
    <div className="w-full p-4 sm:p-0">


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingStudents.length > 0 ? (
          pendingStudents.map((student) => (
            <div key={student._id} className="bg-white p-8 rounded-lg shadow-xl border border-slate-50 relative overflow-hidden group">
              {/* Decorative Circle */}
              <div className="absolute -right-5 -top-5 w-20 h-20 bg-slate-50 rounded-full group-hover:bg-[#d4a017]/10 transition-all"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center text-[#001f3f] text-2xl">
                  <FiUser />
                </div>
                <div>
                  <h3 className="font-black text-[#001f3f] text-lg uppercase tracking-tight">{student.name}</h3>
                  <p className="text-[10px] font-bold text-blue-500 uppercase">Roll No: {student.rollNo || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase">Department:</span>
                  <span className="text-[#001f3f]">{student.department}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase">Semester:</span>
                  <span className="text-[#d4a017]">{student.semester}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(student._id, 'approve')}
                  className="flex-1 bg-[#001f3f] text-white py-4 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-blue-900/20"
                >
                  <FiCheckCircle className="text-sm" /> Verify
                </button>
                <button 
                  onClick={() => handleAction(student._id, 'reject')}
                  className="px-5 bg-red-50 text-red-500 rounded-lg font-black text-sm hover:bg-red-500 hover:text-white transition-all"
                >
                  <FiXCircle />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-lg border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest">No pending verifications found ✨</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentVerification;