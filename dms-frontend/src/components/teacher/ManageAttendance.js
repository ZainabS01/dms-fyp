import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DEPARTMENTS_LIST, SEMESTERS_LIST } from '../../constants/data';

const ManageAttendance = () => {
  const [view, setView] = useState('menu'); // views: 'menu', 'mark', 'history', 'applications'
  const [students, setStudents] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedDepartment, setSelectedDepartment] = useState('BS COMPUTER SCIENCE');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // History States
  const [reportSubTab, setReportSubTab] = useState('daily'); 
  const [historySheets, setHistorySheets] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedSheetId, setExpandedSheetId] = useState(null);

  // Leave Applications States
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [remarks, setRemarks] = useState({});

  const BACKEND_URL = `${process.env.REACT_APP_API_URL}`;

  const departmentsList = DEPARTMENTS_LIST;
  const semestersList = SEMESTERS_LIST;

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const fetchStudentsForMarking = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/attendance/fetch-students?department=${encodeURIComponent(selectedDepartment.trim())}&semester=${encodeURIComponent(selectedSemester.trim())}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success && response.data.students) {
        setStudents(response.data.students.map(s => ({ ...s, status: 'PRESENT' })));
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching real students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    setHistoryLoading(true);
    const token = localStorage.getItem('token');
    const today = new Date();
    
    let startDate = getTodayDateString();
    let endDate = getTodayDateString();

    if (reportSubTab === 'weekly') {
      const currentDay = today.getDay(); 
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay; 
      const monday = new Date(today.setDate(today.getDate() + distanceToMonday));
      const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      startDate = monday.toISOString().split('T')[0];
      endDate = sunday.toISOString().split('T')[0];
    } else if (reportSubTab === 'monthly') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/attendance/report?department=${encodeURIComponent(selectedDepartment.trim())}&semester=${encodeURIComponent(selectedSemester.trim())}&startDate=${startDate}&endDate=${endDate}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success && response.data.attendanceData) {
        setHistorySheets(response.data.attendanceData);
      } else {
        setHistorySheets([]);
      }
    } catch (err) {
      console.error("History data sync error:", err);
      setHistorySheets([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchLeaveApplications = async () => {
    setAppLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/applications/teacher/view-all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'mark') fetchStudentsForMarking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester, selectedDepartment, view]);

  useEffect(() => {
    if (view === 'history') {
      fetchAttendanceHistory();
      setExpandedSheetId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester, selectedDepartment, view, reportSubTab]);

  useEffect(() => {
    if (view === 'applications') fetchLeaveApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const handleStatusChange = (id, newStatus) => {
    setStudents(prev => prev.map(s => s._id === id ? { ...s, status: newStatus } : s));
  };

  const handleSubmitAttendance = async () => {
    if (students.length === 0) return;
    const token = localStorage.getItem('token');

    const attendancePayload = {
      department: selectedDepartment.trim(),
      semester: selectedSemester.trim(),
      date: getTodayDateString(),
      records: students.map(s => ({
        studentId: s._id,
        status: s.status || 'PRESENT'
      }))
    };

    try {
      setMessage({ type: '', text: '' });
      const response = await axios.post(
        `${BACKEND_URL}/api/attendance/submit`, 
        attendancePayload,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Attendance successfully saved!' });
        setTimeout(() => {
          setView('history');
          setMessage({ type: '', text: '' });
        }, 1200);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save attendance inside database.' });
    }
  };

  const handleApplicationStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const currentRemarks = remarks[id] || "Processed by Class Incharge";

      const response = await axios.put(`${BACKEND_URL}/api/applications/status-update/${id}`, {
        status: newStatus,
        teacherRemarks: currentRemarks
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: `Application successfully ${newStatus.toLowerCase()}!` });
        fetchLeaveApplications();
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const downloadReportPDF = (sheet) => {
    const doc = new jsPDF();
    const dayName = getDayName(sheet.date);
    
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
    doc.text("ATTENDANCE REPORT", 105, 29, { align: "center" });
    
    // Reset Color
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Department: ${sheet.department}`, 14, 46);
    doc.text(`Date: ${sheet.date} (${dayName})`, 14, 52);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 140, 46);

    const headers = [["Roll No", "Student Name", "Status"]];
    const rows = sheet.records.map(r => [
      r.studentId?.rollNo || "N/A",
      r.studentId?.name ? r.studentId.name.toUpperCase() : "N/A",
      r.status
    ]);
    autoTable(doc, { 
      startY: 58, 
      headStyles: { fillColor: [0, 31, 63], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
      head: headers, 
      body: rows 
    });
    doc.save(`Attendance_${sheet.date}.pdf`);
  };

const downloadApplicationPDF = (application) => {
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
    doc.text(`Department of ${application.studentId?.department || 'N/A'},`, 20, 71);
    doc.text("University of the Punjab.", 20, 79);

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(application.createdAt || Date.now()).toLocaleDateString()}`, 140, 55);

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
    doc.text(`Name: ${application.studentId?.name || "N/A"}`, 140, currentY + 50);
    doc.text(`Roll No: ${application.studentId?.rollNo || "N/A"}`, 140, currentY + 58);
    doc.text(`Semester: ${application.studentId?.semester || "N/A"}`, 140, currentY + 66);
    
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

    doc.save(`Application_${application.studentId?.rollNo}.pdf`);
};
  return (
    <div className="w-full min-h-screen p-0 sm:p-0 bg-transparent text-slate-800 antialiased box-border overflow-x-hidden">
      
      {/* --- MENU VIEW LAYER --- */}
      {view === 'menu' && (
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
          <button onClick={() => setView('mark')} className="w-full bg-white border-b-4 border-[#001f3f] p-5 md:p-6 rounded-lg shadow-md flex flex-col items-center text-center gap-3 transition-all active:scale-95 hover:shadow-lg">
            <span className="text-3xl md:text-4xl bg-slate-50 p-3 rounded-lg">📝</span>
            <div>
              <h4 className="font-black text-[#001f3f] uppercase text-xs md:text-sm tracking-wider">Mark Attendance</h4>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Add new student logs for today</p>
            </div>
          </button>

          <button onClick={() => setView('history')} className="w-full bg-white border-b-4 border-[#d4a017] p-5 md:p-6 rounded-lg shadow-md flex flex-col items-center text-center gap-3 transition-all active:scale-95 hover:shadow-lg">
            <span className="text-3xl md:text-4xl bg-slate-50 p-3 rounded-lg">📅</span>
            <div>
              <h4 className="font-black text-[#001f3f] uppercase text-xs md:text-sm tracking-wider">View History Panel</h4>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Check permanent roster summaries</p>
            </div>
          </button>

          <button onClick={() => setView('applications')} className="w-full bg-white border-b-4 border-amber-600 p-5 md:p-6 rounded-lg shadow-md flex flex-col items-center text-center gap-3 transition-all active:scale-95 hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <span className="text-3xl md:text-4xl bg-slate-50 p-3 rounded-lg">📩</span>
            <div>
              <h4 className="font-black text-[#001f3f] uppercase text-xs md:text-sm tracking-wider">Leave Applications</h4>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Review and manage student leave requests</p>
            </div>
          </button>
        </div>
      )}

      {/* --- MARK ATTENDANCE INTERFACE --- */}
      {view === 'mark' && (
        <div className="w-full bg-white p-3 sm:p-6 rounded-lg shadow-xl border border-gray-100 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setView('menu')} className="text-xs uppercase font-bold text-[#001f3f] hover:text-[#d4a017] transition-colors">← MAIN MENU</button>
          </div>

          <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Department</label>
                <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-4 py-3 bg-white text-[#001f3f] font-bold text-xs rounded-lg outline-none border border-slate-300 focus:border-[#001f3f] focus:ring-2 focus:ring-[#001f3f]/20 transition-all shadow-sm">
                  {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Semester</label>
                <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full px-4 py-3 bg-white text-[#001f3f] font-bold text-xs rounded-lg outline-none border border-slate-300 focus:border-[#001f3f] focus:ring-2 focus:ring-[#001f3f]/20 transition-all shadow-sm">
                  {semestersList.map(s => <option key={s} value={s}>{s} Semester</option>)}
                </select>
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`p-3 mb-4 text-center text-xs font-bold rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-400">Loading students list...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-xs text-red-500 font-bold bg-red-50 rounded-lg border border-dashed border-red-200">
              No students registered for these filters.
            </div>
          ) : (
            <div>
              <div className="w-full overflow-x-auto border border-gray-100 rounded-lg shadow-inner scrollbar-thin">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-[#001f3f] text-white text-[11px] md:text-xs uppercase tracking-wider">
                      <th className="p-3 md:p-4 rounded-tl-2xl w-1/4">Roll No</th>
                      <th className="p-3 md:p-4 w-1/2">Student Name</th>
                      <th className="p-3 md:p-4 text-center rounded-tr-2xl w-1/4">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-gray-100 bg-white">
                    {students.map(s => (
                      <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 md:p-4 font-bold text-slate-500 tracking-wide whitespace-nowrap">{s.rollNo || 'N/A'}</td>
                        <td className="p-3 md:p-4 font-extrabold uppercase text-slate-700 break-words max-w-[180px] sm:max-w-none">{s.name}</td>
                        <td className="p-3 md:p-4">
                          <div className="flex justify-center gap-1.5">
                            <button onClick={() => handleStatusChange(s._id, 'PRESENT')} className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${s.status === 'PRESENT' ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>P</button>
                            <button onClick={() => handleStatusChange(s._id, 'ABSENT')} className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${s.status === 'ABSENT' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>A</button>
                            <button onClick={() => handleStatusChange(s._id, 'LEAVE')} className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${s.status === 'LEAVE' ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>L</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-6">
                <button onClick={handleSubmitAttendance} className="bg-[#001f3f] hover:bg-opacity-90 active:scale-95 text-white text-xs font-bold px-8 py-3 rounded-lg shadow-lg transition-all uppercase tracking-wider w-full sm:w-auto">
                  Submit Attendance Sheet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- HISTORY PANEL LAYER --- */}
      {view === 'history' && (
        <div className="w-full bg-white p-3 sm:p-6 rounded-lg shadow-xl border border-gray-100 max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 border-b pb-4 mb-5 md:flex-row md:justify-between md:items-center">
            <button onClick={() => setView('menu')} className="text-xs uppercase font-bold text-blue-900 hover:text-blue-700 transition-colors self-start">← Back to Menu</button>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full md:w-auto overflow-x-auto scrollbar-none">
              {['daily', 'weekly', 'monthly'].map(tab => (
                <button key={tab} onClick={() => setReportSubTab(tab)} className={`flex-1 md:flex-initial text-center px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${reportSubTab === tab ? 'bg-[#d4a017] text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>
                  {tab} View
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl mb-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Department</label>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-3 text-xs font-bold bg-white text-[#001f3f] focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20 transition-all shadow-sm">
                {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Semester</label>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-3 text-xs font-bold bg-white text-[#001f3f] focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20 transition-all shadow-sm">
                {semestersList.map(s => <option key={s} value={s}>{s} Semester</option>)}
              </select>
            </div>
          </div>

          {historyLoading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-400">Syncing with database logs...</div>
          ) : historySheets.length === 0 ? (
            <div className="text-center py-8 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-dashed border-amber-200 uppercase tracking-wide">
              No saved data found for the selected duration ({reportSubTab})!
            </div>
          ) : (
            <div className="w-full overflow-x-auto border border-gray-100 rounded-lg shadow-inner scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-[#001f3f] text-white text-[11px] md:text-xs uppercase tracking-wider">
                    <th className="p-3 md:p-4 rounded-tl-2xl">Day & Date</th>
                    <th className="p-3 md:p-4">Department</th>
                    <th className="p-3 md:p-4 text-center">Roster Strength</th>
                    <th className="p-3 md:p-4 text-center rounded-tr-2xl">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-100 bg-white">
                  {historySheets.map(sheet => (
                    <React.Fragment key={sheet._id}>
                      <tr onClick={() => setExpandedSheetId(expandedSheetId === sheet._id ? null : sheet._id)} className="cursor-pointer hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 md:p-4 font-extrabold text-blue-900 tracking-wide whitespace-nowrap">
                          <span className="text-gray-400 mr-2 text-[10px]">{expandedSheetId === sheet._id ? '▼' : '▶'}</span>
                          {sheet.date} <span className="text-[10px] text-gray-400 font-bold block sm:inline sm:ml-1">({getDayName(sheet.date)})</span>
                        </td>
                        <td className="p-3 md:p-4 font-bold uppercase text-slate-600 truncate max-w-[130px] sm:max-w-none">{sheet.department}</td>
                        <td className="p-3 md:p-4 text-center font-extrabold text-green-700 bg-green-50/30 whitespace-nowrap">{sheet.records?.length || 0} Marked</td>
                        <td className="p-3 md:p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => downloadReportPDF(sheet)} className="bg-red-600 text-white font-black text-[10px] px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors shadow shadow-red-100 uppercase whitespace-nowrap">
                            📥 PDF
                          </button>
                        </td>
                      </tr>

                      {expandedSheetId === sheet._id && (
                        <tr>
                          <td colSpan="4" className="bg-slate-50/40 p-2 md:p-4 border-t border-b border-slate-100">
                            <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-lg shadow-md overflow-hidden mx-auto">
                              <div className="bg-[#002f5f] text-white p-2.5 text-[10px] uppercase font-black tracking-widest text-center">
                                Detailed Attendance Logs
                              </div>
                              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto scrollbar-thin">
                                {sheet.records?.map((record, idx) => (
                                  <div key={record._id || idx} className="p-3 flex justify-between items-center text-xs gap-3">
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-extrabold text-slate-800 uppercase tracking-wide truncate">{record.studentId?.name || "Unknown"}</span>
                                      <span className="text-[10px] text-slate-400 font-bold">Roll: {record.studentId?.rollNo || "N/A"}</span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider whitespace-nowrap ${
                                      record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                      record.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                      {record.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- LEAVE APPLICATIONS LAYOUT --- */}
      {view === 'applications' && (
        <div className="w-full bg-white p-3 sm:p-6 rounded-lg shadow-xl border border-gray-100 max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 border-b pb-4 mb-5 md:flex-row md:justify-between md:items-center">
            <button onClick={() => setView('menu')} className="text-xs uppercase font-bold text-blue-900 hover:text-blue-700 transition-colors whitespace-nowrap self-start mt-1">← Main Menu</button>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
              <h4 className="text-[10px] sm:text-xs font-black bg-[#001f3f] text-white px-4 py-2 rounded-lg tracking-wider uppercase truncate md:mr-2 self-start sm:self-auto shadow-sm">Active Leaves Hub</h4>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="border border-slate-300 rounded-lg px-4 py-2 text-xs font-bold bg-white text-[#001f3f] w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20 shadow-sm transition-all">
                {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="border border-slate-300 rounded-lg px-4 py-2 text-xs font-bold bg-white text-[#001f3f] w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-[#001f3f]/20 shadow-sm transition-all">
                {semestersList.map(s => <option key={s} value={s}>{s} Semester</option>)}
              </select>
            </div>
          </div>

          {message.text && (
            <div className="p-3 mb-4 text-center text-xs font-bold bg-green-100 text-green-800 rounded-lg">
              {message.text}
            </div>
          )}

          {appLoading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-400">Loading incoming applications data...</div>
          ) : (
            (() => {
              const selDept = selectedDepartment.toLowerCase().trim();
              const semNumber = selectedSemester.match(/\d+/)?.[0];
              
              const filteredApplications = applications.filter(app => {
                if (!app.studentId) return false;
                
                const appDept = (app.studentId.department || '').toLowerCase().trim();
                const appSem = String(app.studentId.semester || '').toLowerCase().trim();
                
                const matchesDept = appDept === selDept;
                const matchesSem = appSem === String(semNumber) || 
                                   appSem === `${semNumber}th` || 
                                   appSem === `${semNumber}st` || 
                                   appSem === `${semNumber}nd` || 
                                   appSem === `${semNumber}rd` ||
                                   appSem === selectedSemester.toLowerCase().trim();
                                   
                return matchesDept && matchesSem;
              });
              
              if (filteredApplications.length === 0) {
                return (
                  <div className="text-center py-10 text-xs text-amber-600 bg-amber-50 rounded-lg border border-dashed border-amber-200 font-bold uppercase tracking-wide">
                    No active applications found for {selectedDepartment} - {selectedSemester}.
                  </div>
                );
              }

              return (
            <div className="w-full overflow-x-auto border border-gray-100 rounded-lg shadow-inner scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#001f3f] text-white text-[11px] md:text-xs uppercase tracking-wider">
                    <th className="p-3 md:p-4 rounded-tl-2xl">Roll No</th>
                    <th className="p-3 md:p-4">Student</th>
                    <th className="p-3 md:p-4">Semester</th>
                    <th className="p-3 md:p-4 w-1/3">Subject & Reason</th>
                    <th className="p-3 md:p-4">Duration</th>
                    <th className="p-3 md:p-4 text-center">Status</th>
                    <th className="p-3 md:p-4 text-center rounded-tr-2xl">Action Process</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-100 bg-white">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 md:p-4 font-black text-slate-500 whitespace-nowrap">{app.studentId?.rollNo || 'N/A'}</td>
                      <td className="p-3 md:p-4 font-extrabold uppercase text-[#001f3f] whitespace-nowrap">{app.studentId?.name || 'Unknown'}</td>
                      <td className="p-3 md:p-4 font-bold text-slate-600 uppercase whitespace-nowrap">{app.studentId?.semester || 'N/A'}</td>
                      <td className="p-3 md:p-4 max-w-xs break-words">
                        <div className="font-bold text-slate-800 mb-0.5 line-clamp-1">{app.subject}</div>
                        <div className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{app.reason}</div>
                      </td>
                      <td className="p-3 md:p-4 text-[11px] text-slate-500 font-medium whitespace-nowrap">
                        <span className="font-bold text-slate-700">From:</span> {app.startDate}<br/>
                        <span className="font-bold text-slate-700">To:</span> {app.endDate}
                      </td>
                      <td className="p-3 md:p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider whitespace-nowrap ${
                          app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex flex-col gap-2 items-center">
                          {app.status === 'PENDING' ? (
                            <div className="flex flex-col gap-2 w-full max-w-[180px]">
                              <input 
                                type="text" 
                                placeholder="Remarks (Optional)..." 
                                value={remarks[app._id] || ''} 
                                onChange={(e) => setRemarks({...remarks, [app._id]: e.target.value})}
                                className="border border-slate-200 text-[10px] p-2 rounded-lg outline-none w-full bg-slate-50 text-slate-700 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
                              />
                              <div className="flex gap-1.5 w-full">
                                <button onClick={() => handleApplicationStatus(app._id, 'APPROVED')} className="w-1/2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-[10px] py-1.5 px-1 rounded-md transition-all shadow-sm">✓ Approve</button>
                                <button onClick={() => handleApplicationStatus(app._id, 'REJECTED')} className="w-1/2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-[10px] py-1.5 px-1 rounded-md transition-all shadow-sm">✕ Reject</button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">Processed</span>
                          )}
                          <button onClick={() => downloadApplicationPDF(app)} className="text-blue-900 border border-blue-900/20 font-black text-[10px] px-2.5 py-1 rounded-md hover:bg-blue-50 transition-colors uppercase whitespace-nowrap mt-0.5">
                            📥 PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              );
            })()
          )}
        </div>
      )}

    </div>
  );
};

export default ManageAttendance;