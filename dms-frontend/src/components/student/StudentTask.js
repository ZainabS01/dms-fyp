import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const Task = ({ studentData }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (studentData?.department && studentData?.semester) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData]);

  const fetchTasks = async () => {
    try {
      const dept = studentData.department;
      const sem = studentData.semester;
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/list?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const downloadFeedbackPDF = (task) => {
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
    doc.text("ASSIGNMENT FEEDBACK", 105, 29, { align: "center" });
    
    // Reset Color
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 46);

    autoTable(doc, {
        startY: 58,
        headStyles: { fillColor: [0, 31, 63], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { font: 'helvetica', fontSize: 12, cellPadding: 8 },
        head: [['Field', 'Details']],
        body: [
            ['Task Title', task.title],
            ['Task Type', task.taskType || "Assignment"],
            ['Grade', task.grade || "N/A"],
            ['Remarks', task.teacherRemarks || "No remarks provided"]
        ]
    });
    doc.save(`${task.title}_Feedback.pdf`);
  };

  const handleFileUpload = async (taskId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('submissionFile', file);
    formData.append('studentId', studentData._id);
    formData.append('studentName', studentData.name);
    
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/submit/${taskId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Assignment Submitted Successfully!");
      fetchTasks();
    } catch (err) {
      toast.error("Upload failed! Check backend folder/config.");
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <ToastContainer position="top-right" autoClose={2000} />
      <h3 className="text-xl md:text-2xl font-black text-[#002147] mb-6">Current Assignments & Tasks</h3>
      
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-lg">{task.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{task.description}</p>
                  <div className="text-xs text-slate-400 font-bold uppercase mt-3 space-y-1">
                    <p>Assigned By: <span className="text-[#001f3f]">{task.teacherName || 'Unknown'}</span></p>
                    <p>Subject: <span className="text-[#001f3f]">{task.subject || 'General'}</span></p>
                    <p>Start Date: {new Date(task.issueDate).toLocaleDateString()} | Deadline: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="self-start px-4 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-600">
                  {task.taskType}
                </span>
              </div>
 
              {/* Feedback and Submission Status Section */}
              {(() => {
                const mySubmission = task.submissions?.find(s => s.studentId === studentData._id);
                if (mySubmission) {
                  return (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs font-black text-blue-700 uppercase">Status: {mySubmission.status}</p>
                      
                      {/* Feedback Section (Visible if teacher has graded) */}
                      {mySubmission.grade && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <p className="text-sm mt-1"><strong>Grade:</strong> <span className="font-black text-green-600">{mySubmission.grade}</span></p>
                          <p className="text-sm text-gray-700 mt-1"><strong>Remarks:</strong> <span className="font-bold text-[#001f3f]">{mySubmission.remarks || "None"}</span></p>
                          
                          <div className="flex flex-wrap gap-4 mt-2">
                            <a href={`${process.env.REACT_APP_API_URL}/uploads/${mySubmission.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 font-black uppercase text-[10px] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                              View Submission
                            </a>
                            <button onClick={() => downloadFeedbackPDF({...task, grade: mySubmission.grade, teacherRemarks: mySubmission.remarks})} className="text-green-600 font-black uppercase text-[10px] bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                              Download Feedback PDF
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              {/* File Upload Section */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-500 uppercase">Upload Submission (PDF):</label>
                <input 
                  type="file" 
                  className="block w-full mt-2 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  onChange={(e) => handleFileUpload(task._id, e.target.files[0])} 
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 font-bold text-center py-10">No tasks assigned for this semester.</p>
      )}
    </div>
  );
};

export default Task;