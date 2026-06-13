import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/faculty');
      setFaculty(res.data);
    } catch (err) { console.error(err); }
  };

  const handleToggleHOD = async (id, currentStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/faculty/${id}/toggle-hod`);
      if (res.data.success) {
        setFaculty(faculty.map(f => f._id === id ? { ...f, isHOD: res.data.isHOD } : f));
      }
    } catch (err) {
      console.error('Error toggling HOD status', err);
    }
  };

  const handleDeleteTeacher = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/faculty/${id}`);
      if (res.data.success) {
        setFaculty(faculty.filter(f => f._id !== id));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error('Error deleting teacher', err);
    }
  };

  return (
    <div className="w-full animate-fadeIn pb-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#001f3f] uppercase italic">
            Faculty <span className="text-[#d4a017]">Directory</span>
          </h1>
          <div className="h-1.5 w-20 bg-[#d4a017] rounded-full mt-2"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {faculty.map((f) => (
          <div 
            key={f._id} 
            className="relative bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(212,160,23,0.12)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center group overflow-hidden"
          >
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4a017] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Glowing background blob */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 ${f.isHOD ? 'bg-amber-100' : 'bg-blue-50'} rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500`}></div>

            {/* HOD Badge */}
            {f.isHOD && (
              <div className="absolute top-6 right-6 bg-gradient-to-r from-[#d4a017] to-[#fcd34d] text-[#001f3f] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1 z-10">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                HOD
              </div>
            )}

            {/* Avatar */}
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-white shadow-md relative z-10 group-hover:scale-105 transition-transform duration-300">
              👨‍🏫
            </div>

            {/* Teacher Details */}
            <h3 className="text-2xl font-black text-[#001f3f] tracking-tight mb-1 relative z-10 group-hover:text-[#d4a017] transition-colors">{f.name}</h3>
            
            <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 relative z-10">{f.department}</p>
            
            <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6 relative z-10 text-left space-y-3 border border-slate-100/50">
              <div className="flex items-center gap-3 text-xs text-slate-600 font-bold w-full overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="truncate flex-1 min-w-0">{f.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-bold w-full overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <span className="truncate flex-1 min-w-0">{f.phone || 'N/A'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex gap-2 relative z-10 mt-auto">
              <button 
                onClick={() => handleToggleHOD(f._id, f.isHOD)}
                className={`flex-1 text-[10px] font-black uppercase px-2 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1
                  ${f.isHOD 
                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200/50' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/50'}`}
              >
                {f.isHOD ? 'Revoke HOD' : 'Make HOD'}
              </button>
              <button 
                onClick={() => setDeleteTarget(f._id)}
                className="w-10 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-100 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-4 sm:p-8 max-w-sm mx-4 w-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-xl font-black text-center text-[#001f3f] mb-2">Delete Teacher?</h3>
            <p className="text-slate-500 text-sm text-center mb-8 font-medium">This action cannot be undone. Are you sure you want to completely remove this teacher from the system?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteTarget(null)} 
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteTeacher(deleteTarget)} 
                className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-red-500/30">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;