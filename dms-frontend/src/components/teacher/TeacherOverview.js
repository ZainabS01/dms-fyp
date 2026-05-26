import React from 'react';

const TeacherOverview = ({ setActiveTab }) => {
  
  const overviewCards = [
    {
      id: 'attendance',
      title: 'ATTENDANCE',
      desc: 'MANAGE ATTENDANCE DETAILS',
      icon: (
        <svg className="w-8 h-8 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: 'bg-blue-50'
    },
    {
      id: 'tasks',
      title: 'TASKS',
      desc: 'MANAGE TASKS DETAILS',
      icon: (
        <svg className="w-8 h-8 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      iconBg: 'bg-amber-50'
    },
    {
      id: 'queries',
      title: 'QUERIES',
      desc: 'MANAGE QUERIES DETAILS',
      icon: (
        <svg className="w-8 h-8 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      iconBg: 'bg-purple-50'
    },
    {
      id: 'timetable',
      title: 'TIMETABLE',
      desc: 'MANAGE TIMETABLE DETAILS',
      icon: (
        <svg className="w-8 h-8 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-red-50'
    },
    {
      id: 'academic_data', // Linked directly to academic_data (StudentAcademicData)
      title: 'Academic Data',
      desc: 'MANAGE ACADEMIC DATA DETAILS',
      icon: (
        <svg className="w-8 h-8 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a２ ２ ０ ００２－２z" />
        </svg>
      ),
      iconBg: 'bg-green-50'
    },
    {
      id: 'attendance', // Linked directly to attendance dashboard applications section
      title: 'CHECK LEAVES',
      desc: 'MANAGE CHECK LEAVES DETAILS',
      icon: (
        <svg className="w-8 h-8 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2zm5-10V5a2 2 0 012-2h4a2 2 0 012 2v4" />
        </svg>
      ),
      iconBg: 'bg-teal-50'
    }
  ];

  return (
    <div className="w-full py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-[1600px] mx-auto">
        {overviewCards.map((card) => (
          <div
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center group"
          >
            <div className={`p-4 rounded-2xl ${card.iconBg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
              {card.icon}
            </div>

            <h3 className="text-xl font-black text-[#001f3f] tracking-tight mb-2 group-hover:text-[#d4a017] transition-colors">
              {card.title}
            </h3>

            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherOverview;