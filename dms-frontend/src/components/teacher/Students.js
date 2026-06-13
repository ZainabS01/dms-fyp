import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // FIX 1: Import directly
import { FiUsers, FiSearch, FiFolder, FiChevronDown, FiChevronUp, FiX, FiActivity, FiClipboard } from 'react-icons/fi';

const Students = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [selectedDept, setSelectedDept] = useState('COMPUTER SCIENCE');
  const [globalSearch, setGlobalSearch] = useState('');
  const [openSemester, setOpenSemester] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/students`);
        setAllStudents(response.data);
      } catch (err) { console.log("Data error:", err); }
    };
    fetchStudents();
  }, []);

  // --- PDF GENERATION LOGIC ---
  const downloadMarksSheet = (student) => {
    const doc = new jsPDF();
    
    // Header section
    doc.setFontSize(22);
    doc.setTextColor(0, 31, 63); // Navy Blue
    doc.text("DMS PORTAL - STUDENT RECORD", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 28);

    // FIX 2: Use autoTable(doc, options) instead of doc.autoTable
    autoTable(doc, {
      startY: 35,
      head: [['Field', 'Information']],
      body: [
        ['Full Name', student.name.toUpperCase()],
        ['Roll Number', student.rollNo],
        ['Department', student.department],
        ['Semester', student.semester],
        ['Attendance', '88%'],
        ['GPA', '3.85'],
        ['Grade', 'A+'],
      ],
      headStyles: { fillColor: [212, 160, 23] }, // Gold theme color
      theme: 'grid'
    });

    // Save the PDF
    doc.save(`${student.name}_MarksSheet.pdf`);
  };

  // Filter Logic
  const filteredResults = allStudents.filter(s => {
    const term = globalSearch.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(term) || 
      s.rollNo.toString().includes(term) ||
      s.department.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto min-h-screen bg-slate-50">
      {/* --- TOP SEARCH SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 bg-white p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 sm:p-4 bg-[#001f3f] text-[#d4a017] rounded-2xl shadow-lg shrink-0">
            <FiUsers size={24} className="sm:w-7 sm:h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#001f3f] uppercase italic leading-none">DMS Portal</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Student Management System</p>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Name, Roll No, or Department..." 
            value={globalSearch} 
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-[#d4a017] outline-none font-bold text-sm transition-all"
          />
        </div>
      </div>

      {/* --- SEARCH RESULTS DISPLAY --- */}
      {globalSearch && (
        <div className="mb-10">
          <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em] ml-2">Quick Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.length > 0 ? filteredResults.map(s => (
              <div key={s._id} className="bg-white p-5 rounded-[2rem] shadow-md hover:shadow-xl transition-all border-t-4 border-[#d4a017] group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-black text-[#001f3f] uppercase leading-tight">{s.name}</h4>
                    <span className="bg-[#001f3f] text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">Roll: {s.rollNo}</span>
                  </div>
                  <span className="text-[10px] font-black text-[#d4a017] uppercase bg-[#d4a017]/10 px-3 py-1 rounded-full">{s.department}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Semester: {s.semester}</p>
                  <button 
                    onClick={() => setSelectedStudent(s)}
                    className="bg-[#001f3f] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#d4a017] hover:text-[#001f3f] transition-all"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            )) : <div className="col-span-full p-10 text-center font-bold text-slate-300 italic">No matching records found.</div>}
          </div>
        </div>
      )}

      {/* --- MAIN DASHBOARD (Normal Folders) --- */}
      {!globalSearch && (
        <>
          <div className="mb-6">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block">Browse by Department</label>
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-5 bg-white border-none rounded-[1.5rem] text-sm font-black text-[#001f3f] shadow-sm outline-none cursor-pointer"
            >
              <option value="COMPUTER SCIENCE">COMPUTER SCIENCE</option>
              <option value="INFORMATION TECHNOLOGY">INFORMATION TECHNOLOGY</option>
              <option value="SOFTWARE ENGINEERING">SOFTWARE ENGINEERING</option>
            </select>
          </div>

          <div className="space-y-4">
            {["1", "2", "3", "4", "5", "6", "7", "8"].map(sem => {
              const semStudents = allStudents.filter(s => String(s.semester) === sem && s.department.toUpperCase() === selectedDept.toUpperCase());
              return (
                <div key={sem} className="bg-white rounded-[1.5rem] shadow-sm overflow-hidden border border-slate-100 transition-all hover:border-[#d4a017]">
                  <button 
                    onClick={() => setOpenSemester(openSemester === sem ? null : sem)} 
                    className={`w-full p-6 flex justify-between items-center ${openSemester === sem ? 'bg-[#001f3f] text-white' : 'bg-white'}`}
                  >
                    <div className="flex items-center gap-4">
                      <FiFolder className={semStudents.length > 0 ? "text-[#d4a017]" : "text-slate-200"} size={22} />
                      <span className="font-black text-sm uppercase tracking-wider">Semester {sem}</span>
                      {semStudents.length > 0 && (
                        <span className="bg-[#d4a017] text-[#001f3f] text-[9px] px-2 py-0.5 rounded-md font-black">{semStudents.length} Students</span>
                      )}
                    </div>
                    {openSemester === sem ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  {openSemester === sem && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50">
                      {semStudents.map(s => (
                        <div key={s._id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                          <div>
                            <p className="text-xs font-black text-[#001f3f] uppercase">{s.name}</p>
                            <p className="text-[9px] font-bold text-[#d4a017]">{s.rollNo}</p>
                          </div>
                          <button onClick={() => setSelectedStudent(s)} className="p-2 bg-slate-100 rounded-lg hover:bg-[#d4a017] transition-all"><FiActivity size={14}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* --- STUDENT MODAL (Detailed Record) --- */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-[#001f3f]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 scrollbar-thin">
            {/* Modal Header */}
            <div className="p-4 sm:p-8 border-b border-slate-100 flex justify-between items-start gap-4">
              <div>
                <span className="bg-[#d4a017] text-[#001f3f] text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">{selectedStudent.department}</span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#001f3f] uppercase mt-2 leading-tight">{selectedStudent.name}</h2>
                <p className="text-slate-400 font-bold text-sm">Roll Number: {selectedStudent.rollNo} | Semester {selectedStudent.semester}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-3 sm:p-4 bg-slate-100 rounded-full hover:rotate-90 transition-all duration-300 shrink-0"><FiX size={20} className="sm:w-6 sm:h-6" /></button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Attendance Section */}
              <div className="bg-slate-50 p-4 sm:p-6 rounded-[2rem]">
                <div className="flex items-center gap-2 mb-4">
                  <FiActivity className="text-[#d4a017]" />
                  <h4 className="text-xs font-black uppercase text-[#001f3f]">Attendance</h4>
                </div>
                <div className="text-3xl font-black text-[#001f3f]">88%</div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#d4a017] h-full" style={{width: '88%'}}></div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 italic">Excellent Performance!</p>
              </div>

              {/* Grades Section */}
              <div className="bg-slate-50 p-4 sm:p-6 rounded-[2rem]">
                <div className="flex items-center gap-2 mb-4">
                  <FiClipboard className="text-[#d4a017]" />
                  <h4 className="text-xs font-black uppercase text-[#001f3f]">Results/GPA</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Current GPA:</span> <span className="text-green-600">3.85</span></div>
                  <div className="flex justify-between text-xs font-bold"><span>Midterm Marks:</span> <span>44/50</span></div>
                  <div className="flex justify-between text-xs font-bold"><span>Total Grade:</span> <span className="text-[#001f3f]">A+</span></div>
                </div>
              </div>

              {/* Leave Application Section */}
              <div className="bg-slate-50 p-4 sm:p-6 rounded-[2rem]">
                <h4 className="text-xs font-black uppercase text-[#001f3f] mb-4">Leave Records</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border-l-4 border-green-500 shadow-sm">
                    <p className="text-[10px] font-black">Medical Leave</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Status: Approved</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border-l-4 border-yellow-500 shadow-sm">
                    <p className="text-[10px] font-black">Family Event</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Status: Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 sm:p-8 pt-0 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={() => downloadMarksSheet(selectedStudent)} 
                className="flex-1 py-4 bg-[#001f3f] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#d4a017] hover:text-[#001f3f] transition-all"
              >
                Download Marks Sheet
              </button>
              <button className="px-8 py-4 bg-slate-100 text-[#001f3f] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Edit Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;