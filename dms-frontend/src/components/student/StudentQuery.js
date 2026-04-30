import React from 'react';

const Query = () => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-2xl mx-auto">
    <h3 className="text-xl font-black text-[#002147] mb-6">Submit a Query / Complaint</h3>
    <form className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
        <input type="text" className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#EAB308] outline-none" placeholder="e.g. Attendance Issue" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase">Message</label>
        <textarea className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl h-32 outline-none" placeholder="Describe your issue..."></textarea>
      </div>
      <button className="w-full py-4 bg-[#002147] text-white rounded-2xl font-black hover:bg-blue-800 transition">SUBMIT QUERY</button>
    </form>
  </div>
);

export default Query;