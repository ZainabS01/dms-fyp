import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from "jspdf"; // PDF generate karne ke liye

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

  // PDF Generator Function
  const downloadFeedbackPDF = (task) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Assignment Feedback", 20, 20);
    doc.setFontSize(12);
    doc.text(`Task Title: ${task.title}`, 20, 40);
    doc.text(`Grade: ${task.grade || "N/A"}`, 20, 50);
    doc.text(`Remarks: ${task.teacherRemarks || "No remarks provided"}`, 20, 60);
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
                  <p className="text-xs text-slate-400 font-bold uppercase mt-3">
                    Deadline: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
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
                          <p className="text-sm"><strong>Grade:</strong> {mySubmission.grade}</p>
                          <p className="text-sm text-gray-700"><strong>Remarks:</strong> {mySubmission.remarks}</p>
                          
                          <div className="flex flex-wrap gap-4 mt-2">
                            <a href={`${process.env.REACT_APP_API_URL}/uploads/${mySubmission.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs font-bold">
                              View Submission
                            </a>
                            <button onClick={() => downloadFeedbackPDF({...task, grade: mySubmission.grade, teacherRemarks: mySubmission.remarks})} className="text-green-600 underline text-xs font-bold text-left">
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