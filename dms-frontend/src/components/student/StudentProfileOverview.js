import React, { useState, useEffect } from 'react';

const ProfileOverview = () => {
  const [student, setStudent] = useState({
    name: "Student",
    rollNo: "BCS-S24-045",
    semester: "1st Sem",
    dept: "Computer Science"
  });

  useEffect(() => {
    // 1. Data uthayen
    const rawData = localStorage.getItem('user');
    console.log("LocalStorage Data:", rawData); // Check karein console mein kya aa raha hai

    if (rawData) {
      const storedUser = JSON.parse(rawData);
      
      // 2. Yahan hum strict checking kar rahay hain
      // Agar value "N/A" hai ya undefined hai, toh direct hamari value show ho
      const finalSem = (!storedUser.semester || storedUser.semester === "N/A" || storedUser.semester === "") 
                       ? "1st Sem" 
                       : storedUser.semester;

      const finalRoll = (!storedUser.rollNo || storedUser.rollNo === "N/A" || storedUser.rollNo === "") 
                        ? "BCS-S24-045" 
                        : storedUser.rollNo;

      setStudent({
        name: storedUser.name || "Zami",
        dept: storedUser.department || "Computer Science",
        semester: storedUser.semester || "1st Sem",
        rollNo: storedUser.rollNo || "BCS-S24-045",
      });
    }
  }, []);

  return (
    <div className="profile-main-card bg-white p-8 rounded-[40px] shadow-xl border-t-8 border-[#001f3f] w-full max-w-[350px] text-center">
      <div className="w-32 h-32 bg-[#001f3f] text-white rounded-full flex items-center justify-center text-5xl font-black mx-auto mb-4 border-4 border-white shadow-lg">
        {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
      </div>
      
      <h3 className="text-2xl font-black text-[#001f3f] mb-1">{student.name}</h3>
      <div className="h-0.5 w-12 bg-slate-200 mx-auto mb-6"></div>
      
      <div className="space-y-4 text-left px-4">
         <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</span>
            <span className="text-[13px] font-black text-[#001f3f]">{student.semester}</span>
         </div>
         <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No</span>
            <span className="text-[13px] font-black text-[#001f3f]">{student.rollNo}</span>
         </div>
         <div className="flex justify-between items-center py-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</span>
            <span className="text-[12px] font-black text-[#001f3f] uppercase">{student.dept}</span>
         </div>
      </div>
      
      <button className="w-full mt-10 bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileOverview;