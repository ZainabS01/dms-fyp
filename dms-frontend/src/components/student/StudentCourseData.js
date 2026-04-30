import React from 'react';

const CourseData = () => {
  const folders = [
    { name: 'Semester 8 - Notes', items: '12 Files', type: 'PDF' },
    { name: 'Lab Manuals', items: '5 Files', type: 'DOCX' },
    { name: 'Video Lectures', items: '8 Links', type: 'URL' },
    { name: 'Research Papers', items: '3 Files', type: 'PDF' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {folders.map((folder, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-100 group hover:border-blue-900 transition-all duration-300 cursor-pointer">
          <div className="w-14 h-14 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-[#002147] group-hover:text-white transition">
            📂
          </div>
          <h4 className="font-black text-[#002147] text-sm uppercase mb-1">{folder.name}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{folder.items} • {folder.type}</p>
          <button className="mt-4 text-[10px] font-black text-blue-600 hover:text-blue-900 uppercase tracking-widest">Open Folder →</button>
        </div>
      ))}
    </div>
  );
};

export default CourseData;