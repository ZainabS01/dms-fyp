import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

const QuerySection = ({ user }) => {
  const [queries, setQueries] = useState([]);
  const [adminQueries, setAdminQueries] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [modal, setModal] = useState({ isOpen: false, idToDelete: null });
  
  const [filterDept, setFilterDept] = useState("All");
  const [filterSem, setFilterSem] = useState("All");
  
  const [activeTab, setActiveTab] = useState("STUDENT");
  const [adminSub, setAdminSub] = useState("");
  const [adminMsg, setAdminMsg] = useState("");

  const DEPARTMENTS = ["Computer Science", "Software Engineering", "Business", "Physics", "Mathematics"];
  const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const fetchQueries = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/query/all');
      // Student Queries (Teacher ke liye)
      setQueries(res.data.filter(q => q.recipient === 'teacher').reverse());
      // Admin Queries (Jo teacher ne bheji hain)
      setAdminQueries(res.data.filter(q => q.recipient === 'admin').reverse());
    } catch (err) {
      toast.error("Failed to load queries");
    }
  }, []);

  useEffect(() => { fetchQueries(); }, [fetchQueries]);

  const filteredQueries = queries.filter((q) => {
    const qDept = (q.department || "").trim();
    const qSem = (q.semester || "").trim();
    return (filterDept === "All" || qDept === filterDept) && 
           (filterSem === "All" || qSem === filterSem);
  });

  const handleReply = async (queryId) => {
    if (!replyText[queryId]) return toast.error("Write a reply first!");
    try {
      // === ✨ FIXED HERE: Changed 'adminReply' to 'reply' to match schema strictly ===
      await axios.put(`http://localhost:5000/api/query/reply/${queryId}`, { reply: replyText[queryId] });
      toast.success("Reply sent & Query Resolved!");
      fetchQueries();
      setReplyText({...replyText, [queryId]: ""});
    } catch (err) { toast.error("Failed to send reply"); }
  };

  // ADMIN QUERY SUBMISSION
  const submitAdminQuery = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/query/add', { 
        studentName: user?.name || user?.user?.name || "Teacher",
        department: user?.department || user?.user?.department || "N/A",
        subject: adminSub, 
        message: adminMsg, 
        recipient: 'admin' 
      });
      toast.success("Query sent to Admin!");
      setAdminSub(""); setAdminMsg("");
      fetchQueries();
    } catch (err) { toast.error("Failed to send to Admin"); }
  };

  // EDIT MESSAGE LOGIC
  const handleEdit = async (queryId) => {
    try {
      await axios.put(`http://localhost:5000/api/query/update/${queryId}`, { message: editText });
      toast.success("Message updated!");
      setEditingId(null);
      fetchQueries();
    } catch (err) { toast.error("Update failed"); }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/query/delete/${modal.idToDelete}`);
      toast.success("Query deleted successfully!");
      fetchQueries();
    } catch (err) {
      toast.error("Failed to delete query.");
    } finally {
      setModal({ isOpen: false, idToDelete: null });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 font-sans">
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
      <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
        <button onClick={() => setActiveTab("STUDENT")} className={`px-4 sm:px-6 py-2 rounded-xl font-black text-xs ${activeTab === "STUDENT" ? "bg-[#001f3f] text-white" : "text-slate-500"}`}>STUDENT QUERIES</button>
        <button onClick={() => setActiveTab("ADMIN")} className={`px-4 sm:px-6 py-2 rounded-xl font-black text-xs ${activeTab === "ADMIN" ? "bg-[#001f3f] text-white" : "text-slate-500"}`}>ADMIN SUPPORT</button>
      </div>

      {activeTab === "STUDENT" ? (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border shadow-sm">
            <select className="w-full p-4 bg-slate-50 rounded-xl font-bold border" onChange={(e) => setFilterDept(e.target.value)}>
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="w-full p-4 bg-slate-50 rounded-xl font-bold border" onChange={(e) => setFilterSem(e.target.value)}>
              <option value="All">All Semesters</option>
              {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>

          {filteredQueries.map((q) => (
            <div key={q._id} className="bg-white p-4 sm:p-6 rounded-3xl mb-6 border shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-black text-[#001f3f]">{q.studentName}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase">ROLL: {q.rollNumber} • {q.department} • SEM: {q.semester}</p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black ${q.reply ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                    {q.reply ? 'RESOLVED' : 'PENDING'}
                  </div>
                  <button onClick={() => setModal({ isOpen: true, idToDelete: q._id })} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors shrink-0" title="Delete Query">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {editingId === q._id ? (
                <div className="mt-4">
                  <textarea className="w-full p-2 border rounded-xl text-sm" defaultValue={q.message} onChange={(e) => setEditText(e.target.value)} />
                  <button onClick={() => handleEdit(q._id)} className="mt-2 px-4 py-1 bg-green-500 text-white rounded-lg text-xs font-black">SAVE</button>
                </div>
              ) : (
                <p className="mt-2 text-sm font-bold text-slate-700">"{q.message}" 
                   {!q.reply && <button onClick={() => { setEditingId(q._id); setEditText(q.message); }} className="ml-2 text-[10px] text-blue-600 underline">Edit</button>}
                </p>
              )}
              
              {/* FIXED HERE ALSO: Read reply from 'q.reply' for teacher dashboard display */}
              {q.reply && <div className="mt-4 p-3 bg-green-50 border rounded-xl text-xs font-bold text-green-800">Reply: {q.reply}</div>}

              <div className="flex gap-2 mt-4">
                <input className="flex-1 p-2 bg-slate-50 rounded-lg text-sm border" placeholder="Type reply..." onChange={(e) => setReplyText({...replyText, [q._id]: e.target.value})} />
                <button onClick={() => handleReply(q._id)} className="px-4 sm:px-6 bg-[#001f3f] text-white rounded-lg font-black text-xs">SEND</button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="space-y-6">
          <form onSubmit={submitAdminQuery} className="bg-white p-8 rounded-3xl border shadow-sm">
            <input className="w-full p-4 bg-slate-50 rounded-xl mb-4 border" placeholder="Subject" value={adminSub} onChange={(e) => setAdminSub(e.target.value)} required />
            <textarea className="w-full p-4 bg-slate-50 rounded-xl mb-4 border h-32" placeholder="Message to Admin..." value={adminMsg} onChange={(e) => setAdminMsg(e.target.value)} required />
            <button className="w-full p-4 bg-[#001f3f] text-white rounded-xl font-black">SUBMIT TO ADMIN</button>
          </form>
          {adminQueries.map(aq => (
            <div key={aq._id} className="bg-white p-6 rounded-3xl border shadow-sm relative">
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black ${aq.reply ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                  {aq.reply ? 'RESOLVED' : 'PENDING'}
                </div>
                <button onClick={() => setModal({ isOpen: true, idToDelete: aq._id })} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors" title="Delete Query">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="font-black text-[#001f3f]">{aq.subject}</p>
              <p className="text-sm text-slate-600 mt-2">"{aq.message}"</p>
              {aq.reply && (
                <div className="mt-4 p-3 bg-green-50 border rounded-xl text-xs font-bold text-green-800">
                  Response: {aq.reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuerySection;