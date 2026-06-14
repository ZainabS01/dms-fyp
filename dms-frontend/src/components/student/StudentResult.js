import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';

const StudentResult = ({ studentData }) => {
  const [results, setResults] = useState([]);
  const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api`; 

  // Dono case handling (rollNo ya rollno)
  const activeRollNo = studentData?.rollNo || studentData?.rollno;
  const activeName = studentData?.name || "Student";

  useEffect(() => {
    const fetchStudentResults = async () => {
      // Agar data parent se abhi aa rha ha, to shuru me khali request rok dega
      if (!activeRollNo) {
        console.log("Waiting for Student Roll Number to load...");
        return;
      }

      try {
        console.log(`Sending API Request for Roll No: ${activeRollNo}`);
        const res = await axios.get(`${API_BASE_URL}/results/my-results/${activeRollNo}`);
        console.log("Response data received:", res.data);
        setResults(res.data);
      } catch (err) {
        console.error("Result fetch error:", err);
      }
    };

    fetchStudentResults();
  }, [activeRollNo]); // Safe dependency check trigger

  const downloadResultPDF = (res) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("UNIVERSITY RESULT CARD", 60, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${activeName}`, 20, 40);
    doc.text(`Roll No: ${activeRollNo}`, 20, 50);
    doc.text(`Department: ${res.department || 'N/A'}`, 20, 60);
    doc.text(`Semester: ${res.semester}`, 20, 70);
    doc.line(20, 80, 190, 80);
    doc.setFontSize(16);
    doc.text(`GPA: ${res.gpa}`, 20, 100);
    doc.text(`CGPA: ${res.cgpa}`, 20, 115);
    doc.save(`Result_${activeRollNo}.pdf`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-black mb-6 text-[#002147]">ACADEMIC HISTORY</h2>
      
      {results.length > 0 ? (
        results.map((res) => (
          <div key={res._id} className="bg-white p-6 rounded-3xl shadow-sm border mb-4 border-slate-100">
            <h4 className="font-bold text-lg text-slate-700">SEMESTER: {res.semester}</h4>
            <p className="text-[#002147] font-semibold mb-4">GPA: {res.gpa} | CGPA: {res.cgpa}</p>
            
            <div className="flex flex-col md:flex-row gap-3">
              <button 
                onClick={() => downloadResultPDF(res)}
                className="bg-[#002147] text-white px-4 py-2 rounded-xl text-sm flex items-center font-bold hover:bg-slate-800 transition"
              >
                <FiDownload className="mr-2" /> Download Result Card
              </button>

              {res.dmcFile && (
                <button 
                  onClick={async () => {
                    try {
                      const fileUrl = `${process.env.REACT_APP_API_URL}/${res.dmcFile}`;
                      const response = await fetch(fileUrl);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = `DMC_${activeRollNo}.pdf`; 
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      a.remove();
                    } catch (error) {
                      window.open(`${process.env.REACT_APP_API_URL}/${res.dmcFile}`, '_blank');
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm flex items-center font-bold hover:bg-green-700 transition"
                >
                  <FiDownload className="mr-2" /> Download Original DMC
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-dashed text-center text-gray-500">
          No results found yet for Roll No: {activeRollNo || "Loading..."}
        </div>
      )}
    </div>
  );
};

export default StudentResult;