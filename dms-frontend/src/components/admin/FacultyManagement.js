import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/faculty');
        setFaculty(res.data);
      } catch (err) { console.error(err); }
    };
    fetchFaculty();
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-[#001f3f] uppercase italic mb-10">Faculty <span className="text-[#d4a017]">Directory</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculty.map((f) => (
          <div key={f._id} className="bg-white p-8 rounded-[35px] shadow-lg border-l-[10px] border-[#d4a017] flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl">👨‍🏫</div>
            <div>
              <h3 className="text-xl font-black text-[#001f3f]">{f.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{f.department}</p>
              <div className="mt-4 flex gap-2">
                <button className="text-[10px] font-black uppercase text-blue-600 border border-blue-600 px-4 py-1.5 rounded-full">Message</button>
                <button className="text-[10px] font-black uppercase text-red-600 border border-red-600 px-4 py-1.5 rounded-full">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultyManagement;