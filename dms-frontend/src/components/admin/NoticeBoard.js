import React from 'react';

const NoticeBoard = () => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
         <h1 className="text-4xl font-black text-[#001f3f] uppercase italic mb-10">Notice Board <span className="text-[#d4a017]">Control</span></h1>
         <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-50">
            <h3 className="text-xl font-black text-[#001f3f] uppercase mb-6">Create New Announcement</h3>
            <div className="space-y-6">
              <input type="text" placeholder="Notice Title..." className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#d4a017]" />
              <textarea placeholder="Write full announcement here..." className="w-full p-5 bg-slate-50 rounded-2xl border-none h-40 focus:ring-2 focus:ring-[#d4a017]"></textarea>
              <button className="w-full bg-[#001f3f] text-[#d4a017] py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg">Post Notice</button>
            </div>
         </div>
      </div>
      <div>
         <h3 className="text-xl font-black text-[#001f3f] uppercase mb-8">Recent History</h3>
         <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white p-6 rounded-[30px] shadow-lg border-r-[8px] border-[#d4a017]">
                <span className="text-[10px] font-black text-blue-500 uppercase">To: All Students</span>
                <h4 className="font-black text-[#001f3f] mt-2 leading-tight uppercase">Semester Break Official Notification</h4>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">The university will remain closed from next week due to...</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default NoticeBoard;