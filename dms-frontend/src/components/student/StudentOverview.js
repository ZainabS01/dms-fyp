import React, { useState, useEffect } from 'react';

const Overview = ({ user, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");

  // Debugging ke liye Console (Inspect mein dekhne ke liye)
  useEffect(() => {
    console.log("Full User Prop:", user);
    if (user?.name || user?.user?.name) {
      setNewName(user?.name || user?.user?.name);
    }
  }, [user]);

  // --- DATA MAPPING (Har Tarah ka Check) ---
  const userData = {
    // Name check
    name: user?.name || user?.user?.name || "Student",
    
    // Roll No check (Small 'n' aur Capital 'N' dono check krien)
    rollNo: user?.rollNo || user?.user?.rollNo || user?.rollno || user?.user?.rollno || "N/A",
    
    // Semester check
    semester: user?.semester || user?.user?.semester || "N/A",
    
    // Department check
    department: user?.department || user?.user?.department || user?.dept || "N/A"
  };

  const initial = userData.name.charAt(0).toUpperCase() || 'S';

  const handleUpdateName = () => {
    if (onUpdate && newName.trim() !== "") {
      onUpdate({ ...user, name: newName }); 
    }
    setIsModalOpen(false);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* --- PROFILE CARD --- */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-t-8 border-[#002147] text-center">
          <div className="w-24 h-24 bg-[#002147] text-white text-3xl font-black flex items-center justify-center rounded-full mx-auto mb-4 shadow-xl ring-4 ring-blue-50">
            {initial}
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-6">{userData.name}</h3>
          
          <div className="space-y-3 text-left border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</span>
              <span className="text-[12px] font-bold text-slate-800">{userData.semester}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No</span>
              <span className="text-[12px] font-bold text-slate-800">{userData.rollNo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</span>
              <span className="text-[12px] font-bold text-slate-800 uppercase">{userData.department}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-6 bg-[#002147] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-md active:scale-95"
          >
            Edit Profile
          </button>
        </div>
        
        {/* --- STATS SECTION --- */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-md border-l-8 border-yellow-500 flex items-center justify-between group hover:scale-[1.02] transition-transform">
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Attendance</p>
              <h4 className="text-3xl font-black text-[#002147]">82.5%</h4>
            </div>
            <div className="text-4xl opacity-20">📈</div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-md border-l-8 border-blue-600 flex items-center justify-between group hover:scale-[1.02] transition-transform">
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">CGPA</p>
              <h4 className="text-3xl font-black text-[#002147]">3.82</h4>
            </div>
            <div className="text-4xl opacity-20">🏆</div>
          </div>

          <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm grid grid-cols-2 sm:grid-cols-3 gap-4 border border-slate-100">
            {['Vouchers', 'LMS', 'Schedule', 'News', 'Library', 'Contact'].map(item => (
              <button key={item} className="p-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase text-[#002147] hover:bg-[#002147] hover:text-white transition-all">
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pop-up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#002147]/40 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-black text-[#002147] mb-6">Edit Display Name</h3>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-4 bg-slate-50 border rounded-2xl mb-6 outline-none"
            />
            <div className="flex gap-3">
              <button onClick={handleUpdateName} className="flex-1 py-4 bg-[#002147] text-white rounded-2xl font-black">Save</button>
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;