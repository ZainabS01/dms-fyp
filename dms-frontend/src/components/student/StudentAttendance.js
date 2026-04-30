import React from 'react';

const Attendance = () => {
  const attendanceData = [
    { subject: 'Theory of Programming Languages', total: 40, present: 36, percentage: '90%' },
    { subject: 'Software Quality Assurance', total: 35, present: 30, percentage: '85.7%' },
    { subject: 'Information Security', total: 38, present: 32, percentage: '84.2%' },
    { subject: 'Web Engineering', total: 42, present: 35, percentage: '83.3%' },
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Progress Circle (Inspired by your image) */}
        <div className="w-full lg:w-1/3 flex flex-col items-center p-8 bg-blue-50 rounded-[2rem] border-2 border-dashed border-blue-200">
          <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-[15px] border-[#002147] border-t-transparent shadow-md">
            <span className="text-3xl font-black text-[#002147]">82.5%</span>
          </div>
          <p className="mt-6 font-black text-[#002147] text-sm uppercase tracking-widest">Overall Presence</p>
        </div>

        {/* Table Section */}
        <div className="w-full lg:w-2/3 overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#002147] text-white">
              <tr className="text-[10px] uppercase tracking-widest">
                <th className="p-5 font-bold">Subject</th>
                <th className="p-5 text-center font-bold">Total</th>
                <th className="p-5 text-center font-bold text-green-400">Present</th>
                <th className="p-5 text-center font-bold">Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendanceData.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/50 transition duration-300">
                  <td className="p-5 text-sm font-bold text-slate-700">{row.subject}</td>
                  <td className="p-5 text-center font-mono text-slate-500">{row.total}</td>
                  <td className="p-5 text-center font-mono text-green-600 font-bold">{row.present}</td>
                  <td className="p-5 text-center">
                    <span className="bg-[#002147] text-[#EAB308] px-3 py-1 rounded-full text-[10px] font-black">{row.percentage}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;