import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trash2, Shield, User, GraduationCap, ChevronDown, Edit2 } from 'lucide-react';

const QuerySection = ({ userRole, user }) => {
  const [, setActiveTab] = useState('inbox');
  const [queries, setQueries] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipient] = useState(userRole === 'admin' ? 'student' : 'admin');
  const [targetRollNo, setTargetRollNo] = useState(''); // For admin
  const [replyTexts, setReplyTexts] = useState({});
  const [modal, setModal] = useState({ isOpen: false, idToDelete: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, query: null });
  const [replyModal, setReplyModal] = useState({ isOpen: false, queryId: null });

  const [filterDept, setFilterDept] = useState('All');
  const [filterSender, setFilterSender] = useState('All');
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSenderOpen, setIsSenderOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

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

  useEffect(() => {
    fetchQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const fetchQueries = async () => {
    try {
      const rollNo = user?.rollNo || user?.user?.rollNo || '';
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/query/all?role=${userRole}&rollNumber=${rollNo}`);
      setQueries(res.data);
    } catch (err) {
      toast.error("Failed to fetch queries.");
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleAskQuery = async () => {
    if (!subject || !message) {
      toast.error('Please fill subject and message.');
      return;
    }
    
    let finalRecipient = recipient;
    if (userRole === 'admin' && recipient === 'student') {
        if (!targetRollNo) {
            toast.error('Please provide target Roll No.');
            return;
        }
        finalRecipient = targetRollNo;
    }

    const payload = {
        studentName: userRole === 'admin' ? 'Admin' : (user?.name || user?.user?.name || "Unknown"),
        rollNumber: userRole === 'admin' ? 'Admin' : (user?.rollNo || user?.user?.rollNo || "N/A"),
        department: user?.department || user?.user?.department || 'N/A',
        semester: user?.semester || user?.user?.semester || 'N/A',
        subject,
        message,
        recipient: finalRecipient,
        sender: userRole
    };

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/query/add`, payload);
        toast.success("Message sent successfully!");
        setSubject('');
        setMessage('');
        setTargetRollNo('');
        fetchQueries();
        setActiveTab('inbox');
    } catch (err) {
        toast.error("Failed to send message.");
    }
  };

  const handleReply = async (id) => {
    const replyText = replyTexts[id];
    if (!replyText) {
      toast.error("Reply cannot be empty.");
      return;
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/query/reply/${id}`, { reply: replyText });
      toast.success("Replied successfully!");
      setReplyTexts({ ...replyTexts, [id]: '' });
      fetchQueries();
    } catch (err) {
      toast.error("Failed to reply.");
    }
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

  const getFullDeptName = (dept) => {
    if (!dept) return "";
    const clean = dept.replace(/^BS\s+/i, '').trim().toUpperCase();
    if (clean === "CS") return "COMPUTER SCIENCE";
    if (clean === "SE") return "SOFTWARE ENGINEERING";
    if (clean === "IT") return "INFORMATION TECHNOLOGY";
    if (clean === "BBA") return "BUSINESS ADMINISTRATION";
    return clean;
  };

  const filteredQueries = queries.filter((q) => {
    const cleanQDept = getFullDeptName(q.department);
    const cleanFilterDept = getFullDeptName(filterDept);
    
    const isDeptMatch = filterDept === "All" || cleanQDept === cleanFilterDept || cleanQDept.includes(cleanFilterDept) || cleanFilterDept.includes(cleanQDept);

    let isSenderMatch = true;
    if (filterSender === 'Student') {
        // A student either has a roll number or a semester (or both)
        isSenderMatch = (q.rollNumber !== 'N/A' || q.semester !== 'N/A') && q.studentName !== 'Admin';
    } else if (filterSender === 'Teacher') {
        // A teacher will have neither roll number nor semester
        isSenderMatch = q.rollNumber === 'N/A' && q.semester === 'N/A' && q.studentName !== 'Admin';
    }

    return isDeptMatch && isSenderMatch;
  });

  return (
    <div className="w-full max-w-[1200px]">
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
          <div className="bg-white p-4 sm:p-8 rounded-lg shadow-2xl max-w-sm mx-4 w-full text-center">
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
              value={replyTexts[replyModal.queryId] || ''}
              onChange={(e) => setReplyTexts({ ...replyTexts, [replyModal.queryId]: e.target.value })}
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

      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-lg border shadow-sm animate-fadeIn">
        {/* Custom Department Dropdown */}
        <div className="relative flex-1">
          <div 
            onClick={() => { setIsDeptOpen(!isDeptOpen); setIsSenderOpen(false); }}
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

        {/* Custom Sender Dropdown */}
        <div className="relative flex-1">
          <div 
            onClick={() => { setIsSenderOpen(!isSenderOpen); setIsDeptOpen(false); }}
            className="w-full p-4 bg-slate-50 rounded-lg font-bold border cursor-pointer flex justify-between items-center text-sm"
          >
            <span>{filterSender === "All" ? "All (Student/Teacher)" : filterSender}</span>
            <ChevronDown size={18} className={`transition-transform ${isSenderOpen ? 'rotate-180' : ''}`} />
          </div>
          {isSenderOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              {['All', 'Student', 'Teacher'].map(s => (
                <div 
                  key={s}
                  onClick={() => { setFilterSender(s); setIsSenderOpen(false); }}
                  className="p-3 hover:bg-slate-50 cursor-pointer text-sm font-bold border-b border-slate-50"
                >
                  {s === "All" ? "All (Student/Teacher)" : s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 animate-fadeIn">
          {filteredQueries.length === 0 ? (
             <p className="text-center text-slate-400 font-bold">No queries found.</p>
          ) : (
          filteredQueries.map((query) => (
            <div key={query._id} className="bg-white p-4 sm:p-8 rounded-lg sm:rounded-lg shadow-lg border border-slate-50 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shadow-inner">
                {query.studentName === 'Admin' ? <Shield size={32} /> : (query.recipient === 'admin' ? <User size={32} /> : <GraduationCap size={32} />)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-[#001f3f] text-lg uppercase tracking-tight">{query.subject}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase ${query.status === 'RESOLVED' || query.status === 'REPLIED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                      {query.status}
                    </span>
                    <button onClick={() => setModal({ isOpen: true, idToDelete: query._id })} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors" title="Delete Query">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-2 font-bold flex flex-wrap gap-2 items-center">
                  <span className="text-[#001f3f]">From: {query.studentName} {query.rollNumber !== 'N/A' && query.rollNumber !== 'Admin' && `(${query.rollNumber})`}</span>
                  {query.department !== 'N/A' && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest text-slate-600">{query.department}</span>
                    </>
                  )}
                  {query.semester !== 'N/A' && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest text-slate-600">Sem {query.semester}</span>
                    </>
                  )}
                </p>
                <p 
                  className="text-sm text-slate-500 font-medium leading-relaxed cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200 line-clamp-3"
                  onClick={() => setViewModal({ isOpen: true, query })}
                  title="Click to read full message"
                >
                  "{query.message}"
                </p>
                
                {/* Reply/Edit Section (Visible to Admin or Teacher) */}
                {(userRole === 'admin' || userRole === 'teacher') && query.studentName !== 'Admin' && (
                  <div className="mt-6">
                    <button 
                      onClick={() => {
                          setReplyTexts({ ...replyTexts, [query._id]: query.reply || '' });
                          setReplyModal({ isOpen: true, queryId: query._id });
                      }}
                      className="bg-[#001f3f] text-white px-8 py-3 rounded-lg font-black text-[10px] uppercase hover:bg-blue-900 transition-colors shadow-md flex items-center gap-2 w-fit"
                    >
                      {query.reply ? <><Edit2 size={14} /> Edit Reply</> : "Reply"}
                    </button>
                  </div>
                )}

                {/* History (Visible to Student/Teacher as response) */}
                {query.reply && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-[10px] font-black text-green-600 uppercase">Response:</p>
                    <p className="text-xs text-slate-600 mt-1 font-medium">"{query.reply}"</p>
                  </div>
                )}
              </div>
            </div>
          ))
          )}
        </div>
    </div>
  );
};

export default QuerySection;