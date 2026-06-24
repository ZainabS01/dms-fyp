import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Explicitly imported to avoid plugin runtime crashes
import { SEMESTERS_LIST } from '../../constants/data';

const TeacherResult = () => {
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [university] = useState('University of the Punjab');
  const [studentsList, setStudentsList] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  // Popup Modal View States for Uploaded PDF DMC
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [departmentsList, setDepartmentsList] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/departments`)
      .then(res => setDepartmentsList(res.data.map(d => d.name.replace(/^BS\s+/i, '').trim().toUpperCase())))
      .catch(err => console.error("Error fetching departments:", err));
  }, []);

  const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api`;

  // API Call to fetch real-time batch data from MongoDB
  const fetchActiveBatch = async () => {
    if (department && semester) {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/student/students-list`, {
          params: { department: department, semester: semester}
        });
        if (Array.isArray(response.data)) {
          setStudentsList(response.data);
        } else {
          setStudentsList([]);
        }
      } catch (error) {
        console.error("Pipeline error:", error);
        setStudentsList([]);
      } finally {
        setLoading(false);
      }
    } else {
      setStudentsList([]);
    }
  };

  useEffect(() => {
    fetchActiveBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, semester]);

  const handleRowTextChange = (id, field, value) => {
    setStudentsList(prev => 
      prev.map(row => row._id === id ? { ...row, [field]: value } : row)
    );
  };

  const handleRowFileChange = (id, file) => {
    setStudentsList(prev => 
      prev.map(row => row._id === id ? { ...row, selectedFile: file, localPreview: URL.createObjectURL(file) } : row)
    );
  };

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // 💾 SAVE & UPDATE OPERATOR (Saves Data to DB)
// SIRF YE FUNCTION UPDATE KAREIN (TeacherResult.js mein)
const saveOrUpdateRow = async (student) => {
  if (!student.gpa || !student.cgpa) {
    showToast(`🛑 Enter GPA and CGPA values for ${student.name}`);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('university', university);
    formData.append('department', department);
    formData.append('semester', semester);
    formData.append('rollNo', student.rollNo);
    formData.append('name', student.name);
    formData.append('gpa', student.gpa);
    formData.append('cgpa', student.cgpa);
    if (student.selectedFile) formData.append('dmcFile', student.selectedFile);

    const res = await axios.post(`${API_BASE_URL}/results/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (res.status === 200 || res.status === 201) {
      showToast(`✨ Record synced for ${student.rollNo}!`);

      // UI UPDATE: Manually update UI so the file name does not disappear
      setStudentsList(prev => prev.map(s => 
        s.rollNo === student.rollNo ? { 
           ...s, 
           dmcFile: res.data.dmcFile, // Backend se aaya hua naya path
           selectedFile: null // Upload hone ke baad local file state clear
        } : s
      ));
      
      // fetchActiveBatch(); // Keep this commented or uncommented as needed
    }
  } catch (err) {
    showToast("❌ Server communication breakdown.");
  }
};

  // 💾 BULK UPLOAD (SAVE ALL RESULTS)
  const saveAllResults = async () => {
    const studentsToSave = studentsList.filter(s => s.gpa && s.cgpa);
    
    if (studentsToSave.length === 0) {
      showToast("⚠️ No students with GPA/CGPA entered to save.");
      return;
    }

    setLoading(true);
    showToast(`🔄 Uploading ${studentsToSave.length} records... Please wait.`);
    
    let successCount = 0;
    let failedCount = 0;
    const updatedStudents = [...studentsList];

    const uploadPromises = studentsToSave.map(async (student) => {
      const formData = new FormData();
      formData.append('university', university);
      formData.append('department', department);
      formData.append('semester', semester);
      formData.append('rollNo', student.rollNo);
      formData.append('name', student.name);
      formData.append('gpa', student.gpa);
      formData.append('cgpa', student.cgpa);
      if (student.selectedFile) formData.append('dmcFile', student.selectedFile);

      const res = await axios.post(`${API_BASE_URL}/results/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200 || res.status === 201) {
        const idx = updatedStudents.findIndex(s => s.rollNo === student.rollNo);
        if (idx !== -1) {
          updatedStudents[idx] = { 
            ...updatedStudents[idx], 
            dmcFile: res.data.dmcFile, 
            selectedFile: null 
          };
        }
        return student.rollNo;
      } else {
        throw new Error("Failed");
      }
    });

    const results = await Promise.allSettled(uploadPromises);
    
    results.forEach(result => {
      if (result.status === 'fulfilled') successCount++;
      else failedCount++;
    });

    setStudentsList(updatedStudents);
    setLoading(false);

    if (failedCount === 0) {
      showToast(`✨ Successfully saved all ${successCount} records!`);
    } else {
      showToast(`⚠️ Saved ${successCount} records, but ${failedCount} failed.`);
    }
  };
  // 👁️ VIEW UPLOADED DMC PDF TRIGGER
  const triggerDmcView = (student) => {
    if (student.localPreview) {
      setPreviewUrl(student.localPreview);
      setShowModal(true);
    } else if (student.dmcFile) {
      setPreviewUrl(`${process.env.REACT_APP_API_URL}/${student.dmcFile}`);
      setShowModal(true);
    } else {
      showToast("⚠️ No physical DMC PDF transcript uploaded yet.");
    }
  };

  // ==========================================
  // 🔥 FIXED: EXPORT FULL SEMESTER PDF WITH AUTO-TABLE FUNCTION
  // ==========================================
  const exportSemesterPDF = () => {
    if (studentsList.length === 0) return;
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
    doc.text("UNIVERSITY OF THE PUNJAB", 105, 29, { align: "center" });
    
    // Reset Color
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text(`Academic Ledger Report`, 14, 46);
    doc.setFont("Helvetica", "normal");
    doc.text(`Department: ${department} | Semester: ${semester}`, 14, 53);
    
    doc.setLineWidth(0.5);
    doc.line(14, 56, 196, 56);

    // Grid Mapping
    const tableColumn = ["Roll Number", "Student Name", "Semester GPA", "Cumulative CGPA"];
    const tableRows = [];

    studentsList.forEach(s => {
      const rowData = [
        s.rollNo,
        s.name ? s.name.toUpperCase() : 'N/A',
        s.gpa || '0.00',
        s.cgpa || '0.00'
      ];
      tableRows.push(rowData);
    });

    // Called explicitly as a function to prevent runtime bugs
    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 31, 63], fontStyle: 'bold' }, // Dark Navy Blue Theme
      styles: { fontSize: 10, cellPadding: 4 },
    });

    doc.save(`${department.replace(/\s+/g, '_')}_Sem_${semester.replace(/\s+/g, '_')}_Report.pdf`);
  };

  // ==========================================
  // 🔥 GENERATE INDIVIDUAL STUDENT SHEET
  // ==========================================
  const downloadStudentResultPDF = (student) => {
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
    doc.text("UNIVERSITY OF THE PUNJAB", 105, 29, { align: "center" });
    
    // Reset Color
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(10);
    doc.text("Official Student Grade Sheet", 14, 46);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 52);

    autoTable(doc, {
        startY: 58,
        headStyles: { fillColor: [0, 31, 63], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { font: 'helvetica', fontSize: 12, cellPadding: 8 },
        head: [['Field', 'Details']],
        body: [
            ['Student Name', student.name ? student.name.toUpperCase() : 'N/A'],
            ['Roll No', student.rollNo],
            ['Department', department],
            ['Semester', semester],
            ['Semester GPA', student.gpa || '0.00'],
            ['Cumulative CGPA', student.cgpa || '0.00']
        ]
    });

    doc.save(`Result_Sheet_${student.rollNo}.pdf`);
  };

  return (
    <div className="w-full p-0 sm:p-0 relative">
      {/* Toast Alert Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[100] bg-[#001f3f] text-white px-6 py-4 rounded-lg shadow-xl text-xs font-bold border border-[#d4a017]">
          {toast.message}
        </div>
      )}

      <div className="space-y-6">
      {/* FILTER PANEL */}
      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-lg shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {studentsList.length > 0 && (
              <>
                <button onClick={exportSemesterPDF} className="px-4 py-2 bg-gradient-to-r from-[#001f3f] to-slate-800 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all shadow-md flex items-center gap-2 w-full sm:w-auto justify-center">
                  📄 Export Semester PDF
                </button>
                <button onClick={saveAllResults} disabled={loading} className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all shadow-md flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? '🔄 Saving...' : '💾 Save All Records'}
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">University Affiliation</label>
            <input type="text" value={university} readOnly className="w-full px-4 py-3 bg-slate-100 text-[#001f3f] font-bold text-xs rounded-lg cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Department</label>
            <select 
              value={department} 
              onChange={(e) => setDepartment(e.target.value)} 
              className="w-full px-4 pr-10 py-3 bg-[#f1f3f6] text-[#001f3f] font-bold text-xs rounded-lg focus:outline-none border-2 border-transparent focus:border-[#d4a017] appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
            >
              <option value="">Select Department</option>
              {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Semester</label>
            <select 
              value={semester} 
              onChange={(e) => setSemester(e.target.value)} 
              className="w-full px-4 pr-10 py-3 bg-[#f1f3f6] text-[#001f3f] font-bold text-xs rounded-lg focus:outline-none border-2 border-transparent focus:border-[#d4a017] appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
            >
              <option value="">Select Semester</option>
              {SEMESTERS_LIST.map(s => <option key={s} value={s}>{s} Semester</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* RENDER TABLE COMPONENT */}
      {department && semester && (
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-lg shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-[#001f3f] uppercase tracking-tight mb-4">
            📋 LIVE STUDENT RECORD LEDGER ({department.toUpperCase()} - {semester.toUpperCase()})
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              🔄 Syncing batch data with MongoDB collection...
            </div>
          ) : studentsList.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#001f3f] text-white text-[10px] font-black uppercase tracking-wider">
                    <th className="px-3 py-3 w-[10%]">Roll #</th>
                    <th className="px-3 py-3 w-[20%]">Student Name</th>
                    <th className="px-3 py-3 w-[12%] text-center">GPA</th>
                    <th className="px-3 py-3 w-[12%] text-center">CGPA</th>
                    <th className="px-3 py-3 w-[25%]">DMC Transcript</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold text-slate-600 divide-y divide-slate-100">
                  {studentsList.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-[#001f3f] font-black whitespace-nowrap">{student.rollNo}</td>
                      <td className="px-3 py-2.5 uppercase text-slate-700 font-black">{student.name}</td>
                      <td className="px-3 py-2.5 text-center">
                        <input type="number" step="0.01" min="0" max="4" value={student.gpa} onChange={(e) => handleRowTextChange(student._id, 'gpa', e.target.value)} className="w-14 text-center px-1 py-1.5 bg-[#f1f3f6] rounded border-2 border-transparent focus:border-[#d4a017] focus:bg-white focus:outline-none text-[#001f3f] font-black transition-all" />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <input type="number" step="0.01" min="0" max="4" value={student.cgpa} onChange={(e) => handleRowTextChange(student._id, 'cgpa', e.target.value)} className="w-14 text-center px-1 py-1.5 bg-[#f1f3f6] rounded border-2 border-transparent focus:border-[#d4a017] focus:bg-white focus:outline-none text-[#001f3f] font-black transition-all" />
                      </td>
                      <td className="px-3 py-2.5">
                        <input type="file" accept=".pdf" onChange={(e) => handleRowFileChange(student._id, e.target.files[0])} className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[9px] file:font-black file:bg-[#001f3f] file:text-white cursor-pointer hover:file:bg-blue-900 transition-all" />
                      </td>
                      <td className="px-3 py-2.5 flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => triggerDmcView(student)} title="View Uploaded DMC" className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#001f3f] rounded transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button type="button" onClick={() => downloadStudentResultPDF(student)} title="Download GPA PDF" className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-amber-50/50 border border-dashed border-amber-200 text-amber-800 p-8 rounded-lg text-center text-xs font-bold">
              ⚠️ No registered students found matching criteria in database records. Please verify user signups.
            </div>
          )}
        </div>
      )}

      {/* 🖼️ DMC POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-lg p-6 flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-black text-[#001f3f] uppercase text-sm">📄 DMC Official Document Viewer</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg overflow-hidden">
              <iframe src={previewUrl} title="DMC Transcript Document" className="w-full h-full border-0 rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default TeacherResult;