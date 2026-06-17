import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { FiTrash2, FiEdit2, FiX, FiDownload } from 'react-icons/fi';

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
  const [targetTeacherId, setTargetTeacherId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Modal States
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [editModal, setEditModal] = useState({ show: false, data: null });

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

  const confirmDelete = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/attendance/leave/${deleteModal.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Leave request deleted!");
      fetchLeaveHistory();
      setDeleteModal({ show: false, id: null });
    } catch (error) {
      toast.error("Failed to delete request");
      console.log(error);
    }
  };

  const handleEditSubmit = async () => {
    if (!editModal.data.subject || !editModal.data.reason || !editModal.data.startDate || !editModal.data.endDate) {
      return toast.error("Please fill all fields!");
    }
    try {
      await axios.put(`${BACKEND_URL}/api/attendance/leave/${editModal.data._id}`, {
        subject: editModal.data.subject,
        reason: editModal.data.reason,
        startDate: editModal.data.startDate,
        endDate: editModal.data.endDate
      }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      
      toast.success("Leave request updated!");
      fetchLeaveHistory();
      setEditModal({ show: false, data: null });
    } catch (error) {
      toast.error("Failed to update application");
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchLeaveHistory();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/all-teachers`);
      if (res.data.success) {
        setTeachers(res.data.teachers);
        
        const myDeptTeachers = res.data.teachers.filter(t => t.department?.toLowerCase() === user?.department?.toLowerCase());
        if (myDeptTeachers.length > 0) {
          setTargetTeacherId(myDeptTeachers[0]._id);
        } else if (res.data.teachers.length > 0) {
          setTargetTeacherId(res.data.teachers[0]._id);
        }
      }
    } catch (error) {
      console.error("Could not fetch teachers");
    }
  };

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
        targetTeacherId,
        status: "PENDING"
      }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      
      toast.success("Application Submitted!");
      setSubject(""); setReason(""); setStartDate(""); setEndDate(""); setTargetTeacherId(teachers.length > 0 ? teachers[0]._id : "");
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
    let sortedData = [...dailyAttendance].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    
    if (filter === 'daily') {
        const todayStr = today.toISOString().split('T')[0];
        return sortedData.filter(log => log.date === todayStr);
    }
    
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

    // Theme Borders
    doc.setDrawColor(0, 31, 63); // Navy Blue
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);
    doc.setDrawColor(212, 160, 23); // Gold
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 186, 273);

    // Header Banner
    doc.setFillColor(0, 31, 63);
    doc.rect(12, 12, 186, 25, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(`ATTENDANCE REPORT (${filter.toUpperCase()})`, 105, 29, { align: "center" });

    // Reset Color
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 46);
    if (user) {
        doc.text(`Student: ${user.name} | Roll No: ${user.rollNo || user.rollno}`, 14, 52);
    }

    autoTable(doc, { 
        startY: 58,
        headStyles: { fillColor: [0, 31, 63], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
        head: [['Date', 'Status']], 
        body: filteredData.map(d => [
            d.date, 
            d.records?.find(r => r.studentId === currentStudentId)?.status || "N/A"
        ]) 
    });
    doc.save(`Attendance_Report_${filter}.pdf`);
  };

  const downloadLeavePDF = (application) => {
    const doc = new jsPDF();
    
    // Theme Borders
    doc.setDrawColor(0, 31, 63); // Navy Blue
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);
    doc.setDrawColor(212, 160, 23); // Gold
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 186, 273);

    // Header Banner
    doc.setFillColor(0, 31, 63);
    doc.rect(12, 12, 186, 25, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("OFFICIAL LEAVE APPLICATION", 105, 29, { align: "center" });

    // Reset Color
    doc.setTextColor(0, 0, 0);
    
    // To Section
    doc.setFontSize(14);
    doc.text("To,", 20, 55);
    doc.text("The Class Incharge / Head of Department,", 20, 63);
    doc.text(`Department of ${user?.department || 'N/A'},`, 20, 71);
    doc.text("University of the Punjab.", 20, 79);

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 55);

    // Subject
    doc.setFont("helvetica", "bold");
    doc.text(`Subject: ${application.subject}`, 20, 100);
    doc.setDrawColor(0, 31, 63);
    doc.setLineWidth(0.5);
    doc.line(20, 102, 190, 102);

    // Salutation & Body
    doc.setFont("helvetica", "bold");
    doc.text("Respected Sir/Madam,", 20, 115);
    
    doc.setFont("helvetica", "normal");
    const reasonText = doc.splitTextToSize(application.reason, 170);
    doc.text(reasonText, 20, 125);

    // Duration statement
    const currentY = 125 + (reasonText.length * 7);
    doc.text(`Kindly grant me leave from ${application.startDate} to ${application.endDate}.`, 20, currentY + 10);

    // Closing
    doc.setFont("helvetica", "bold");
    doc.text("Yours obediently,", 140, currentY + 40);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${user?.name || "N/A"}`, 140, currentY + 50);
    doc.text(`Roll No: ${user?.rollNo || user?.rollno || "N/A"}`, 140, currentY + 58);
    doc.text(`Semester: ${user?.semester || "N/A"}`, 140, currentY + 66);
    
    // Status Stamp
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    if (application.status === 'APPROVED') doc.setTextColor(0, 128, 0);
    else if (application.status === 'REJECTED') doc.setTextColor(255, 0, 0);
    else doc.setTextColor(212, 160, 23);
    
    // Draw Status Box
    doc.setDrawColor(application.status === 'APPROVED' ? 0 : application.status === 'REJECTED' ? 255 : 212, 
                     application.status === 'APPROVED' ? 128 : 0, 
                     application.status === 'APPROVED' ? 0 : application.status === 'REJECTED' ? 0 : 23);
    doc.setLineWidth(1);
    doc.rect(20, currentY + 50, 60, 15);
    doc.text(`STATUS: ${application.status}`, 25, currentY + 60);

    doc.save(`Leave_Application_${application._id.slice(-5)}.pdf`);
  };

  const attendanceStats = filteredData.reduce((acc, log) => {
    const status = log.records?.find(r => r.studentId === currentStudentId)?.status || "N/A";
    if (status === 'PRESENT') acc.present++;
    if (status === 'ABSENT') acc.absent++;
    if (status === 'LATE') acc.late++;
    if (status === 'LEAVE') acc.leave++;
    return acc;
  }, { present: 0, absent: 0, late: 0, leave: 0 });

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
                <option value="daily">Daily (Today)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="all">All Time</option>
            </select>
          </div>
          <button onClick={downloadReport} className="bg-green-600 hover:bg-green-700 transition-colors text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-green-200 w-full sm:w-auto flex items-center justify-center gap-2">
            <FiDownload /> Download {filter.charAt(0).toUpperCase() + filter.slice(1)} Log
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex flex-col justify-center items-center">
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Present</span>
            <span className="text-3xl font-black text-green-700">{attendanceStats.present}</span>
          </div>
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col justify-center items-center">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Absent</span>
            <span className="text-3xl font-black text-red-700">{attendanceStats.absent}</span>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex flex-col justify-center items-center">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Late</span>
            <span className="text-3xl font-black text-amber-700">{attendanceStats.late}</span>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col justify-center items-center">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Leave</span>
            <span className="text-3xl font-black text-blue-700">{attendanceStats.leave}</span>
          </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className="p-3.5 bg-slate-100 text-slate-500 rounded-xl border border-slate-200 cursor-not-allowed text-sm font-bold" value={user?.name || ''} readOnly />
                <input className="p-3.5 bg-slate-100 text-slate-500 rounded-xl border border-slate-200 cursor-not-allowed text-sm font-bold" value={user?.rollNo || user?.rollno || ''} readOnly />
                <input className="p-3.5 bg-slate-100 text-slate-500 rounded-xl border border-slate-200 cursor-not-allowed text-sm font-bold" value={user?.department || 'N/A'} readOnly />
                <input className="p-3.5 bg-slate-100 text-slate-500 rounded-xl border border-slate-200 cursor-not-allowed text-sm font-bold" value={`Semester: ${user?.semester || 'N/A'}`} readOnly />
              </div>
              <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-4 rounded-xl border" />
              <textarea placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-4 rounded-xl border" rows="3"></textarea>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-1/2 p-2 border rounded-xl" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-1/2 p-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-[#001f3f] font-bold text-sm mb-2 uppercase tracking-wide">Select Teacher</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#d4a017]/30 transition-all"
                  value={targetTeacherId}
                  onChange={(e) => setTargetTeacherId(e.target.value)}
                  required
                >
                  {teachers.length === 0 ? (
                    <option value="" disabled>No teachers found</option>
                  ) : (
                    <>
                      <optgroup label="My Department">
                        {teachers.filter(t => t.department?.toLowerCase() === JSON.parse(localStorage.getItem('user'))?.department?.toLowerCase()).map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Other Departments">
                        {teachers.filter(t => t.department?.toLowerCase() !== JSON.parse(localStorage.getItem('user'))?.department?.toLowerCase()).map(t => (
                          <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                        ))}
                      </optgroup>
                    </>
                  )}
                </select>
              </div>
              <div className="flex gap-4">
                <button onClick={submitApplication} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Submit</button>
                <button onClick={() => setShowAppForm(false)} className="bg-slate-200 px-6 py-2 rounded-lg font-bold">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-[2rem] shadow-xl border border-slate-100">
          <h3 className="text-xl font-black text-[#002147] mb-4">Status & History</h3>
          <div className="space-y-3">
            {leaveHistory.map((h) => (
              <div key={h._id} className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 rounded-xl border transition-all hover:shadow-md">
                <span className="text-xs sm:text-sm font-bold text-slate-600 truncate max-w-[50%] sm:max-w-none">{h.subject}</span>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <span className={`text-[9px] sm:text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${h.status === 'APPROVED' ? 'bg-green-100 text-green-600' : h.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {h.status}
                  </span>
                  <button 
                    onClick={() => downloadLeavePDF(h)}
                    className="p-1.5 sm:p-2 bg-[#001f3f]/10 text-[#001f3f] rounded-lg hover:bg-[#001f3f] hover:text-white transition-colors"
                    title="Download PDF"
                  >
                    <FiDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    onClick={() => setEditModal({ show: true, data: h })}
                    className="p-1.5 sm:p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                    title="Edit Request"
                  >
                    <FiEdit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteModal({ show: true, id: h._id })}
                    className="p-1.5 sm:p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                    title="Delete Request"
                  >
                    <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
            {leaveHistory.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No leave history found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Custom Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-center text-gray-900 mb-2">Delete Request?</h3>
            <p className="text-gray-500 text-sm text-center mb-8">Are you sure you want to delete this leave request? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ show: false, id: null })} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Edit Modal */}
      {editModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300 relative">
            <button onClick={() => setEditModal({ show: false, data: null })} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
              <FiX className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-[#002147] mb-6 flex items-center gap-2">
              <FiEdit2 className="text-blue-500" /> Edit Leave Request
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Subject</label>
                <input type="text" value={editModal.data.subject} onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, subject: e.target.value } })} className="w-full p-3.5 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Reason</label>
                <textarea value={editModal.data.reason} onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, reason: e.target.value } })} className="w-full p-3.5 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-colors" rows="3"></textarea>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Start</label>
                  <input type="date" value={editModal.data.startDate} onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, startDate: e.target.value } })} className="w-full p-3.5 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">End</label>
                  <input type="date" value={editModal.data.endDate} onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, endDate: e.target.value } })} className="w-full p-3.5 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-colors" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setEditModal({ show: false, data: null })} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleEditSubmit} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Attendance;