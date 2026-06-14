import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiUserCheck } from 'react-icons/fi';

const TeacherVerification = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/faculty?status=pending`);
        setPendingTeachers(res.data);
      } catch (err) {
        toast.error("Error fetching teachers");
      }
    };
    fetchPending();
  }, []);

  const handleVerify = async (id, status) => {
    const toastId = toast.loading(`${status === 'approve' ? 'Approving' : 'Rejecting'} teacher...`);
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/faculty/${id}/${status}`);
      if (res.data.success) {
        toast.success(`Teacher ${status === 'approve' ? 'Verified' : 'Rejected'}! Email sent.`, { id: toastId });
        setPendingTeachers(pendingTeachers.filter(t => t._id !== id));
      } else {
        toast.error(res.data.message || 'Action failed!', { id: toastId });
      }
    } catch (err) {
      toast.error('Error connecting to server.', { id: toastId });
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-[#001f3f] ">
          Teacher <span className="text-[#d4a017]">Verification</span>
        </h1>
        <div className="h-1.5 w-20 bg-[#d4a017] rounded-full mt-2"></div>
        <p className="text-slate-400 text-xs font-bold mt-4 uppercase tracking-widest">
          Approve or Reject new faculty registrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingTeachers.length > 0 ? (
          pendingTeachers.map((teacher) => (
            <div key={teacher._id} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[40px] shadow-xl border border-slate-50 relative overflow-hidden group">
              {/* Decorative Circle */}
              <div className="absolute -right-5 -top-5 w-20 h-20 bg-slate-50 rounded-full group-hover:bg-[#d4a017]/10 transition-all"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#001f3f] text-2xl">
                  <FiUserCheck />
                </div>
                <div>
                  <h3 className="font-black text-[#001f3f] text-lg uppercase tracking-tight">{teacher.name}</h3>
                  <p className="text-[10px] font-bold text-blue-500 uppercase">{teacher.department}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => handleVerify(teacher._id, 'approve')}
                  className="flex-1 bg-[#001f3f] text-white py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-blue-900/20"
                >
                  <FiCheckCircle className="text-sm" /> Approve
                </button>
                <button 
                  onClick={() => handleVerify(teacher._id, 'reject')}
                  className="px-5 bg-red-50 text-red-500 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all"
                >
                  <FiXCircle />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest italic">No pending verifications found ✨</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherVerification;