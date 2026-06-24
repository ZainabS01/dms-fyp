import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Upload } from 'lucide-react';

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null); // 👈 New state to handle errors
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', profilePic: '', profilePicFile: null });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Check if token exists
        if (!token) {
          setError("Session expired. Please login again.");
          return;
        }

        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // For debugging, check the console
        console.log("Profile Data:", res.data);

        if (res.data.success) {
          setProfile(res.data.user);
          setFormData({
            name: res.data.user.name || '',
            phone: res.data.user.phone || '',
            profilePic: res.data.user.profilePic || '',
            profilePicFile: null
          });
        } else {
          setError("Failed to fetch user data.");
        }
      } catch (err) {
        console.error("Fetch Error:", err.response?.data || err.message);
        setError("Could not connect to the backend.");
      }
    };
    fetchProfile();
  }, []);

  // 1. If an error occurs, show it instead of infinite loading
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

  // 2. Until data is loaded
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#001f3f] font-black animate-pulse text-xl">
          CONNECTING TO SERVER...
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty!");
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

      const token = localStorage.getItem('token');
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
        name: formData.name,
        profilePic: finalProfilePic
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success("Profile updated successfully!", {
          style: { background: '#001f3f', color: '#fff', borderRadius: '15px' }
        });
        setProfile(res.data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Profile Update Error", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update profile");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500">
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
                {formData.name}
              </h3>
              <p className="text-[10px] font-black text-[#d4a017] uppercase tracking-[0.2em] mt-1">
                {profile.isHOD ? "HEAD OF DEPARTMENT" : (profile.role || "Faculty Member")}
              </p>
            </div>
          </div>
          <div className="bg-slate-100 text-[#001f3f] px-4 py-2 mt-4 md:mt-0 rounded-lg text-[10px] font-black uppercase tracking-widest">
            Dept: {profile.department || "CS & SE"}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
            {isEditing ? (
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full font-bold text-[#001f3f] border-b-2 border-[#d4a017] pb-1 focus:outline-none bg-slate-50 px-2 py-1 rounded"
              />
            ) : (
              <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1">{profile.name}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
            <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1 break-all">{profile.email}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
            <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1">{profile.phone || "Not Provided"}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
            <p className="font-bold text-[#001f3f] border-b border-slate-50 pb-1 uppercase">{profile.department}</p>
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

export default TeacherProfile;