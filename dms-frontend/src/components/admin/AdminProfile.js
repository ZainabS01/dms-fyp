import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AdminProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "System Administrator",
    email: user?.email || "admin@dms.edu.pk"
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#001f3f] font-black animate-pulse text-xl">
          LOADING PROFILE...
        </div>
      </div>
    );
  }

  const handleSave = () => {
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill all fields!");
      return;
    }
    
    // Simulate API call for saving data
    toast.success("Profile updated successfully!", {
      style: { background: '#001f3f', color: '#fff', borderRadius: '15px' }
    });
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-0 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      
      {/* Profile Card (Left Side) */}
      <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-xl border-b-[8px] border-[#001f3f] text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-32 h-32 bg-[#f1f3f6] rounded-full mx-auto mb-6 border-4 border-[#001f3f] p-1 shadow-inner relative overflow-hidden">
          {/* Logo/Avatar */}
          <div className="w-full h-full bg-[#001f3f] rounded-full flex items-center justify-center text-[#d4a017] text-5xl font-black">
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-[#001f3f] uppercase tracking-tighter">
          {formData.name}
        </h2>
        <p className="text-[12px] font-black text-[#d4a017] uppercase tracking-[0.2em] mt-1">
          {user.role || "ADMINISTRATOR"}
        </p>
      </div>

      {/* Details & Settings (Right Side) */}
      <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-xl border-b-[8px] border-[#d4a017]">
        <h3 className="text-lg font-black text-[#001f3f] uppercase border-b-4 border-[#001f3f]/10 pb-2 mb-6 inline-block">
          Account Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
            {isEditing ? (
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full font-bold text-[#001f3f] border-b-2 border-[#d4a017] pb-1 focus:outline-none bg-slate-50 px-2 py-1 rounded"
              />
            ) : (
              <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1">{formData.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
            {isEditing ? (
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full font-bold text-[#001f3f] border-b-2 border-[#d4a017] pb-1 focus:outline-none bg-slate-50 px-2 py-1 rounded"
              />
            ) : (
              <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1">{formData.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</label>
            <p className="font-bold text-slate-500 border-b border-slate-50 pb-1 uppercase">{user.role || "Administrator"}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Level</label>
            <p className="font-bold text-slate-500 border-b border-slate-50 pb-1 uppercase">Full Access</p>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-4">
           {isEditing ? (
             <>
               <button 
                 onClick={handleSave}
                 className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-green-700 transition-all"
               >
                 Save Changes
               </button>
               <button 
                 onClick={() => setIsEditing(false)}
                 className="bg-slate-200 text-slate-600 px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-slate-300 transition-all"
               >
                 Cancel
               </button>
             </>
           ) : (
             <button 
               onClick={() => setIsEditing(true)}
               className="bg-[#001f3f] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-[#d4a017] transition-all"
             >
               Edit Profile
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
