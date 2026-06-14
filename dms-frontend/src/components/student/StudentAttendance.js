import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const Attendance = () => {
  const [showAppForm, setShowAppForm] = useState(false);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  
  // New fields required according to the model
  const [subject, setSubject] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const BACKEND_URL = `${process.env.REACT_APP_API_URL}`;

  const fetchAttendance = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?._id) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/attendance/my-attendance?studentId=${user._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if(response.data) setDailyAttendance(response.data);
    } catch (error) { console.log("Fetch Error:", error); }
  };

  const fetchLeaveHistory = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?._id) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/attendance/leave-history/${user._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setLeaveHistory(response.data);
    } catch (error) { console.log("History fetch error"); }
  };

  useEffect(() => {
    fetchAttendance();
    fetchLeaveHistory();
  }, []);

  // --- UPDATED SUBMIT LOGIC (According to the model) ---
  const submitApplication = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!subject || !reason || !startDate || !endDate) {
        return toast.error("Please fill all fields!");
    }
    try {
      await axios.post(`${BACKEND_URL}/api/attendance/submit-leave`, {
        studentId: user._id,
        subject,
        reason,
        startDate,
        endDate,
        status: "PENDING"
      }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      
      toast.success("Application Submitted!");
      setSubject(""); setReason(""); setStartDate(""); setEndDate("");
      setShowAppForm(false);
      fetchLeaveHistory();
    } catch (error) {
      toast.error("Failed to submit application");
    }
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const currentStudentId = user?._id;

  const getFilteredAttendance = () => {
    if (!dailyAttendance) return [];
    
    const sortedData = [...dailyAttendance].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    
    if (filter === 'weekly') {
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        return sortedData.filter(log => new Date(log.date) >= lastWeek);
    }
    
    if (filter === 'monthly') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return sortedData.filter(log => new Date(log.date) >= lastMonth);
    }
    
    return sortedData;
  };

  const filteredData = getFilteredAttendance();

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.text(`Attendance Report (${filter.toUpperCase()})`, 20, 10);
    autoTable(doc, { 
        head: [['Date', 'Status']], 
        body: filteredData.map(d => [
            d.date, 
            d.records?.find(r => r.studentId === currentStudentId)?.status || "N/A"
        ]) 
    });
    doc.save(`Attendance_Report_${filter}.pdf`);
  };

  return (
    <div className="space-y-8 p-2 sm:p-6">
      <ToastContainer />
      
      {/* Attendance Log Table */}
      <div className="bg-white p-4 sm:p-8 rounded-[2rem] shadow-xl border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <h3 className="text-xl font-black text-[#002147]">Attendance Log</h3>
            <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border-2 border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#002147] outline-none focus:border-[#002147] w-full sm:w-auto"
            >
                <option value="all">All Time</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
            </select>
          </div>
          <button onClick={downloadReport} className="bg-green-600 hover:bg-green-700 transition-colors text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-green-200 w-full sm:w-auto">
            Download {filter === 'all' ? 'All' : filter === 'weekly' ? 'Weekly' : 'Monthly'} Log
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-[#002147] text-white text-[10px] uppercase">
              <tr><th className="p-4">Date</th><th className="p-4 text-center">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
             {filteredData.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-700">{log.date}</td>
                    <td className="p-4 text-center">
                      {(() => {
                        const status = log.records.find(r => r.studentId === currentStudentId)?.status || "N/A";
                        return (
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                            status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                            status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                            status === 'LATE' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {status}
                          </span>
                        );
                      })()}
                    </td>
                </tr>
            ))}
            {filteredData.length === 0 && (
                <tr>
                    <td colSpan="2" className="p-8 text-center text-slate-500 font-semibold">No attendance records found for this period.</td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Management & History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-8 rounded-[2rem] shadow-xl border border-slate-100">
          <h3 className="text-xl font-black text-[#002147] mb-4">Leave Management</h3>
          {!showAppForm ? (
            <button onClick={() => setShowAppForm(true)} className="bg-[#002147] text-white px-6 py-3 rounded-2xl font-bold">+ Request Leave</button>
          ) : (
            <div className="space-y-4">
              <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-4 rounded-xl border" />
              <textarea placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-4 rounded-xl border" rows="3"></textarea>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-1/2 p-2 border rounded-xl" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-1/2 p-2 border rounded-xl" />
              </div>
              <div className="flex gap-4">
                <button onClick={submitApplication} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Submit</button>
                <button onClick={() => setShowAppForm(false)} className="bg-slate-200 px-6 py-2 rounded-lg font-bold">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
          <h3 className="text-xl font-black text-[#002147] mb-4">Status & History</h3>
          <div className="space-y-3">
            {leaveHistory.map((h, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border">
                <span className="text-xs font-bold text-slate-600">{h.subject}</span>
                <span className={`text-[10px] font-black px-2 py-1 rounded ${h.status === 'APPROVED' ? 'bg-green-100 text-green-600' : h.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;