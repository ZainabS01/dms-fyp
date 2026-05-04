import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiBookOpen, FiCheckSquare, FiBell, FiLogOut } from 'react-icons/fi';

const AdminSidebar = ({ activeTab }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <FiGrid />, path: '/admin-dashboard' },
    { name: 'Students', icon: <FiUsers />, path: '/admin/students' },
    { name: 'Faculty', icon: <FiBookOpen />, path: '/admin/faculty' },
    { name: 'Attendance', icon: <FiCheckSquare />, path: '/admin/attendance' },
    { name: 'Notices', icon: <FiBell />, path: '/admin/notices' },
  ];

  return (
    <div className="w-72 bg-[#001f3f] min-h-screen text-white flex flex-col fixed left-0 top-0 shadow-2xl">
      <div className="p-8 text-center border-b border-blue-900">
        <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#d4a017]">
          <img src="/logo.png" alt="DMS" className="w-10" />
        </div>
        <h2 className="text-lg font-black uppercase italic text-[#d4a017] tracking-widest">Admin Portal</h2>
      </div>

      <nav className="flex-1 p-6 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === item.name ? 'bg-[#d4a017] text-[#001f3f] shadow-lg' : 'hover:bg-blue-900 text-slate-400'
            }`}
          >
            {item.icon} {item.name}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-blue-900">
        <button onClick={() => navigate('/login')} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-xs text-red-400 hover:bg-red-500/10 transition-all">
          <FiLogOut /> LOGOUT
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;