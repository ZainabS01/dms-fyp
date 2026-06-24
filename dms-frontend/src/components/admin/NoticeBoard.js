import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

const NoticeBoard = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all');
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, idToDelete: null });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/notices`);
      setNotices(response.data);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to fetch notices history.');
    }
  };

  const confirmDeleteNotice = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/notices/${modal.idToDelete}`);
      toast.success("Notice deleted successfully!");
      fetchNotices();
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice.');
    } finally {
      setModal({ isOpen: false, idToDelete: null });
    }
  };

  const handlePostNotice = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and announcement text.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/notices`, {
        title,
        content,
        target,
      });
      toast.success('Notice posted successfully!');
      setTitle('');
      setContent('');
      setTarget('all');
      fetchNotices(); // Refresh history
    } catch (error) {
      console.error('Error posting notice:', error);
      toast.error('Failed to post notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-8 rounded-lg shadow-2xl max-w-sm mx-4 w-full text-center">
            <h3 className="text-xl font-black text-[#001f3f] mb-2">Delete Notice?</h3>
            <p className="text-xs text-slate-500 font-bold mb-6">Are you sure you want to permanently delete this notice?</p>
            <div className="flex gap-3">
              <button onClick={() => setModal({ isOpen: false, idToDelete: null })} className="flex-1 py-3 bg-slate-100 font-bold rounded-lg text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmDeleteNotice} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
      <div className="lg:col-span-2">
         <div className="bg-white p-4 sm:p-8 rounded-lg sm:rounded-lg shadow-2xl border border-slate-50">
            <h3 className="text-xl font-black text-[#001f3f] uppercase mb-4">Create New Announcement</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Notice Title..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-[#d4a017]" 
              />
              <textarea 
                placeholder="Write full announcement here..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-lg border-none h-28 focus:ring-2 focus:ring-[#d4a017]"
              ></textarea>
              
              <div className="flex flex-col gap-2">
                <label className="font-bold text-[#001f3f] uppercase text-sm">Target Audience:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="all" checked={target === 'all'} onChange={() => setTarget('all')} className="w-4 h-4 text-[#d4a017] focus:ring-[#d4a017]" />
                    <span className="text-[#001f3f] font-semibold">All</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="student" checked={target === 'student'} onChange={() => setTarget('student')} className="w-4 h-4 text-[#d4a017] focus:ring-[#d4a017]" />
                    <span className="text-[#001f3f] font-semibold">Students</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="teacher" checked={target === 'teacher'} onChange={() => setTarget('teacher')} className="w-4 h-4 text-[#d4a017] focus:ring-[#d4a017]" />
                    <span className="text-[#001f3f] font-semibold">Teachers</span>
                  </label>
                </div>
              </div>

              <button 
                onClick={handlePostNotice}
                disabled={loading}
                className={`w-full ${loading ? 'bg-slate-400' : 'bg-[#001f3f] hover:bg-[#002f5f]'} text-[#d4a017] py-5 rounded-lg font-black uppercase tracking-widest shadow-lg transition-colors`}
              >
                {loading ? 'Posting...' : 'Post Notice'}
              </button>
            </div>
         </div>
      </div>
      <div>
         <h3 className="text-xl font-black text-[#001f3f] uppercase mb-4">Recent History</h3>
         <div className="space-y-4">
            {notices.length === 0 ? (
              <p className="text-slate-400 text-sm ">No recent notices found.</p>
            ) : (
              notices.slice(0, 3).map((notice) => (
                <div key={notice._id} className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-lg shadow-xl border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  {/* Decorative Side Bar */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#001f3f] to-[#d4a017]"></div>
                  
                  <div className="flex justify-between items-center mb-3 pl-2">
                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider">
                      To: {notice.target}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                      <button onClick={() => setModal({ isOpen: true, idToDelete: notice._id })} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors" title="Delete Notice">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-black text-[#001f3f] text-lg leading-tight uppercase pl-2 mb-2 group-hover:text-[#d4a017] transition-colors">{notice.title}</h4>
                  <p className="text-sm text-slate-500 pl-2 whitespace-pre-wrap line-clamp-3 leading-relaxed">{notice.content}</p>
                </div>
              ))
            )}
         </div>
      </div>
    </div>
  );
};

export default NoticeBoard;