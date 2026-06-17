import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

const QuerySection = ({ userRole, user }) => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [queries, setQueries] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState(userRole === 'admin' ? 'student' : 'admin');
  const [targetRollNo, setTargetRollNo] = useState(''); // For admin
  const [replyTexts, setReplyTexts] = useState({});
  const [modal, setModal] = useState({ isOpen: false, idToDelete: null });

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

  return (
    <div className="w-full max-w-[1200px]">
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-2xl max-w-sm mx-4 w-full text-center">
            <h3 className="text-xl font-black text-[#001f3f] mb-2">Delete Query?</h3>
            <p className="text-xs text-slate-500 font-bold mb-6">Are you sure you want to permanently delete this query?</p>
            <div className="flex gap-3">
              <button onClick={() => setModal({ isOpen: false, idToDelete: null })} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#001f3f] uppercase">
            Query <span className="text-[#d4a017]">Hub</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            {userRole === 'admin' ? 'Manage System Queries' : 'Ask & Track Your Queries'}
          </p>
        </div>
      </div>

      <div className="space-y-6 animate-fadeIn">
          {queries.length === 0 ? (
             <p className="text-center text-slate-400 font-bold">No queries found.</p>
          ) : (
          queries.map((query) => (
            <div key={query._id} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[40px] shadow-lg border border-slate-50 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                {query.studentName === 'Admin' ? '🛡️' : (query.recipient === 'admin' ? '👤' : '👨‍🏫')}
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
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  "{query.message}"
                </p>
                
                {/* Reply Section (Visible to Admin or Teacher if not resolved) */}
                {(userRole === 'admin' || userRole === 'teacher') && query.status !== 'RESOLVED' && query.studentName !== 'Admin' && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="Type your reply..." 
                      value={replyTexts[query._id] || ''}
                      onChange={(e) => setReplyTexts({ ...replyTexts, [query._id]: e.target.value })}
                      className="flex-1 p-4 bg-slate-50 rounded-xl text-sm border-none focus:ring-1 focus:ring-[#d4a017] w-full" 
                    />
                    <button 
                      onClick={() => handleReply(query._id)}
                      className="bg-[#001f3f] text-white px-8 py-4 sm:py-0 rounded-xl font-black text-[10px] uppercase hover:bg-blue-900 transition-colors w-full sm:w-auto"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {/* History (Visible to Student/Teacher as response) */}
                {query.reply && (
                  <div className="mt-4 p-4 bg-green-50 rounded-2xl border-l-4 border-green-500">
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