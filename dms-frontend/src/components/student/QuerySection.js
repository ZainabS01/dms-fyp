import React, { useState } from 'react';

const QuerySection = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' ya 'ask'

  return (
    <div className="w-full max-w-[1200px]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] uppercase italic">
            Query <span className="text-[#d4a017]">Hub</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            {userRole === 'admin' ? 'Manage System Queries' : 'Ask & Track Your Queries'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white p-2 rounded-2xl shadow-md">
          <button 
            onClick={() => setActiveTab('inbox')}
            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'inbox' ? 'bg-[#001f3f] text-white' : 'text-slate-400'}`}
          >
            📥 Inbox
          </button>
          {userRole !== 'admin' && (
            <button 
              onClick={() => setActiveTab('ask')}
              className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'ask' ? 'bg-[#d4a017] text-[#001f3f]' : 'text-slate-400'}`}
            >
              ✍️ Ask Query
            </button>
          )}
        </div>
      </div>

      {activeTab === 'ask' ? (
        /* FORM: For Students and Teachers to ask Admin or Faculty */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fadeIn">
          <div className="bg-[#001f3f] p-12 rounded-[50px] shadow-2xl relative overflow-hidden text-white">
            <h2 className="text-3xl font-black uppercase italic mb-8">Send a <span className="text-[#d4a017]">Message</span></h2>
            <div className="space-y-5 relative z-10">
              <select className="w-full p-5 bg-white/10 rounded-2xl border-none text-white outline-none">
                <option className='text-black'>Send To: Admin</option>
                {userRole === 'student' && <option className='text-black'>Send To: Faculty Member</option>}
              </select>
              <input type="text" placeholder="Subject / Topic" className="w-full p-5 bg-white/10 rounded-2xl border-none placeholder-white/50" />
              <textarea placeholder="Describe your issue in detail..." className="w-full p-5 bg-white/10 rounded-2xl border-none h-40"></textarea>
              <button className="w-full bg-[#d4a017] text-[#001f3f] py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-white transition-all">Submit Query</button>
            </div>
          </div>
          <div className="flex flex-col justify-center p-10 bg-white rounded-[50px] border border-slate-100 shadow-sm">
             <h3 className="text-xl font-black text-[#001f3f] uppercase mb-4">How it works?</h3>
             <ul className="space-y-4 text-sm text-slate-500 font-medium">
               <li className="flex gap-3">✅ <p>Your query is directed to the relevant department.</p></li>
               <li className="flex gap-3">✅ <p>Responses usually arrive within 24-48 hours.</p></li>
               <li className="flex gap-3">✅ <p>You will see the reply in your Inbox tab.</p></li>
             </ul>
          </div>
        </div>
      ) : (
        /* INBOX: For everyone to see replies, and for Admin/Teacher to reply */
        <div className="space-y-6 animate-fadeIn">
          {[1, 2].map((query) => (
            <div key={query} className="bg-white p-8 rounded-[40px] shadow-lg border border-slate-50 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                {userRole === 'student' ? '👨‍🏫' : '👤'}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-[#001f3f] text-lg uppercase tracking-tight">Issue with Semester Result</h4>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full uppercase">Pending</span>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  "Respected Sir, I have a concern regarding my marks in the mid-term exam..."
                </p>
                
                {/* Reply Section (Visible to Admin or Teacher) */}
                {(userRole === 'admin' || userRole === 'teacher') && (
                  <div className="mt-6 flex gap-3">
                    <input type="text" placeholder="Type your reply..." className="flex-1 p-4 bg-slate-50 rounded-xl text-sm border-none focus:ring-1 focus:ring-[#d4a017]" />
                    <button className="bg-[#001f3f] text-white px-8 rounded-xl font-black text-[10px] uppercase">Reply</button>
                  </div>
                )}

                {/* History (Visible to Student as response) */}
                {userRole === 'student' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-2xl border-l-4 border-green-500">
                    <p className="text-[10px] font-black text-green-600 uppercase">Response from Admin:</p>
                    <p className="text-xs text-slate-600 mt-1 italic font-medium">"Please visit the examination office with your roll no."</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuerySection;