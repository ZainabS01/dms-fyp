import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DEPARTMENTS_LIST, SEMESTERS_LIST } from '../../constants/data';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/students`);
      setStudents(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/students/${editingStudent._id}`, editingStudent);
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/students/${studentToDelete._id}`);
      setIsDeleteModalOpen(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const departments = ['All Departments', ...DEPARTMENTS_LIST];

  const filteredStudents = selectedDepartment === '' 
    ? [] 
    : selectedDepartment === 'All Departments'
      ? students
      : students.filter(student => {
          const sDept = (student.department || "").toLowerCase().replace(/^bs\s+/, "").trim();
          const selDept = selectedDepartment.toLowerCase().replace(/^bs\s+/, "").trim();
          return sDept === selDept;
        });

  return (
    <div className="w-full animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-6 py-4 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-[#d4a017] text-sm text-slate-600 font-bold outline-none cursor-pointer uppercase tracking-wider w-full md:w-auto"
          >
            <option value="" disabled>Select Department</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
          <div className="relative w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search by Roll No..." 
              className="pl-6 pr-12 py-4 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-[#d4a017] w-full md:w-80 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[600px] overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar w-full">
          <table className="w-full text-left relative min-w-[800px]">
            <thead className="bg-[#001f3f] text-white uppercase text-[11px] tracking-[0.2em] sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-8 py-6">Roll No</th>
              <th className="px-8 py-6">Full Name</th>
              <th className="px-8 py-6">Department</th>
              <th className="px-8 py-6">Semester</th>
              <th className="px-8 py-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {selectedDepartment === '' ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-left md:text-center text-slate-400 font-bold uppercase tracking-wider sticky left-0">
                  Please select a department to view students
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-left md:text-center text-slate-400 font-bold uppercase tracking-wider sticky left-0">
                  No students found in this department
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-black text-[#001f3f]">{student.rollNo || '888888'}</td>
                  <td className="px-8 py-6 font-bold text-slate-600">{student.name}</td>
                  <td className="px-8 py-6 text-xs font-black text-blue-500 uppercase">{student.department}</td>
                  <td className="px-8 py-6 font-black text-[#d4a017]">{student.semester}</td>
                  <td className="px-8 py-6 flex justify-center gap-3">
                    <button onClick={() => handleEditClick(student)} className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all">Edit</button>
                    <button onClick={() => handleDeleteClick(student)} className="bg-red-100 text-red-500 px-4 py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-fadeIn">
            <h2 className="text-2xl font-black text-[#001f3f] mb-6">EDIT STUDENT</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Roll No</label>
                <input type="text" value={editingStudent?.rollNo || ''} onChange={(e) => setEditingStudent({...editingStudent, rollNo: e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4a017] outline-none font-bold text-slate-700" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input type="text" value={editingStudent?.name || ''} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4a017] outline-none font-bold text-slate-700" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                <select value={editingStudent?.department || ''} onChange={(e) => setEditingStudent({...editingStudent, department: e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4a017] outline-none font-bold text-slate-700 uppercase">
                  <option value="">Select Department</option>
                  {DEPARTMENTS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Semester</label>
                <select value={editingStudent?.semester || ''} onChange={(e) => setEditingStudent({...editingStudent, semester: e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4a017] outline-none font-bold text-slate-700">
                  <option value="">Select Semester</option>
                  {SEMESTERS_LIST.map(s => <option key={s} value={s}>{s} Semester</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">CANCEL</button>
              <button onClick={handleEditSubmit} className="flex-1 px-4 py-3 rounded-xl font-bold text-[#001f3f] bg-[#d4a017] hover:bg-[#b8860b] transition-colors shadow-lg">SAVE CHANGES</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-sm mx-4 animate-fadeIn">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-[#001f3f] mb-2 text-center">DELETE STUDENT</h2>
            <p className="text-slate-500 text-center mb-8 font-medium">Are you sure you want to delete this student? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">CANCEL</button>
              <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">DELETE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;