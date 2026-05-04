import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import toast from 'react-hot-toast';

const NoticeBoard = () => {
  const [notice, setNotice] = useState({ title: '', message: '', target: 'All' });

  const handlePost = (e) => {
    e.preventDefault();
    toast.success("Notice Posted Successfully!");
    setNotice({ title: '', message: '', target: 'All' });
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar activeTab="Notices" />
      
      <main className="flex-1 ml-72 p-10">
        <h1 className="text-3xl font-black text-[#001f3f] uppercase italic mb-8">Notice Board Control</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Create Notice Form */}
          <div className="bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
            <h2 className="text-xl font-black text-[#001f3f] uppercase mb-6">Create New Announcement</h2>
            <form onSubmit={handlePost} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notice Title</label>
                <input 
                  type="text" 
                  value={notice.title}
                  onChange={(e) => setNotice({...notice, title: e.target.value})}
                  className="w-full p-4 mt-1 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#d4a017] font-bold" 
                  placeholder="e.g. Midterm Examination Schedule" 
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                <select 
                  className="w-full p-4 mt-1 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#d4a017] font-bold bg-white"
                  value={notice.target}
                  onChange={(e) => setNotice({...notice, target: e.target.value})}
                >
                  <option>All</option>
                  <option>Students Only</option>
                  <option>Faculty Only</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Details</label>
                <textarea 
                  rows="4" 
                  value={notice.message}
                  onChange={(e) => setNotice({...notice, message: e.target.value})}
                  className="w-full p-4 mt-1 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#d4a017] font-bold" 
                  placeholder="Write full announcement here..."
                  required
                ></textarea>
              </div>
              <button className="w-full bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-blue-900 shadow-lg transition-all">
                Broadcast Notice
              </button>
            </form>
          </div>

          {/* History / Recent Notices */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-[#001f3f] uppercase">Recent History</h2>
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-[30px] shadow-sm border-r-8 border-[#d4a017]">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-slate-100 text-[#001f3f] text-[9px] font-black px-3 py-1 rounded-full uppercase">To: All</span>
                  <span className="text-slate-300 text-[10px] font-bold">24 Oct, 2023</span>
                </div>
                <h4 className="font-black text-[#001f3f] uppercase tracking-tighter">Semester Break Official Notification</h4>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">The university will remain closed from next week due to...</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoticeBoard;