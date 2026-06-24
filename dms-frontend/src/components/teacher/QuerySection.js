import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, ChevronDown, Edit2 } from 'lucide-react';

const QuerySection = ({ user }) => {
  const [queries, setQueries] = useState([]);
  const [adminQueries, setAdminQueries] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [modal, setModal] = useState({ isOpen: false, idToDelete: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, query: null });
  const [replyModal, setReplyModal] = useState({ isOpen: false, queryId: null });
  
  const [filterDept, setFilterDept] = useState("All");
  const [filterSem, setFilterSem] = useState("All");
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSemOpen, setIsSemOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState("STUDENT");
  const [adminSub, setAdminSub] = useState("");
  const [adminMsg, setAdminMsg] = useState("");

  const [departments, setDepartments] = useState([]);
  const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments`);
        setDepartments(res.data.map(d => d.name.replace(/^BS\s+/i, '').trim().toUpperCase()));
      } catch (err) {
        console.error("Failed to load departments");
      }
    };
    fetchDepartments();
  }, []);

  const fetchQueries = useCallback(async () => {
    try {
      const teacherId = user?._id || user?.id || user?.user?._id || user?.user?.id;
      if (!teacherId) return; // Wait until user is fully loaded
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/query/all?role=teacher&teacherId=${teacherId}`);
      // Student Queries (Teacher ke liye)
      setQueries(res.data.filter(q => q.recipient === 'teacher').reverse());
      // Admin Queries (Jo teacher ne bheji hain)
      setAdminQueries(res.data.filter(q => q.recipient === 'admin').reverse());
    } catch (err) {
      toast.error("Failed to load queries");
    }
  }, [user]);

  useEffect(() => { fetchQueries(); }, [fetchQueries]);

  const filteredQueries = queries.filter((q) => {
    const qDept = (q.department || "").trim();
    const qSem = (q.semester || "").trim();
    
    // Flexible matching for department (ignoring 'BS ' prefix)
    const cleanQDept = qDept.replace(/^BS\s+/i, '').trim().toUpperCase();
    const cleanFilterDept = filterDept.replace(/^BS\s+/i, '').trim().toUpperCase();
    
    const isDeptMatch = filterDept === "All" || cleanQDept === cleanFilterDept || cleanQDept.includes(cleanFilterDept) || cleanFilterDept.includes(cleanQDept);
    
    return isDeptMatch && (filterSem === "All" || qSem === filterSem);
  });

  const handleReply = async (queryId) => {
    if (!replyText[queryId]) return toast.error("Write a reply first!");
    try {
      // === ✨ FIXED HERE: Changed 'adminReply' to 'reply' to match schema strictly ===
      await axios.put(`${process.env.REACT_APP_API_URL}/api/query/reply/${queryId}`, { reply: replyText[queryId] });
      toast.success("Reply sent & Query Resolved!");
      fetchQueries();
      setReplyText({...replyText, [queryId]: ""});
    } catch (err) { toast.error("Failed to send reply"); }
  };

  // ADMIN QUERY SUBMISSION
  const submitAdminQuery = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/query/add`, { 
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
      await axios.put(`${process.env.REACT_APP_API_URL}/api/query/update/${queryId}`, { message: editText });
      toast.success("Message updated!");
      setEditingId(null);
      fetchQueries();
    } catch (err) { toast.error("Update failed"); }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/query/delete/${modal.idToDelete}`);
      toast.success("Query deleted successfully!");
      fetchQueries();
    } catch (err) {
      toast.error("Failed to delete query.");
    } finally {
      setModal({ isOpen: false, idToDelete: null });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 font-sans pb-[40vh]">
      {viewModal.isOpen && viewModal.query && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-[#001f3f] uppercase">Query Details</h3>
              <button onClick={() => setViewModal({ isOpen: false, query: null })} className="text-slate-400 hover:text-red-500 font-black">X</button>
            </div>
            <div className="mb-4">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                {viewModal.query.studentName || viewModal.query.subject}
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


      {replyModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl max-w-md w-full relative">
            <h3 className="text-xl font-black text-[#001f3f] mb-4 uppercase">Reply to Query</h3>
            <textarea 
              placeholder="Type your reply here..." 
              value={replyText[replyModal.queryId] || ''}
              onChange={(e) => setReplyText({ ...replyText, [replyModal.queryId]: e.target.value })}
              className="w-full p-4 bg-slate-50 rounded-lg text-sm font-bold border focus:ring-2 focus:ring-[#d4a017] h-32 resize-none mb-6 outline-none" 
            />
            <div className="flex gap-3">
              <button onClick={() => setReplyModal({ isOpen: false, queryId: null })} className="flex-1 py-3 bg-slate-100 font-black rounded-lg text-slate-600 hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest">Cancel</button>
              <button 
                onClick={() => {
                  handleReply(replyModal.queryId);
                  setReplyModal({ isOpen: false, queryId: null });
                }} 
                className="flex-1 py-3 bg-[#001f3f] text-white font-black rounded-lg hover:bg-blue-900 transition-colors uppercase text-xs tracking-widest"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab("STUDENT")} className={`px-4 sm:px-6 py-2 rounded-lg font-black text-xs ${activeTab === "STUDENT" ? "bg-[#001f3f] text-white" : "text-slate-500"}`}>STUDENT QUERIES</button>
        <button onClick={() => setActiveTab("ADMIN")} className={`px-4 sm:px-6 py-2 rounded-lg font-black text-xs ${activeTab === "ADMIN" ? "bg-[#001f3f] text-white" : "text-slate-500"}`}>ADMIN SUPPORT</button>
      </div>

      {activeTab === "STUDENT" ? (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-lg border shadow-sm">
            {/* Custom Department Dropdown */}
            <div className="relative flex-1">
              <div 
                onClick={() => { setIsDeptOpen(!isDeptOpen); setIsSemOpen(false); }}
                className="w-full p-4 bg-slate-50 rounded-lg font-bold border cursor-pointer flex justify-between items-center text-sm"
              >
                <span>{filterDept === "All" ? "All Departments" : filterDept}</span>
                <ChevronDown size={18} className={`transition-transform ${isDeptOpen ? 'rotate-180' : ''}`} />
              </div>
              {isDeptOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  <div 
                    onClick={() => { setFilterDept("All"); setIsDeptOpen(false); }}
                    className="p-3 hover:bg-slate-50 cursor-pointer text-sm font-bold border-b border-slate-50"
                  >
                    All Departments
                  </div>
                  {departments.map(d => (
                    <div 
                      key={d}
                      onClick={() => { setFilterDept(d); setIsDeptOpen(false); }}
                      className="p-3 hover:bg-slate-50 cursor-pointer text-sm font-bold border-b border-slate-50"
                    >
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Semester Dropdown */}
            <div className="relative flex-1">
              <div 
                onClick={() => { setIsSemOpen(!isSemOpen); setIsDeptOpen(false); }}
                className="w-full p-4 bg-slate-50 rounded-lg font-bold border cursor-pointer flex justify-between items-center text-sm"
              >
                <span>{filterSem === "All" ? "All Semesters" : `Semester ${filterSem}`}</span>
                <ChevronDown size={18} className={`transition-transform ${isSemOpen ? 'rotate-180' : ''}`} />
              </div>
              {isSemOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  <div 
                    onClick={() => { setFilterSem("All"); setIsSemOpen(false); }}
                    className="p-3 hover:bg-slate-50 cursor-pointer text-sm font-bold border-b border-slate-50"
                  >
                    All Semesters
                  </div>
                  {SEMESTERS.map(s => (
                    <div 
                      key={s}
                      onClick={() => { setFilterSem(s); setIsSemOpen(false); }}
                      className="p-3 hover:bg-slate-50 cursor-pointer text-sm font-bold border-b border-slate-50"
                    >
                      {s} Semester
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filteredQueries.map((q) => (
            <div key={q._id} className="bg-white p-4 sm:p-6 rounded-lg mb-6 border shadow-sm">
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
              
              <p 
                className="mt-2 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200 line-clamp-3" 
                onClick={() => setViewModal({ isOpen: true, query: q })}
                title="Click to read full message"
              >
                "{q.message}"
              </p>
              
              {q.reply && <div className="mt-4 p-3 bg-green-50 border rounded-lg text-xs font-bold text-green-800">Reply: {q.reply}</div>}

              <div className="mt-4">
                <button 
                  onClick={() => {
                      setReplyText({ ...replyText, [q._id]: q.reply || '' });
                      setReplyModal({ isOpen: true, queryId: q._id });
                  }} 
                  className="px-6 py-2 bg-[#001f3f] text-white rounded-lg font-black text-xs uppercase shadow-md hover:bg-blue-900 transition-colors inline-flex items-center gap-2"
                >
                  {q.reply ? <><Edit2 size={14} /> Edit Reply</> : "Reply"}
                </button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="space-y-6">
          <form onSubmit={submitAdminQuery} className="bg-white p-8 rounded-lg border shadow-sm">
            <input className="w-full p-4 bg-slate-50 rounded-lg mb-4 border" placeholder="Subject" value={adminSub} onChange={(e) => setAdminSub(e.target.value)} required />
            <textarea className="w-full p-4 bg-slate-50 rounded-lg mb-4 border h-32" placeholder="Message to Admin..." value={adminMsg} onChange={(e) => setAdminMsg(e.target.value)} required />
            <button className="w-full p-4 bg-[#001f3f] text-white rounded-lg font-black">SUBMIT TO ADMIN</button>
          </form>
          {adminQueries.map(aq => (
            <div key={aq._id} className="bg-white p-6 rounded-lg border shadow-sm relative">
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black ${aq.reply ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                  {aq.reply ? 'RESOLVED' : 'PENDING'}
                </div>
                <button onClick={() => setModal({ isOpen: true, idToDelete: aq._id })} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors" title="Delete Query">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="font-black text-[#001f3f]">{aq.subject}</p>
              
              {editingId === aq._id ? (
                <div className="mt-4">
                  <textarea className="w-full p-2 border rounded-lg text-sm" defaultValue={aq.message} onChange={(e) => setEditText(e.target.value)} />
                  <button onClick={() => handleEdit(aq._id)} className="mt-2 px-4 py-1 bg-green-500 text-white rounded-lg text-xs font-black">SAVE</button>
                </div>
              ) : (
                <div className="mt-2 flex items-center flex-wrap gap-2">
                  <p 
                    className="text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200 line-clamp-3"
                    onClick={() => setViewModal({ isOpen: true, query: aq })}
                    title="Click to read full message"
                  >
                    "{aq.message}"
                  </p>
                  {!aq.reply && (
                    <button 
                      onClick={() => { setEditingId(aq._id); setEditText(aq.message); }} 
                      className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1 transition-all border border-transparent hover:border-blue-200"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>
              )}
              {aq.reply && (
                <div className="mt-4 p-3 bg-green-50 border rounded-lg text-xs font-bold text-green-800">
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