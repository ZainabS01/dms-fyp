import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { User, Upload } from 'lucide-react';

const AdminProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "System Administrator",
    email: user?.email || "admin@dms.edu.pk",
    profilePic: user?.profilePic || "",
    profilePicFile: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "System Administrator",
        email: user.email || "admin@dms.edu.pk",
        profilePic: user.profilePic || "",
        profilePicFile: null
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#001f3f] font-black animate-pulse text-xl">
          LOADING PROFILE...
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill all fields!");
      return;
    }
    
    setUploading(true);
    try {
      let finalProfilePic = formData.profilePic;

      if (formData.profilePicFile) {
        const uploadData = new FormData();
        uploadData.append('image', formData.profilePicFile);

        const uploadRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data.success) {
          finalProfilePic = uploadRes.data.imageUrl;
          setFormData(prev => ({ ...prev, profilePic: finalProfilePic, profilePicFile: null }));
        }
      }

      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/update-profile`, {
        email: formData.email,
        name: formData.name,
        profilePic: finalProfilePic
      });

      if (res.data.success) {
        toast.success("Profile updated successfully!", {
          style: { background: '#001f3f', color: '#fff', borderRadius: '15px' }
        });
        
        // Update local storage so changes persist after reload
        if (res.data.user) {
          const storedUser = JSON.parse(localStorage.getItem('user')) || {};
          const updatedUser = { ...storedUser, ...res.data.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        setIsEditing(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error("Profile Update Error", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update profile");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-0 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      
      <div className="bg-white p-8 rounded-lg shadow-xl border-b-[8px] border-[#001f3f]">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-[#001f3f]/10 pb-4 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-md overflow-hidden">
                {formData.profilePicFile ? (
                  <img src={URL.createObjectURL(formData.profilePicFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : formData.profilePic ? (
                  <img src={`${process.env.REACT_APP_API_URL}${formData.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-slate-400" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#001f3f] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#d4a017] transition-colors shadow-lg">
                  <Upload size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setFormData({...formData, profilePicFile: e.target.files[0]})} />
                </label>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#001f3f] uppercase tracking-tighter">
                {formData.name ? formData.name.replace(/admin/ig, '').trim() : ''}
              </h3>
              <p className="text-[10px] font-black text-[#d4a017] uppercase tracking-[0.2em] mt-1">
                {user.role || "ADMINISTRATOR"}
              </p>
            </div>
          </div>
        </div>
        
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
              <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1">
                {formData.name ? formData.name.replace(/admin/ig, '').trim() : ''}
              </p>
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
                 disabled={uploading}
                 className="bg-green-600 text-white px-8 py-3 rounded-lg font-black uppercase text-xs shadow-lg hover:bg-green-700 transition-all disabled:opacity-50"
               >
                 {uploading ? 'Saving...' : 'Save Changes'}
               </button>
               <button 
                 onClick={() => setIsEditing(false)}
                 className="bg-slate-200 text-slate-600 px-8 py-3 rounded-lg font-black uppercase text-xs hover:bg-slate-300 transition-all"
               >
                 Cancel
               </button>
             </>
           ) : (
             <button 
               onClick={() => setIsEditing(true)}
               className="bg-[#001f3f] text-white px-8 py-3 rounded-lg font-black uppercase text-xs shadow-lg hover:bg-[#d4a017] transition-all"
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
