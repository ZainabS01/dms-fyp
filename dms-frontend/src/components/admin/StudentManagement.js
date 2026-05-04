import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Backend se students ki list mangwana
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/students');
      setStudents(res.data);
    } catch (err) {
      console.log("Error fetching students");
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Kya aap is student ko delete karna chahte hain?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/student/${id}`);
        toast.success("Student Deleted!");
        fetchStudents(); // List refresh karein
      } catch (err) {
        toast.error("Delete failed!");
      }
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar activeTab="Students" />
      
      <main className="flex-1 ml-72 p-10">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-[#001f3f] uppercase italic">Student Management</h1>
            <div className="h-1.5 w-16 bg-[#d4a017] rounded-full mt-1"></div>
          </div>
          
          <input 
            type="text" 
            placeholder="Search by Roll No or Name..." 
            className="p-3 border-2 border-slate-200 rounded-xl outline-none focus:border-[#d4a017] w-64 text-sm font-bold"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </header>

        <div className="bg-white rounded-[30px] shadow-xl overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#001f3f] text-white">
                <th className="p-5 uppercase text-[10px] tracking-widest font-black">Roll No</th>
                <th className="p-5 uppercase text-[10px] tracking-widest font-black">Full Name</th>
                <th className="p-5 uppercase text-[10px] tracking-widest font-black">Department</th>
                <th className="p-5 uppercase text-[10px] tracking-widest font-black">Semester</th>
                <th className="p-5 uppercase text-[10px] tracking-widest font-black text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-black text-[#001f3f]">{student.rollNo}</td>
                  <td className="p-5 font-bold text-slate-600">{student.name}</td>
                  <td className="p-5 text-sm font-bold text-slate-500 uppercase">{student.department}</td>
                  <td className="p-5 font-bold text-[#d4a017]">{student.semester}</td>
                  <td className="p-5 flex justify-center gap-3">
                    <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all">Edit</button>
                    <button 
                      onClick={() => deleteStudent(student._id)}
                      className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StudentManagement;