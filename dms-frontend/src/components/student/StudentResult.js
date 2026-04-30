import React from 'react';

const Result = () => {
  const results = [
    { code: 'SC-341', title: 'Theory of Programming Languages', cr: '3.0', grade: 'A', points: '4.00' },
    { code: 'SQ-302', title: 'Software Quality Assurance', cr: '3.0', grade: 'B+', points: '3.33' },
    { code: 'CC-413', title: 'Information Security', cr: '3.0', grade: 'A-', points: '3.67' },
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-8 px-2">
        <h3 className="text-xl font-black text-[#002147] uppercase tracking-tighter">Academic Transcript / Semester 8</h3>
        <button className="bg-[#EAB308] text-[#002147] px-5 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:scale-105 transition">Download PDF</button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
        <table className="w-full text-center">
          <thead className="bg-slate-50 border-b">
            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <th className="p-5">Code</th>
              <th className="p-5 text-left">Course Title</th>
              <th className="p-5">Cr.Hr</th>
              <th className="p-5">Grade</th>
              <th className="p-5 text-[#002147]">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {results.map((res, i) => (
              <tr key={i} className="hover:bg-amber-50/30 transition">
                <td className="p-5 font-mono text-slate-500">{res.code}</td>
                <td className="p-5 text-left font-bold text-slate-700">{res.title}</td>
                <td className="p-5 font-bold text-slate-400">{res.cr}</td>
                <td className="p-5"><span className="bg-[#002147] text-[#EAB308] w-10 h-10 flex items-center justify-center rounded-lg mx-auto font-black italic">{res.grade}</span></td>
                <td className="p-5 font-black text-slate-800">{res.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end p-2">
        <div className="bg-[#002147] text-white px-8 py-4 rounded-3xl flex items-center gap-6 shadow-2xl ring-8 ring-blue-50">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Current CGPA</span>
          <span className="text-3xl font-black italic text-[#EAB308]">3.82</span>
        </div>
      </div>
    </div>
  );
};

export default Result;