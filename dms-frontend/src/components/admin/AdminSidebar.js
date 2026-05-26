import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiGrid, 
  FiUsers, 
  FiBookOpen, 
  FiCheckSquare, 
  FiBell, 
  FiLogOut, 
  FiShield, 
  FiHelpCircle 
} from 'react-icons/fi';

const AdminSidebar = ({ activeTab }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <FiGrid />, path: '/admin-dashboard' },
    { name: 'Students', icon: <FiUsers />, path: '/admin-dashboard/student-management' },
    { name: 'Faculty', icon: <FiBookOpen />, path: '/admin-dashboard/faculty-management' },
    { name: 'Teacher Verify', icon: <FiShield />, path: '/admin-dashboard/teacher-verification' }, 
    { name: 'Queries', icon: <FiHelpCircle />, path: '/admin-dashboard/queries' },
    { name: 'Attendance', icon: <FiCheckSquare />, path: '/admin-dashboard/attendance-oversight' },
    { name: 'Notices', icon: <FiBell />, path: '/admin-dashboard/notice-board' },
  ];

  return (
    <div className="w-72 bg-[#001f3f] h-screen text-white flex flex-col fixed left-0 top-0 shadow-2xl z-50">
      {/* Logo Section */}
      <div className="p-8 text-center border-b border-blue-900/50">
        <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#d4a017]">
          <img src="/logo.png" alt="DMS" className="w-10" />
        </div>
        <h2 className="text-lg font-black uppercase italic text-[#d4a017] tracking-widest">Admin Portal</h2>
      </div>

      {/* Navigation Links - Scrollable if items are many */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${
              activeTab === item.name 
              ? 'bg-[#d4a017] text-[#001f3f] shadow-lg scale-105' 
              : 'hover:bg-blue-900 text-slate-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span> {item.name}
          </button>
        ))}
      </nav>

      {/* Logout Button - Fixed at the bottom */}
      <div className="p-6 border-t border-blue-900/50 bg-[#001f3f]">
        <button 
          onClick={() => navigate('/login')} 
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-[0.2em]"
        >
          <FiLogOut className="text-xl" /> 
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;