import React from 'react';

const Task = () => (
  <div className="space-y-4">
    <h3 className="text-xl font-black text-[#002147] mb-4">Current Assignments & Tasks</h3>
    {[
      { title: 'SQA Documentation', deadline: '20 April', status: 'Pending', color: 'bg-red-100 text-red-600' },
      { title: 'Information Security Quiz', deadline: '22 April', status: 'Upcoming', color: 'bg-blue-100 text-blue-600' },
    ].map((task, i) => (
      <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition">
        <div>
          <h4 className="font-bold text-slate-800">{task.title}</h4>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">Deadline: {task.deadline}</p>
        </div>
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${task.color}`}>{task.status}</span>
      </div>
    ))}
  </div>
);

export default Task;