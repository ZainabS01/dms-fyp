import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // FIX 1: Import directly
import { FiUsers, FiSearch, FiFolder, FiChevronDown, FiChevronUp, FiX, FiActivity, FiClipboard } from 'react-icons/fi';
import { DEPARTMENTS_LIST } from '../../constants/data';

const Students = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [openSemester, setOpenSemester] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [departmentsList, setDepartmentsList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/students`);
        const students = response.data;
        setAllStudents(students);
        
        // Extract unique departments from student data
        const uniqueDepts = students.map(s => s.department?.toUpperCase()).filter(Boolean);
        
        // Strip "BS " prefix from the constant department list to match student data format
        const staticDepts = DEPARTMENTS_LIST.map(d => d.replace(/^BS\s+/i, '').toUpperCase());
        
        // Merge both to ensure all departments show up even if empty
        const combinedDepts = [...new Set([...staticDepts, ...uniqueDepts])].sort();
        
        setDepartmentsList(combinedDepts);
        
        if (combinedDepts.length > 0 && selectedDept && !combinedDepts.includes(selectedDept)) {
          setSelectedDept('');
        }
      } catch (err) { console.log("Data error:", err); }
    };
    fetchData();
  }, []); // Run only once on mount

  // --- PDF GENERATION LOGIC ---
  const downloadMarksSheet = (student) => {
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
    doc.text("STUDENT RECORD PORTAL", 105, 29, { align: "center" });
    
    // Reset Color
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(10);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 46);

    autoTable(doc, {
      startY: 58,
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
    <div className="p-0 sm:p-0 max-w-7xl mx-auto min-h-screen bg-slate-50">
      {/* --- TOP SEARCH SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 bg-white p-4 sm:p-6 rounded-lg sm:rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 sm:p-4 bg-[#001f3f] text-[#d4a017] rounded-lg shadow-lg shrink-0">
            <FiUsers size={24} className="sm:w-7 sm:h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#001f3f] uppercase leading-none">DMS Portal</h2>
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
            className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border-none rounded-lg focus:ring-2 ring-[#d4a017] outline-none font-bold text-sm transition-all"
          />
        </div>
      </div>

      {/* --- SEARCH RESULTS DISPLAY --- */}
      {globalSearch && (
        <div className="mb-10">
          <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em] ml-2">Quick Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.length > 0 ? filteredResults.map(s => (
              <div key={s._id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-[#d4a017] group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-black text-[#001f3f] uppercase leading-tight">{s.name}</h4>
                    <span className="bg-[#001f3f] text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">Roll: {s.rollNo}</span>
                  </div>
                  <span className="text-[10px] font-black text-[#d4a017] uppercase bg-[#d4a017]/10 px-3 py-1 rounded-full">{s.department}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Semester: {s.semester}</p>
                </div>
              </div>
            )) : <div className="col-span-full p-10 text-center font-bold text-slate-300">No matching records found.</div>}
          </div>
        </div>
      )}

      {/* --- MAIN DASHBOARD (Normal Folders) --- */}
      {!globalSearch && (
        <>
          <div className="mb-6">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block">Browse by Department</label>
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 transition-all hover:border-[#d4a017]">
              <select 
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full p-6 bg-transparent border-none text-sm font-black text-[#001f3f] outline-none cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1em' }}
              >
                <option value="" disabled>Select Department</option>
                {departmentsList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedDept ? (
            <div className="space-y-4">
              {["1", "2", "3", "4", "5", "6", "7", "8"].map(sem => {
                const semStudents = allStudents.filter(s => String(s.semester) === sem && s.department?.toUpperCase() === selectedDept.toUpperCase());
                return (
                  <div key={sem} className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-100 transition-all hover:border-[#d4a017]">
                  <button 
                    onClick={() => setOpenSemester(openSemester === sem ? null : sem)} 
                    className={`w-full p-6 flex justify-between items-center ${openSemester === sem ? 'bg-[#001f3f] text-white' : 'bg-white'}`}
                  >
                    <div className="flex items-center gap-4">
                      <FiFolder className={semStudents.length > 0 ? "text-[#d4a017]" : "text-slate-200"} size={22} />
                      <span className="font-black text-sm uppercase tracking-wider">{sem} Semester</span>
                      {semStudents.length > 0 && (
                        <span className="bg-[#d4a017] text-[#001f3f] text-[9px] px-2 py-0.5 rounded-md font-black">{semStudents.length} Students</span>
                      )}
                    </div>
                    {openSemester === sem ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  {openSemester === sem && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50">
                      {semStudents.map(s => (
                        <div key={s._id} className="bg-white p-4 rounded-lg flex justify-between items-center shadow-sm">
                          <div>
                            <p className="text-xs font-black text-[#001f3f] uppercase">{s.name}</p>
                            <p className="text-[9px] font-bold text-[#d4a017]">{s.rollNo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-10 text-center font-bold text-slate-400 uppercase tracking-widest">
              Please select a department to view semesters and students.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Students;