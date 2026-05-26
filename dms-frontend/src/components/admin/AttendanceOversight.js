import React from 'react';

const AttendanceOversight = () => {
  const stats = [
    { label: "Average Presence", value: "94%", color: "text-green-500", icon: "✔️" },
    { label: "Total Absentees", value: "42", color: "text-red-500", icon: "❌" },
    { label: "Faculty Present", value: "28/32", color: "text-[#d4a017]", icon: "📊" }
  ];

  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-[#001f3f] uppercase italic mb-10">Attendance <span className="text-[#d4a017]">Oversight</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] shadow-xl flex items-center justify-between border border-slate-50">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
              <h2 className={`text-4xl font-black mt-2 ${s.color}`}>{s.value}</h2>
            </div>
            <span className="text-3xl">{s.icon}</span>
          </div>
        ))}
      </div>
      <div className="bg-[#001f3f] h-80 rounded-[50px] p-12 shadow-2xl flex items-end">
         <h2 className="text-3xl font-black text-white uppercase italic">Recent Attendance Trends</h2>
      </div>
    </div>
  );
};

export default AttendanceOversight;