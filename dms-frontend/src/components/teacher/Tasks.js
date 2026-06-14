import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [formData, setFormData] = useState({ 
        title: '', description: '', taskType: 'Assignment', dueDate: '', department: '', semester: '' 
    });

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/list`);
            setTasks(res.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    };

    const handleCreateTask = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/add`, formData);
            fetchTasks();
            toast.success("Task Created Successfully!");
            setFormData({ title: '', description: '', taskType: 'Assignment', dueDate: '', department: '', semester: '' });
        } catch (err) {
            toast.error("Error! Make sure all fields (Dept/Sem) are filled.");
        }
    };

    const handleAction = async (taskId, studentId, payload, actionType) => {
        try {
            if (actionType === 'DELETE') {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/delete/${taskId}`);
                toast.error("Task Deleted Successfully!");
            } else {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/feedback/${taskId}/${studentId}`, payload);
                toast.success("Feedback Updated Successfully!");
            }
            fetchTasks();
        } catch (err) { toast.error("Error occurred!"); }
    };

    return (
        <div className="p-2 sm:p-4 md:p-6 w-full">
            <ToastContainer position="top-right" autoClose={2000} />
            
            {/* CREATE TASK SECTION */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-t-8 border-[#001f3f] mb-8">
                <h2 className="text-lg font-black text-[#001f3f] uppercase mb-4">CREATE TASK</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <input className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    
                    <select className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                        <option value="">Select Dept</option>
                        <option value="BSCS">BSCS</option>
                        <option value="BSSE">BSSE</option>
                        <option value="BSAI">BSAI</option>
                    </select>

                    <select className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                        <option value="">Select Sem</option>
                        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                    </select>

                    <input type="date" className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                    
                    <select className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" onChange={(e) => setFormData({...formData, taskType: e.target.value})}>
                        <option value="Assignment">Assignment</option>
                        <option value="Quiz">Quiz</option>
                    </select>
                </div>
                <textarea className="w-full border-2 border-slate-100 bg-slate-50 p-3 mt-4 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs h-24" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <button onClick={handleCreateTask} className="mt-4 bg-[#001f3f] text-[#d4a017] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-all">CREATE TASK</button>
            </div>

            {/* LIST & REVIEW SECTION */}
            <div className="space-y-6">
                {tasks.map(t => (
                    <div key={t._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-8 border-[#001f3f]">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                            <div>
                                <h3 className="font-black text-lg text-[#001f3f] uppercase italic">{t.title} <span className="text-blue-500 font-bold">({t.taskType})</span></h3>
                                <p className="text-slate-500 text-xs mt-1">{t.description}</p>
                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-2 space-y-0.5">
                                    <p>Dept: {t.department} | Sem: {t.semester}</p>
                                    <p>Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => handleAction(t._id, null, null, 'DELETE')} className="bg-red-500 hover:bg-red-600 transition-colors text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl shrink-0">DELETE TASK</button>
                        </div>
                        
                        {/* SUBMISSIONS LIST */}
                        <div className="mt-6 border-t border-slate-50 pt-4">
                            <h4 className="font-black text-xs text-[#001f3f] uppercase tracking-wider mb-4">Student Submissions ({t.submissions?.length || 0})</h4>
                            
                            {t.submissions && t.submissions.length > 0 ? (
                                <div className="space-y-4">
                                    {t.submissions.map(sub => (
                                        <div key={sub.studentId} className="bg-slate-50 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center border border-slate-100">
                                            <div>
                                                <p className="font-black text-sm text-[#001f3f] uppercase">{sub.studentName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Status: <span className={sub.status === 'Checked' ? 'text-green-600' : 'text-[#d4a017]'}>{sub.status}</span></p>
                                                <a href={`${process.env.REACT_APP_API_URL}/uploads/${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline text-[10px] uppercase mt-2 inline-block">
                                                    📥 Download Submission
                                                </a>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <input type="number" id={`grade-${t._id}-${sub.studentId}`} defaultValue={sub.grade || ''} className="border-2 border-slate-100 bg-white p-2.5 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" placeholder="Grade (e.g. 10)" />
                                                <textarea id={`remarks-${t._id}-${sub.studentId}`} defaultValue={sub.remarks || ''} className="border-2 border-slate-100 bg-white p-2.5 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs h-12" placeholder="Remarks" />
                                                <button onClick={() => handleAction(t._id, sub.studentId, { 
                                                    grade: document.getElementById(`grade-${t._id}-${sub.studentId}`).value, 
                                                    teacherRemarks: document.getElementById(`remarks-${t._id}-${sub.studentId}`).value 
                                                }, 'SAVE')} className="bg-green-600 hover:bg-green-700 transition-colors text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider w-fit">
                                                    SAVE GRADE
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 font-bold italic">No submissions yet.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tasks;