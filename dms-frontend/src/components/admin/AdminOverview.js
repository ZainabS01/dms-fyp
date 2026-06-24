import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#d4a017', '#001f3f', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminOverview = ({ setActiveTab }) => {
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, departmentStats: [] });
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/dashboard-stats`);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/query/all?role=admin&rollNumber=`);
        setQueries(res.data || []);
      } catch (err) {
        console.error("Failed to load queries");
      }
    };
    fetchQueries();
    const interval = setInterval(fetchQueries, 5000);
    return () => clearInterval(interval);
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
    }
  ];

  const formatDeptName = (name) => {
    if (!name) return '';
    const clean = name.replace(/^BS\s+/i, '').trim().toUpperCase();
    if (clean === 'COMPUTER SCIENCE') return 'CS';
    if (clean === 'SOFTWARE ENGINEERING') return 'SE';
    if (clean === 'INFORMATION TECHNOLOGY') return 'IT';
    if (clean === 'ARTIFICIAL INTELLIGENCE') return 'AI';
    if (clean === 'DATA SCIENCE') return 'DS';
    if (clean === 'CYBER SECURITY') return 'CYS';
    if (clean === 'BUSINESS ADMINISTRATION') return 'BBA';
    // If it's multiple words and not matched above, make an acronym
    if (clean.includes(' ')) {
      return clean.split(' ').map(w => w[0]).join('');
    }
    return clean;
  };

  return (
    <div className="w-full h-full flex flex-col max-w-[1600px] mx-auto gap-4 md:gap-6 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 shrink-0">
        {overviewCards.map((card) => (
          <div
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className="relative bg-white rounded-lg p-3 sm:p-4 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(212,160,23,0.12)] hover:-translate-y-1 transition-all duration-500 cursor-pointer group overflow-hidden flex items-center gap-3 md:gap-4"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#d4a017] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className={`absolute -top-8 -right-8 w-24 h-24 ${card.iconBg} rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700`}></div>
            
            <div className={`p-2 sm:p-3 rounded-lg ${card.iconBg} shadow-sm border border-white shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 z-10`}>
              {React.cloneElement(card.icon, { className: 'w-5 h-5 sm:w-6 sm:h-6 text-[#001f3f]' })}
            </div>
            
            <div className="relative z-10 flex flex-col items-start text-left flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-[#001f3f] tracking-tight group-hover:text-[#d4a017] transition-colors duration-300 truncate w-full">
                {card.title}
              </h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 tracking-widest uppercase truncate w-full mt-0.5">
                {card.desc}
              </p>
            </div>
            
            <div className="relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4a017]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0 pb-2">
        {/* Chart Section */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between mb-2 sm:mb-4 shrink-0">
            <h3 className="text-base sm:text-lg font-black text-[#001f3f] tracking-tight">DEPARTMENT-WISE STUDENTS</h3>
          </div>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.departmentStats || []}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="80%"
                  paddingAngle={5}
                  dataKey="students"
                  nameKey="name"
                  stroke="none"
                >
                  {(stats.departmentStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 600 }}
                  itemStyle={{ color: '#001f3f' }}
                  formatter={(value, name) => [value, "Students"]}
                  labelFormatter={(label) => label}
                />
                <Legend 
                  iconType="circle" 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value) => <span className="text-[#64748b] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">{formatDeptName(value)}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Queries Section */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full min-h-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100/[0.05] bg-[size:20px_20px]" />
          <div className="relative z-10 flex items-center justify-between mb-2 sm:mb-4 shrink-0 border-b border-slate-50 pb-2 sm:pb-4">
            <h3 className="text-base sm:text-lg font-black text-[#001f3f] tracking-tight flex items-center gap-2">
              LIVE QUERIES
              <span className="relative flex h-3 w-3 ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </h3>
            <button onClick={() => setActiveTab('queries')} className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 relative z-10 min-h-0">
            {queries.length > 0 ? queries.map(q => (
              <div 
                key={q._id} 
                onClick={() => setActiveTab('queries')}
                className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-lg cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-xs text-[#001f3f] uppercase line-clamp-1 flex-1 pr-2">{q.subject}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${q.status === 'RESOLVED' || q.status === 'REPLIED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{q.status}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  {q.studentName} {q.department !== 'N/A' && <span className="text-[#d4a017]">({q.department})</span>}
                </p>
                <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed bg-white p-2 rounded border border-slate-50">{q.message}</p>
              </div>
            )) : <p className="text-xs text-slate-400 font-bold text-center mt-10">No queries yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
