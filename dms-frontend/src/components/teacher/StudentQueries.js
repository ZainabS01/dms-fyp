import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentQueries = () => {
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Mock Data
  const queries = [
    { id: 1, student: 'Zohaib Khan', rollNo: '123456', subject: 'Assignment Issue', status: 'Pending', date: '22-04-2026' },
    { id: 2, student: 'Ayesha Ali', rollNo: '654321', subject: 'Leave Request', status: 'Replied', date: '20-04-2026' },
  ];

  return (
    <div className="bg-white p-6 rounded-[35px] shadow-xl border-b-[6px] border-[#001f3f] min-h-[70vh]">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-[#001f3f] uppercase italic">Student Queries</h2>
        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Respond to student concerns and feedback</p>
      </div>

      <div className="grid gap-4">
        {queries.map((q) => (
          <div key={q.id} className="border-2 border-[#f1f3f6] p-5 rounded-3xl flex justify-between items-center hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#001f3f] text-white rounded-full flex items-center justify-center font-black">
                {q.student.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-[#001f3f] uppercase text-sm">{q.student} <span className="text-[10px] text-slate-400 font-bold ml-2">({q.rollNo})</span></h4>
                <p className="text-xs font-bold text-slate-500 italic">Subject: {q.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${q.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {q.status}
              </span>
              <button 
                onClick={() => setSelectedQuery(q)}
                className="bg-[#001f3f] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#d4a017] transition-all"
              >
                View & Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {selectedQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl border-[10px] border-white"
            >
              <div className="bg-[#001f3f] p-6 text-white text-center">
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Reply to Student</h3>
                <p className="text-[10px] text-blue-200 uppercase font-bold mt-1">{selectedQuery.student} - {selectedQuery.rollNo}</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-[#d4a017]">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Student Message:</p>
                  <p className="text-sm font-bold text-[#001f3f]">Sir, I am unable to submit my project due to portal error.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#001f3f] ml-1">Your Reply</label>
                  <textarea 
                    rows="4"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-4 border-2 border-[#001f3f]/10 rounded-2xl outline-none focus:border-[#001f3f] font-bold text-sm bg-slate-50"
                    placeholder="TYPE YOUR RESPONSE HERE..."
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setSelectedQuery(null)} className="flex-1 py-3 border-2 border-[#001f3f] text-[#001f3f] rounded-2xl font-black uppercase text-xs">Cancel</button>
                  <button className="flex-1 py-3 bg-[#001f3f] text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-[#d4a017]">Send Reply</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentQueries;