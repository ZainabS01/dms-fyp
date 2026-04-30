import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null); // 👈 Naya state error handle karne ke liye

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Check krien token hai ya nahi
        if (!token) {
          setError("Session expired. Please login again.");
          return;
        }

        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Debugging ke liye console check krien
        console.log("Profile Data:", res.data);

        if (res.data.success) {
          setProfile(res.data.user);
        } else {
          setError("Failed to fetch user data.");
        }
      } catch (err) {
        console.error("Fetch Error:", err.response?.data || err.message);
        setError("Backend se connection nahi ho saka.");
      }
    };
    fetchProfile();
  }, []);

  // 1. Agar koi error aaye to wo show krien bajaye infinite loading ke
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-600 font-bold">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-[#001f3f] text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // 2. Jab tak data load na ho
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#001f3f] font-black animate-pulse text-xl">
          CONNECTING TO SERVER...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-0 animate-in fade-in duration-500">
      
      {/* Profile Card (Left Side) */}
      <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-xl border-b-[8px] border-[#001f3f] text-center">
        <div className="w-32 h-32 bg-[#f1f3f6] rounded-full mx-auto mb-6 border-4 border-[#001f3f] p-1 shadow-inner relative overflow-hidden">
          {/* Logo/Avatar */}
          <img 
            src={profile.avatar || "/logo.png"} 
            alt="Profile" 
            className="w-full h-full object-contain rounded-full" 
          />
        </div>
        
        <h2 className="text-xl font-black text-[#001f3f] uppercase italic tracking-tighter">
          {profile.name}
        </h2>
        <p className="text-[10px] font-black text-[#d4a017] uppercase tracking-[0.2em] mb-6">
          {profile.role || "Faculty Member"}
        </p>
        
        <div className="space-y-2">
           <div className="bg-[#001f3f] text-white p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">
             ID: {profile._id?.substring(0, 8).toUpperCase() || "PENDING"}
           </div>
           <div className="bg-slate-100 text-[#001f3f] p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">
             Dept: {profile.department || "CS & SE"}
           </div>
        </div>
      </div>

      {/* Details & Settings (Right Side) */}
      <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-xl border-b-[8px] border-[#d4a017]">
        <h3 className="text-lg font-black text-[#001f3f] uppercase italic border-b-4 border-[#001f3f]/10 pb-2 mb-6 inline-block">
          Account Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
            <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1">{profile.name}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
            <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1">{profile.email}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
            <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1">{profile.phone || "Not Provided"}</p>
          </div>
          
          {/* <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</label>
            <p className="font-bold text-green-600 border-b border-slate-50 pb-1 uppercase">Active</p>
          </div> */}

          {/* <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester/Batch</label>
            <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1">{profile.semester || "Spring 2026"}</p>
          </div> */}
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
            <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1 uppercase">{profile.department}</p>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-4">
           <button className="bg-[#001f3f] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-[#d4a017] transition-all">
             Edit Profile
           </button>
           <button className="border-2 border-[#001f3f] text-[#001f3f] px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-slate-50 transition-all">
             Security Settings
           </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;