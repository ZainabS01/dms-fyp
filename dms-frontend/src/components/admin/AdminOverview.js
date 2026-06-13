import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminOverview = ({ setActiveTab }) => {
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/dashboard-stats');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  const overviewCards = [
    {
      id: 'student_management',
      title: 'TOTAL STUDENTS',
      desc: `${stats.totalStudents} ENROLLED STUDENTS`,
      icon: (
        <svg className="w-6 h-6 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-50'
    },
    {
      id: 'faculty_management',
      title: 'TOTAL TEACHERS',
      desc: `${stats.totalTeachers} ACTIVE TEACHERS`,
      icon: (
        <svg className="w-6 h-6 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      iconBg: 'bg-amber-50'
    },
    {
      id: 'teacher_verification',
      title: 'TEACHER VERIFY',
      desc: 'VERIFY NEW REGISTRATIONS',
      icon: (
        <svg className="w-6 h-6 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      iconBg: 'bg-green-50'
    },
    {
      id: 'queries',
      title: 'QUERIES',
      desc: 'MANAGE ALL QUERIES',
      icon: (
        <svg className="w-6 h-6 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      iconBg: 'bg-purple-50'
    },
    {
      id: 'attendance_oversight',
      title: 'ATTENDANCE',
      desc: 'OVERSIGHT & REPORTS',
      icon: (
        <svg className="w-6 h-6 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: 'bg-teal-50'
    },
    {
      id: 'notice_board',
      title: 'NOTICE BOARD',
      desc: 'MANAGE ANNOUNCEMENTS',
      icon: (
        <svg className="w-6 h-6 text-[#001f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      iconBg: 'bg-red-50'
    }
  ];

  return (
    <div className="w-full py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto p-2">
        {overviewCards.map((card) => (
          <div
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className="relative bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(212,160,23,0.12)] hover:-translate-y-2 transition-all duration-500 cursor-pointer group overflow-hidden"
          >
            {/* Top decorative line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4a017] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Glowing background blob */}
            <div className={`absolute -top-12 -right-12 w-40 h-40 ${card.iconBg} rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700`}></div>

            <div className="relative z-10 flex flex-col items-start text-left">
              <div className={`p-3 rounded-2xl ${card.iconBg} mb-4 shadow-sm border border-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                {card.icon}
              </div>

              <h3 className="text-xl font-black text-[#001f3f] tracking-tight mb-2 group-hover:text-[#d4a017] transition-colors duration-300">
                {card.title}
              </h3>

              <div className="h-1 w-10 bg-slate-100 rounded-full mb-3 group-hover:bg-[#d4a017] transition-colors duration-300"></div>

              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                {card.desc}
              </p>
            </div>
            
            {/* Bottom Arrow indicator */}
            <div className="absolute bottom-8 right-8 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
              <svg className="w-6 h-6 text-[#d4a017]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
