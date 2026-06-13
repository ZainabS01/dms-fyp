import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

const QuerySection = ({ user }) => {
  const [formData, setFormData] = useState({
    studentName: '', rollNumber: '', department: '', semester: '', subject: '', message: '', recipient: 'teacher'
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, idToDelete: null });

  // Dropdown Options
  const DEPARTMENTS = ["Computer Science", "Software Engineering", "Business", "Physics", "Mathematics"];
  const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const fetchHistory = useCallback(async () => {
    try {
      const roll = user?.rollNo || user?.rollno || '';
      const res = await axios.get(`http://localhost:5000/api/query/all?rollNumber=${encodeURIComponent(roll)}`);
      setHistory(res.data.reverse()); 
    } catch (err) { toast.error("Could not load history"); }
  }, [user]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department || !formData.semester) {
        toast.error("Please select Department and Semester!");
        return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/query/add', formData);
      toast.success("Query Sent!");
      setFormData({ ...formData, subject: '', message: '' }); // Form reset
      fetchHistory();
    } catch (err) { toast.error("Error sending query"); }
    setLoading(false);
  };

  const confirmDelete = async () => {
    try {
        await axios.delete(`http://localhost:5000/api/query/delete/${modal.idToDelete}`);
        toast.success("Deleted successfully!");
        fetchHistory();
    } catch (err) { toast.error("Delete failed"); } 
    finally { setModal({ isOpen: false, idToDelete: null }); }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 font-sans">
      {/* Modal and History Logic remains unchanged */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-black text-[#001f3f] mb-2">Delete Query?</h3>
            <p className="text-xs text-slate-500 font-bold mb-6">Are you sure you want to permanently delete this query?</p>
            <div className="flex gap-3">
              <button onClick={() => setModal({ isOpen: false, idToDelete: null })} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-10">
        <h2 className="text-2xl font-black text-[#001f3f] mb-6">ASK A QUESTION</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-200 outline-none" value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})}>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="Name" onChange={(e) => setFormData({...formData, studentName: e.target.value})} value={formData.studentName} required />
            <input className="p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="Roll No" onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} value={formData.rollNumber} required />
            
            {/* NEW DROPDOWNS */}
            <select className="p-4 bg-slate-50 rounded-xl border border-slate-200" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} required>
                <option value="">Select Dept</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="p-4 bg-slate-50 rounded-xl border border-slate-200" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} required>
                <option value="">Select Sem</option>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <input className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="Subject" onChange={(e) => setFormData({...formData, subject: e.target.value})} value={formData.subject} required />
          <textarea className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 h-32" placeholder="Message" onChange={(e) => setFormData({...formData, message: e.target.value})} value={formData.message} required />
          <button disabled={loading} className="w-full py-4 bg-[#001f3f] text-white rounded-xl font-black">{loading ? "SUBMITTING..." : "SUBMIT QUERY"}</button>
        </form>
      </div>

   <div className="space-y-4">
  <h3 className="text-lg font-black text-[#001f3f]">QUERY HISTORY</h3>
  {history.map((q) => (
    <div key={q._id} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start gap-4 mb-2">
        <div>
          <p className="font-bold text-[#001f3f] text-lg leading-tight">{q.subject}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">To: {q.recipient} • From: {q.studentName} • {q.department} • SEM: {q.semester}</p>
        </div>
        <button onClick={() => setModal({ isOpen: true, idToDelete: q._id })} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors shrink-0" title="Delete Query">
           <Trash2 size={16} />
        </button>
      </div>
      
      {/* Student ka message */}
      <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl">{q.message}</p>

      {/* RESPONSE SECTION */}
      {q.reply && (
        <div className={`${q.recipient === 'admin' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-green-50 border-green-200 text-green-800'} border p-4 rounded-xl text-sm mt-3 animate-in fade-in duration-300`}>
          <div className={`flex items-center font-bold text-xs uppercase tracking-wider mb-1 ${q.recipient === 'admin' ? 'text-blue-700' : 'text-green-700'}`}>
            {q.recipient === 'admin' ? "🏛️ ADMIN'S RESPONSE:" : "✨ TEACHER'S RESPONSE:"}
          </div>
          <p className="font-medium">{q.reply}</p>
        </div>
      )}

      {/* 3. If no reply has been received yet */}
      {!q.reply && (
        <div className="text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg w-max mt-3">
          ⏳ Pending Response
        </div>
      )}
    </div>
  ))}
</div>
    </div>
  );
};
export default QuerySection;