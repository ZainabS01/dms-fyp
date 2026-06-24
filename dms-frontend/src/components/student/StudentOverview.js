import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Overview = ({ user, onUpdate, setActiveTab }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const [editData, setEditData] = useState({
    name: "",
    semester: "",
    rollNo: "",
    department: "",
    profilePic: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || user.user?.name || "",
        semester: user.semester || user.user?.semester || "",
        rollNo: user.rollNo || user.user?.rollNo || user.rollno || user.user?.rollno || "",
        department: user.department || user.user?.department || user.dept || "",
        profilePic: user.profilePic || user.user?.profilePic || ""
      });
      if (user.profilePic || user.user?.profilePic) {
        setPreviewUrl(`${process.env.REACT_APP_API_URL}${user.profilePic || user.user?.profilePic}`);
      }
    }
  }, [user, isModalOpen]);

  const userData = {
    name: user?.name || user?.user?.name || "Student",
    rollNo: user?.rollNo || user?.user?.rollNo || user?.rollno || user?.user?.rollno || "N/A",
    semester: user?.semester || user?.user?.semester || "N/A",
    department: user?.department || user?.user?.department || user?.dept || "N/A",
    profilePic: user?.profilePic || user?.user?.profilePic || null
  };

  const navigationItems = [
    { name: 'Attendance', tabKey: 'attendance', color: 'border-yellow-500 hover:bg-yellow-500 text-[#002147]' },
    { name: 'Tasks & Projects', tabKey: 'task', color: 'border-[#002147] hover:bg-[#002147] text-[#002147]' },
    { name: 'Academic Result', tabKey: 'result', color: 'border-yellow-500 hover:bg-yellow-500 text-[#002147]' },
    { name: 'Timetable', tabKey: 'timetable', color: 'border-[#002147] hover:bg-[#002147] text-[#002147]' },
    { name: 'Query Hub', tabKey: 'queries', color: 'border-yellow-500 hover:bg-yellow-500 text-[#002147]' },
    { name: 'Course Data', tabKey: 'data', color: 'border-[#002147] hover:bg-[#002147] text-[#002147]' }
  ];

  const handleBoxClick = (e, tabKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (setActiveTab) {
      setActiveTab(tabKey);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setUploadError('');
    try {
      let uploadedImageUrl = editData.profilePic;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          uploadedImageUrl = uploadRes.data.imageUrl;
        } else {
          throw new Error('Image upload failed');
        }
      }

      if (onUpdate) {
        await onUpdate({
          ...user,
          name: editData.name,
          semester: editData.semester,
          rollNo: editData.rollNo,
          department: editData.department,
          profilePic: uploadedImageUrl
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setUploadError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        <div className="bg-white p-8 rounded-lg shadow-xl border-t-8 border-[#002147] text-center flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-[#d4a017] shadow-lg overflow-hidden flex items-center justify-center bg-slate-100">
              {userData.profilePic ? (
                <img src={`${process.env.REACT_APP_API_URL}${userData.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#002147] font-black text-4xl">{userData.name.charAt(0).toUpperCase()}</span>
              )}
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
            className="w-full mt-6 bg-[#002147] text-white py-3.5 rounded-lg font-bold hover:bg-blue-800 transition shadow-md active:scale-95 outline-none"
          >
            Edit Profile
          </button>
        </div>
        
        <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-center">
          {navigationItems.map(item => (
            <button
              key={item.tabKey}
              type="button"
              onClick={(e) => handleBoxClick(e, item.tabKey)}
              className={`p-6 bg-slate-50 border-l-[6px] ${item.color} rounded-lg text-[12px] font-black uppercase transition-all text-center flex items-center justify-center min-h-[120px] shadow-sm hover:shadow-lg hover:text-white hover:scale-[1.03] transform duration-200 cursor-pointer outline-none`}
            >
              {item.name}
            </button>
          ))}
        </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#002147]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#002147] p-6 text-center relative">
              <h3 className="text-xl font-black text-white tracking-widest uppercase">Edit Profile</h3>
              <p className="text-[#d4a017] text-xs font-bold mt-1">UPDATE YOUR DETAILS</p>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full border-4 border-slate-100 shadow-md overflow-hidden flex items-center justify-center bg-slate-50">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L28 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold">CHANGE</span>
                  </div>
                </div>
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                <p className="text-xs text-slate-400 mt-2 font-bold">Click to upload photo</p>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {uploadError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
                  <input 
                    type="text" 
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Roll No</label>
                    <input 
                      type="text" 
                      value={editData.rollNo}
                      onChange={(e) => setEditData({...editData, rollNo: e.target.value})}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Semester</label>
                    <input 
                      type="text" 
                      value={editData.semester}
                      onChange={(e) => setEditData({...editData, semester: e.target.value})}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Department</label>
                  <input 
                    type="text" 
                    value={editData.department}
                    onChange={(e) => setEditData({...editData, department: e.target.value})}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10 transition-all uppercase"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSaving}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-black hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex-1 py-4 bg-[#d4a017] text-[#002147] rounded-xl font-black shadow-lg shadow-[#d4a017]/30 hover:bg-[#b8860b] active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-[#002147]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;