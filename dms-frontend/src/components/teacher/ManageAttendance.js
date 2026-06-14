import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageAttendance = () => {
  const [view, setView] = useState('menu'); // views: 'menu', 'mark', 'history', 'applications'
  const [students, setStudents] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('1st Semester');
  const [selectedDepartment, setSelectedDepartment] = useState('Computer Science');
  
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

  const departmentsList = [
    'Computer Science', 'Information Technology', 'Software Engineering',
    'Electrical Engineering', 'Mechanical Engineering', 'Business Administration'
  ];

  const semestersList = [
    '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
    '5th Semester', '6th Semester', '7th Semester', '8th Semester'
  ];

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
    doc.setFont("helvetica", "bold");
    doc.text("DEPARTMENT MANAGEMENT SYSTEM (DMS)", 14, 15);
    const headers = [["Roll No", "Student Name", "Day", "Date", "Status"]];
    const rows = sheet.records.map(r => [
      r.studentId?.rollNo || "N/A",
      r.studentId?.name ? r.studentId.name.toUpperCase() : "N/A",
      dayName,
      sheet.date,
      r.status
    ]);
    autoTable(doc, { startY: 42, head: headers, body: rows });
    doc.save(`Attendance_${sheet.date}.pdf`);
  };

const downloadApplicationPDF = (application) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("LEAVE APPLICATION REPORT", 105, 20, { align: "center" });
    doc.line(20, 25, 190, 25); // Line divider

    // Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const details = [
        `Student Name: ${application.studentId?.name || "N/A"}`,
        `Roll No: ${application.studentId?.rollNo || "N/A"}`,
        `Subject: ${application.subject}`,
        `Duration: ${application.startDate} to ${application.endDate}`,
        `Status: ${application.status}`
    ];
    
    let y = 40;
    details.forEach(line => {
        doc.text(line, 20, y);
        y += 10;
    });

    // Reason Box
    doc.setFont("helvetica", "bold");
    doc.text("Reason:", 20, y + 10);
    doc.setFont("helvetica", "normal");
    const splitReason = doc.splitTextToSize(application.reason, 170);
    doc.text(splitReason, 20, y + 20);

    doc.save(`Application_${application.studentId?.rollNo}.pdf`);
};
  return (
    <div className="w-full min-h-screen p-3 md:p-6 bg-transparent text-slate-800 antialiased box-border overflow-x-hidden">
      
      {/* --- MENU VIEW LAYER --- */}
      {view === 'menu' && (
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
          <button onClick={() => setView('mark')} className="w-full bg-white border-b-4 border-[#001f3f] p-5 md:p-6 rounded-2xl shadow-md flex flex-col items-center text-center gap-3 transition-all active:scale-95 hover:shadow-lg">
            <span className="text-3xl md:text-4xl bg-slate-50 p-3 rounded-xl">📝</span>
            <div>
              <h4 className="font-black text-[#001f3f] uppercase text-xs md:text-sm tracking-wider">Mark Attendance</h4>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Add new student logs for today</p>
            </div>
          </button>

          <button onClick={() => setView('history')} className="w-full bg-white border-b-4 border-[#d4a017] p-5 md:p-6 rounded-2xl shadow-md flex flex-col items-center text-center gap-3 transition-all active:scale-95 hover:shadow-lg">
            <span className="text-3xl md:text-4xl bg-slate-50 p-3 rounded-xl">📅</span>
            <div>
              <h4 className="font-black text-[#001f3f] uppercase text-xs md:text-sm tracking-wider">View History Panel</h4>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Check permanent roster summaries</p>
            </div>
          </button>

          <button onClick={() => setView('applications')} className="w-full bg-white border-b-4 border-amber-600 p-5 md:p-6 rounded-2xl shadow-md flex flex-col items-center text-center gap-3 transition-all active:scale-95 hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <span className="text-3xl md:text-4xl bg-slate-50 p-3 rounded-xl">📩</span>
            <div>
              <h4 className="font-black text-[#001f3f] uppercase text-xs md:text-sm tracking-wider">Leave Applications</h4>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Review and manage student leave requests</p>
            </div>
          </button>
        </div>
      )}

      {/* --- MARK ATTENDANCE INTERFACE --- */}
      {view === 'mark' && (
        <div className="w-full bg-white p-3 sm:p-6 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
          <div className="flex flex-col gap-3 border-b pb-4 mb-4 md:flex-row md:justify-between md:items-center">
            <button onClick={() => setView('menu')} className="text-xs uppercase font-bold text-blue-900 hover:text-blue-700 transition-colors self-start">← Main Menu</button>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="border rounded-xl p-2.5 text-xs font-bold bg-white text-slate-700 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-900/20">
                {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="border rounded-xl p-2.5 text-xs font-bold bg-white text-slate-700 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-900/20">
                {semestersList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {message.text && (
            <div className={`p-3 mb-4 text-center text-xs font-bold rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-400">Loading students list...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-xs text-red-500 font-bold bg-red-50 rounded-2xl border border-dashed border-red-200">
              No students registered for these filters.
            </div>
          ) : (
            <div>
              <div className="w-full overflow-x-auto border border-gray-100 rounded-2xl shadow-inner scrollbar-thin">
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
                            <button onClick={() => handleStatusChange(s._id, 'PRESENT')} className={`w-8 h-8 rounded-xl font-black text-xs transition-all ${s.status === 'PRESENT' ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>P</button>
                            <button onClick={() => handleStatusChange(s._id, 'ABSENT')} className={`w-8 h-8 rounded-xl font-black text-xs transition-all ${s.status === 'ABSENT' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>A</button>
                            <button onClick={() => handleStatusChange(s._id, 'LEAVE')} className={`w-8 h-8 rounded-xl font-black text-xs transition-all ${s.status === 'LEAVE' ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>L</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-6">
                <button onClick={handleSubmitAttendance} className="bg-[#001f3f] hover:bg-opacity-90 active:scale-95 text-white text-xs font-bold px-8 py-3 rounded-xl shadow-lg transition-all uppercase tracking-wider w-full sm:w-auto">
                  Submit Attendance Sheet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- HISTORY PANEL LAYER --- */}
      {view === 'history' && (
        <div className="w-full bg-white p-3 sm:p-6 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 border-b pb-4 mb-5 md:flex-row md:justify-between md:items-center">
            <button onClick={() => setView('menu')} className="text-xs uppercase font-bold text-blue-900 hover:text-blue-700 transition-colors self-start">← Back to Menu</button>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto overflow-x-auto scrollbar-none">
              {['daily', 'weekly', 'monthly'].map(tab => (
                <button key={tab} onClick={() => setReportSubTab(tab)} className={`flex-1 md:flex-initial text-center px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${reportSubTab === tab ? 'bg-[#d4a017] text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>
                  {tab} View
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 bg-slate-50/80 rounded-2xl mb-5 border border-slate-100">
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="border rounded-xl px-3 py-2.5 text-xs font-bold bg-white text-slate-700 focus:outline-none w-full">
              {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="border rounded-xl px-3 py-2.5 text-xs font-bold bg-white text-slate-700 focus:outline-none w-full">
              {semestersList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {historyLoading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-400">Syncing with database logs...</div>
          ) : historySheets.length === 0 ? (
            <div className="text-center py-8 bg-amber-50 text-amber-800 text-xs font-bold rounded-2xl border border-dashed border-amber-200 uppercase tracking-wide">
              No saved data found for the selected duration ({reportSubTab})!
            </div>
          ) : (
            <div className="w-full overflow-x-auto border border-gray-100 rounded-2xl shadow-inner scrollbar-thin">
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
                          <button onClick={() => downloadReportPDF(sheet)} className="bg-red-600 text-white font-black text-[10px] px-3 py-1.5 rounded-xl hover:bg-red-700 transition-colors shadow shadow-red-100 uppercase whitespace-nowrap">
                            📥 PDF
                          </button>
                        </td>
                      </tr>

                      {expandedSheetId === sheet._id && (
                        <tr>
                          <td colSpan="4" className="bg-slate-50/40 p-2 md:p-4 border-t border-b border-slate-100">
                            <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden mx-auto">
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
        <div className="w-full bg-white p-3 sm:p-6 rounded-2xl shadow-xl border border-gray-100 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-5 gap-3">
            <button onClick={() => setView('menu')} className="text-xs uppercase font-bold text-blue-900 hover:text-blue-700 transition-colors whitespace-nowrap">← Main Menu</button>
            <h4 className="text-[10px] sm:text-xs font-black bg-[#001f3f] text-white px-3 py-1.5 rounded-full tracking-wider uppercase truncate self-start sm:self-auto">Active Leaves Hub</h4>
          </div>

          {message.text && (
            <div className="p-3 mb-4 text-center text-xs font-bold bg-green-100 text-green-800 rounded-xl">
              {message.text}
            </div>
          )}

          {appLoading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-400">Loading incoming applications data...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10 text-xs text-amber-600 bg-amber-50 rounded-2xl border border-dashed border-amber-200 font-bold uppercase tracking-wide">
              No student has submitted an application yet.
            </div>
          ) : (
            <div className="w-full overflow-x-auto border border-gray-100 rounded-2xl shadow-inner scrollbar-thin">
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
                  {applications.map((app) => (
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
                            <div className="flex flex-col gap-1.5 w-full max-w-[160px]">
                              <input 
                                type="text" 
                                placeholder="Remarks..." 
                                value={remarks[app._id] || ''} 
                                onChange={(e) => setRemarks({...remarks, [app._id]: e.target.value})}
                                className="border text-[11px] p-1.5 rounded-lg outline-none w-full bg-slate-50 text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-900/30"
                              />
                              <div className="flex gap-1 w-full justify-center">
                                <button onClick={() => handleApplicationStatus(app._id, 'APPROVED')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] py-1.5 rounded-md transition-colors whitespace-nowrap">Approve</button>
                                <button onClick={() => handleApplicationStatus(app._id, 'REJECTED')} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] py-1.5 rounded-md transition-colors whitespace-nowrap">Reject</button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic font-medium">Processed</span>
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
          )}
        </div>
      )}

    </div>
  );
};

export default ManageAttendance;