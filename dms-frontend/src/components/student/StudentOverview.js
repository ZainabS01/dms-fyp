import React, { useState, useEffect } from 'react';

const Overview = ({ user, onUpdate, setActiveTab }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");

  // Debugging & Sync
  useEffect(() => {
    if (user?.name || user?.user?.name) {
      setNewName(user?.name || user?.user?.name);
    }
  }, [user]);

  // --- DATA MAPPING ---
  const userData = {
    name: user?.name || user?.user?.name || "Student",
    rollNo: user?.rollNo || user?.user?.rollNo || user?.rollno || user?.user?.rollno || "N/A",
    semester: user?.semester || user?.user?.semester || "N/A",
    department: user?.department || user?.user?.department || user?.dept || "N/A"
  };

  const initial = userData.name.charAt(0).toUpperCase() || 'S';

  // Navigation items corresponding to the StudentSidebar.js keys and layout
  const navigationItems = [
    { name: 'Attendance', tabKey: 'attendance', color: 'border-yellow-500 hover:bg-yellow-500 text-[#002147]' },
    { name: 'Tasks & Projects', tabKey: 'task', color: 'border-[#002147] hover:bg-[#002147] text-[#002147]' },
    { name: 'Academic Result', tabKey: 'result', color: 'border-yellow-500 hover:bg-yellow-500 text-[#002147]' },
    { name: 'Timetable', tabKey: 'timetable', color: 'border-[#002147] hover:bg-[#002147] text-[#002147]' },
    { name: 'Query Hub', tabKey: 'queries', color: 'border-yellow-500 hover:bg-yellow-500 text-[#002147]' },
    { name: 'Course Data', tabKey: 'data', color: 'border-[#002147] hover:bg-[#002147] text-[#002147]' }
  ];

  // Tab switcher function that changes the parent dashboard view
  const handleBoxClick = (e, tabKey) => {
    e.preventDefault();
    e.stopPropagation();

    if (setActiveTab) {
      setActiveTab(tabKey); // Updates the parent activeTab state
    } else {
      console.error("setActiveTab prop not found! Check StudentDashboard.js.");
    }
  };

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* --- LEFT PROFILE SUMMARY CARD --- */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-t-8 border-[#002147] text-center flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="w-24 h-24 bg-[#002147] text-white text-3xl font-black flex items-center justify-center rounded-full mx-auto mb-4 shadow-xl ring-4 ring-blue-50">
              {initial}
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-6">{userData.name}</h3>
            
            <div className="space-y-4 text-left border-t pt-5">
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
                <span className="text-[12px] font-bold text-slate-800 uppercase text-right max-w-[150px] truncate">{userData.department}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-6 bg-[#002147] text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition shadow-md active:scale-95 outline-none"
          >
            Edit Profile
          </button>
        </div>
        
        {/* --- RIGHT SIDE SPECIFIC NAVIGATION SMALL BOXES --- */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-center">
          {navigationItems.map(item => (
            <button
              key={item.tabKey}
              type="button"
              onClick={(e) => handleBoxClick(e, item.tabKey)}
              className={`p-6 bg-slate-50 border-l-[6px] ${item.color} rounded-[1.8rem] text-[12px] font-black uppercase transition-all text-center flex items-center justify-center min-h-[120px] shadow-sm hover:shadow-lg hover:text-white hover:scale-[1.03] transform duration-200 cursor-pointer outline-none`}
            >
              {item.name}
            </button>
          ))}
        </div>

      </div>

      {/* Pop-up Name Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#002147]/40 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-black text-[#002147] mb-6">Edit Display Name</h3>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-4 bg-slate-50 border rounded-2xl mb-6 outline-none font-bold text-slate-700 focus:border-[#002147]"
            />
            <div className="flex gap-3">
              <button onClick={() => { if(onUpdate && newName.trim()) onUpdate({...user, name: newName}); setIsModalOpen(false); }} className="flex-1 py-4 bg-[#002147] text-white rounded-2xl font-black shadow-md hover:bg-blue-800 active:scale-95 transition-all">Save</button>
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black hover:bg-slate-200 active:scale-95 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;