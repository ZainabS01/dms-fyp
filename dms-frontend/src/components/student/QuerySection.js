import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, Edit2, X, Shield, GraduationCap, Clock } from 'lucide-react';

const QuerySection = ({ user }) => {
  const [formData, setFormData] = useState({
    studentName: user?.name || '', rollNumber: user?.rollNo || user?.rollno || '', department: user?.department || '', semester: user?.semester || '', subject: '', message: '', recipient: 'teacher', targetTeacherId: ''
  });
  const [history, setHistory] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        studentName: user.name || '',
        rollNumber: user.rollNo || user.rollno || '',
        department: user.department || '',
        semester: user.semester || ''
      }));
    }
  }, [user]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, idToDelete: null });
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, query: null });

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/all-teachers`);
      if (res.data.success) {
        setTeachers(res.data.teachers);
        
        // Auto-select the first teacher from the student's department if available
        const myDeptTeachers = res.data.teachers.filter(t => t.department?.toLowerCase() === user?.department?.toLowerCase());
        if (myDeptTeachers.length > 0) {
          setFormData(prev => ({ ...prev, targetTeacherId: myDeptTeachers[0]._id }));
        } else if (res.data.teachers.length > 0) {
          setFormData(prev => ({ ...prev, targetTeacherId: res.data.teachers[0]._id }));
        }
      }
    } catch (err) {
      console.error("Could not load teachers list");
    }
  }, [user]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  // Dropdown Options
  // const DEPARTMENTS = ["Computer Science", "Software Engineering", "Business", "Physics", "Mathematics"];
  // const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const fetchHistory = useCallback(async () => {
    try {
      const roll = user?.rollNo || user?.rollno || '';
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/query/all?rollNumber=${encodeURIComponent(roll)}`);
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
      await axios.post(`${process.env.REACT_APP_API_URL}/api/query/add`, formData);
      toast.success("Query Sent!");
      setFormData({ ...formData, subject: '', message: '' }); // Form reset
      fetchHistory();
    } catch (err) { toast.error("Error sending query"); }
    setLoading(false);
  };

  const confirmDelete = async () => {
    try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/query/delete/${modal.idToDelete}`);
        toast.success("Deleted successfully!");
        fetchHistory();
    } catch (err) { toast.error("Delete failed"); } 
    finally { setModal({ isOpen: false, idToDelete: null }); }
  };

  const handleEditSubmit = async () => {
    if (!editModal.data.subject || !editModal.data.message) {
      toast.error("Subject and Message cannot be empty");
      return;
    }
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/query/update/${editModal.data._id}`, {
        subject: editModal.data.subject,
        message: editModal.data.message
      });
      toast.success("Query updated!");
      fetchHistory();
      setEditModal({ isOpen: false, data: null });
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-0 sm:p-0 font-sans">
      {/* Modal and History Logic remains unchanged */}
      {viewModal.isOpen && viewModal.query && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-[#001f3f] uppercase">Query Details</h3>
              <button onClick={() => setViewModal({ isOpen: false, query: null })} className="text-slate-400 hover:text-red-500 font-black">X</button>
            </div>
            <div className="mb-4">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                {viewModal.query.subject}
              </p>
              <div className="p-4 bg-slate-50 rounded-lg border text-sm font-bold text-slate-700 max-h-60 overflow-y-auto whitespace-pre-wrap">
                {viewModal.query.message}
              </div>
            </div>
            {viewModal.query.reply && (
              <div className="mb-4">
                <p className="text-xs text-green-600 font-bold uppercase mb-1">Response</p>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-sm font-bold text-green-800 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {viewModal.query.reply}
                </div>
              </div>
            )}
            <button onClick={() => setViewModal({ isOpen: false, query: null })} className="w-full py-3 bg-[#001f3f] text-white font-bold rounded-lg hover:bg-blue-900 transition-colors">Close</button>
          </div>
        </div>
      )}

      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-black text-[#001f3f] mb-2">Delete Query?</h3>
            <p className="text-xs text-slate-500 font-bold mb-6">Are you sure you want to permanently delete this query?</p>
            <div className="flex gap-3">
              <button onClick={() => setModal({ isOpen: false, idToDelete: null })} className="flex-1 py-3 bg-slate-100 font-bold rounded-lg text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100 mb-10">
        <h2 className="text-xl font-black text-[#001f3f] mb-4">ASK A QUESTION</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select className="w-full px-4 py-2.5 bg-slate-50 rounded-lg font-bold border border-slate-200 outline-none text-sm" value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})}>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            
            {formData.recipient === 'teacher' ? (
              <select 
                className="w-full px-4 py-2.5 bg-blue-50 rounded-lg font-bold border border-blue-200 outline-none text-[#001f3f] text-sm" 
                value={formData.targetTeacherId} 
                onChange={(e) => setFormData({...formData, targetTeacherId: e.target.value})}
                required
              >
                {teachers.length === 0 ? (
                  <option value="" disabled>No teachers found</option>
                ) : (
                  <>
                    <optgroup label="My Department">
                      {teachers.filter(t => t.department?.toLowerCase() === user?.department?.toLowerCase()).map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Departments">
                      {teachers.filter(t => t.department?.toLowerCase() !== user?.department?.toLowerCase()).map(t => (
                        <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
            ) : (
              <div className="w-full px-4 py-2.5 bg-slate-100 rounded-lg font-bold border border-slate-200 text-slate-400 text-sm">
                Sending to Admin Directly
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 cursor-not-allowed text-sm" placeholder="Name" value={formData.studentName} readOnly required />
            <input className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 cursor-not-allowed text-sm" placeholder="Roll No" value={formData.rollNumber} readOnly required />
            
            <input className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 cursor-not-allowed text-sm" placeholder="Department" value={formData.department || 'N/A'} readOnly required />
            <input className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 cursor-not-allowed text-sm" placeholder="Semester" value={formData.semester || 'N/A'} readOnly required />
          </div>

          <input className="w-full px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm" placeholder="Subject" onChange={(e) => setFormData({...formData, subject: e.target.value})} value={formData.subject} required />
          <textarea className="w-full px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 h-24 text-sm" placeholder="Message" onChange={(e) => setFormData({...formData, message: e.target.value})} value={formData.message} required />
          <button disabled={loading} className="w-full py-3 bg-[#001f3f] text-white rounded-lg font-black text-sm hover:opacity-90 transition-opacity tracking-widest">{loading ? "SUBMITTING..." : "SUBMIT QUERY"}</button>
        </form>
      </div>

   <div className="space-y-4">
  <h3 className="text-lg font-black text-[#001f3f]">QUERY HISTORY</h3>
  {history.map((q) => (
    <div key={q._id} className="bg-white p-4 sm:p-6 rounded-lg border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start gap-4 mb-2">
        <div>
          <p className="font-bold text-[#001f3f] text-lg leading-tight">{q.subject}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            To: {q.recipient === 'teacher' && q.targetTeacherId?.name ? `TEACHER (${q.targetTeacherId.name})` : q.recipient} • From: {q.studentName}
            {q.department && q.department !== 'N/A' && ` • ${q.department}`}
            {q.semester && q.semester !== 'N/A' && ` • SEM: ${q.semester}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setEditModal({ isOpen: true, data: q })} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors" title="Edit Query">
             <Edit2 size={16} />
          </button>
          <button onClick={() => setModal({ isOpen: true, idToDelete: q._id })} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors" title="Delete Query">
             <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Student ka message */}
      <p 
        className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors line-clamp-3"
        onClick={() => setViewModal({ isOpen: true, query: q })}
        title="Click to read full message"
      >
        {q.message}
      </p>

      {/* RESPONSE SECTION */}
      {q.reply && (
        <div className={`${q.recipient === 'admin' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-green-50 border-green-200 text-green-800'} border p-4 rounded-lg text-sm mt-3 animate-in fade-in duration-300`}>
          <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1 ${q.recipient === 'admin' ? 'text-blue-700' : 'text-green-700'}`}>
            {q.recipient === 'admin' ? <><Shield size={14} /> ADMIN'S RESPONSE:</> : <><GraduationCap size={14} /> TEACHER'S RESPONSE:</>}
          </div>
          <p className="font-medium">{q.reply}</p>
        </div>
      )}

      {/* 3. If no reply has been received yet */}
      {!q.reply && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg w-max mt-3">
          <Clock size={12} /> Pending Response
        </div>
      )}
    </div>
  ))}
</div>

      {/* Custom Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl max-w-md w-full relative">
            <button onClick={() => setEditModal({ isOpen: false, data: null })} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-[#001f3f] mb-6 flex items-center gap-2">
              <Edit2 className="text-blue-500" /> Edit Query
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Subject</label>
                <input type="text" value={editModal.data.subject} onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, subject: e.target.value } })} className="w-full p-3.5 rounded-lg border border-slate-200 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Message</label>
                <textarea value={editModal.data.message} onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, message: e.target.value } })} className="w-full p-3.5 rounded-lg border border-slate-200 outline-none transition-colors h-32" rows="3"></textarea>
              </div>
              <div className="pt-2 flex gap-3">
                <button onClick={() => setEditModal({ isOpen: false, data: null })} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleEditSubmit} className="flex-1 py-3.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default QuerySection;