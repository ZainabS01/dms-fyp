import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, BrainCircuit } from 'lucide-react';
import Sidebar from './StudentSidebar';
import Overview from './StudentOverview';
import Attendance from './StudentAttendance';
import Query from './StudentQuery';
import Task from './StudentTask';
import Result from './StudentResult';
import CourseData from './StudentCourseData';

const StudentDashboard = ({ user, setUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // 1. Initial State from localStorage or Props
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : user;
    } catch (e) {
      return user;
    }
  });

  // 2. FRESH DATA FETCHING (Database se latest data mangwane ke liye)
  useEffect(() => {
    const fetchFreshUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Backend ke /me route se fresh data lein
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'x-auth-token': token }
        });

        if (res.data.success) {
          const freshUser = res.data.user;
          setCurrentUser(freshUser);
          if (setUser) setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          console.log("Dashboard Synced with Database:", freshUser);
        }
      } catch (err) {
        console.error("Could not sync user data:", err);
      }
    };

    fetchFreshUserData();
  }, [setUser]);

  // Keep state in sync if props change
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  // 3. Profile Update Function
  const handleUpdateProfile = async (updatedFields) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/users/update/${currentUser._id}`, updatedFields);
      
      if (res.data.success) {
        const updatedUser = res.data.user; 
        setCurrentUser(updatedUser);
        if (setUser) setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Update failed:", err);
      const fallbackUser = { ...currentUser, ...updatedFields };
      setCurrentUser(fallbackUser);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear(); 
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <p className="text-[#002147] font-bold animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  // Helper to get nested values
  const getVal = (field) => currentUser?.[field] || currentUser?.user?.[field] || "N/A";

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#002147]/60 backdrop-blur-md px-4">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">👋</div>
            <h3 className="text-2xl font-black text-[#002147] mb-3 uppercase tracking-tighter">Sign Out?</h3>
            <p className="text-slate-500 text-sm font-medium mb-10">Kiya aap waqai session khatam karna chahte hain?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogout} className="w-full py-4 bg-[#e11d48] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all">
                Yes, Sign Out
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full py-4 rounded-2xl font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar 
        activePage={activeTab} 
        setActivePage={setActiveTab} 
        onLogoutTrigger={() => setShowLogoutModal(true)} 
      />

      <main className="flex-1 lg:ml-72 h-full overflow-y-auto p-6 md:p-10 lg:p-12 custom-scrollbar">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 sticky top-0 z-10 backdrop-blur-sm bg-white/80 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-black text-[#002147] uppercase tracking-tighter">
              {activeTab} <span className="text-yellow-500">.</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-400 mr-4 border-r pr-6 border-slate-200">
                <Bell size={22} className="cursor-pointer hover:text-[#002147] transition-colors" />
                <BrainCircuit size={22} className="cursor-pointer hover:text-yellow-500 transition-colors" />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-black text-slate-800 leading-none mb-1">{getVal('name')}</p>
                <p className="text-[10px] font-bold text-blue-600 tracking-tighter uppercase">{getVal('rollNo') !== "N/A" ? getVal('rollNo') : "Student"}</p>
              </div>
              <div className="w-12 h-12 bg-[#002147] rounded-2xl rotate-3 flex items-center justify-center text-white font-black shadow-lg">
                {(getVal('name').charAt(0)).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="pb-10">
          {activeTab === 'overview' && (
            <Overview 
              user={currentUser} 
              onUpdate={handleUpdateProfile} 
            />
          )}
          {activeTab === 'attendance' && <Attendance />}
          {activeTab === 'task' && <Task />}
          {activeTab === 'result' && <Result user={currentUser} />}
          {activeTab === 'query' && <Query />}
          {activeTab === 'data' && <CourseData />}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;