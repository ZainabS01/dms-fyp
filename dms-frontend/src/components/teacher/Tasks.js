import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft } from 'lucide-react';
import { DEPARTMENTS_LIST, SEMESTERS_LIST } from '../../constants/data';

const Tasks = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [formData, setFormData] = useState({ 
        title: '', description: '', subject: '', taskType: 'Assignment', issueDate: '', dueDate: '', department: '', semester: ''
    });
    
    // Modals state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null });
    const [editModal, setEditModal] = useState({ isOpen: false, data: null });
    useEffect(() => { 
        fetchTasks(); 
    }, [user]);

    const fetchTasks = async () => {
        try {
            const teacherId = user?._id || user?.id;
            if (!teacherId) return;
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/list?teacherId=${teacherId}`);
            setTasks(res.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    };

    const handleCreateTask = async () => {
        try {
            const titlePrefix = (user?.gender === 'Male' || user?.user?.gender === 'Male') ? 'Sir' : 'Mam';
            const payload = {
                ...formData,
                teacherId: user?._id || user?.id || user?.user?._id || user?.user?.id,
                teacherName: `${titlePrefix} ${user?.name || user?.user?.name || 'Unknown'}`
            };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/add`, payload);
            fetchTasks();
            toast.success("Task Created Successfully!");
            setFormData({ title: '', description: '', subject: '', taskType: 'Assignment', issueDate: '', dueDate: '', department: '', semester: '' });
        } catch (err) {
            toast.error("Error! Make sure all fields are filled.");
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/delete/${deleteModal.taskId}`);
            toast.error("Task Deleted Successfully!");
            setDeleteModal({ isOpen: false, taskId: null });
            fetchTasks();
        } catch (err) { toast.error("Error deleting task!"); }
    };

    const handleEditSubmit = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/update/${editModal.data._id}`, editModal.data);
            toast.success("Task Updated Successfully!");
            setEditModal({ isOpen: false, data: null });
            fetchTasks();
        } catch (err) { toast.error("Error updating task!"); }
    };

    const handleAction = async (taskId, studentId, payload, actionType) => {
        try {
            if (actionType === 'SAVE') {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/feedback/${taskId}/${studentId}`, payload);
                toast.success("Feedback Updated Successfully!");
            }
            fetchTasks();
        } catch (err) { toast.error("Error occurred!"); }
    };

    return (
        <div className="p-2 sm:p-4 md:p-6 w-full">
            <ToastContainer position="top-right" autoClose={2000} />
            
            <h2 className="text-2xl font-black text-[#001f3f] uppercase mb-6">
                Tasks <span className="text-[#d4a017]">Management</span>
            </h2>
            
            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
                        <h3 className="text-xl font-black text-[#001f3f] mb-2">Delete Task?</h3>
                        <p className="text-xs text-slate-500 font-bold mb-6">Are you sure you want to permanently delete this task?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal({ isOpen: false, taskId: null })} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl max-w-xl w-full">
                        <h3 className="text-xl font-black text-[#001f3f] mb-6">✏️ Edit Task</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Title</label>
                                <input className="w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={editModal.data.title} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, title: e.target.value}})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Subject</label>
                                <input className="w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={editModal.data.subject} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, subject: e.target.value}})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Department</label>
                                <select className="w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={editModal.data.department} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, department: e.target.value}})}>
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Semester</label>
                                <select className="w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={editModal.data.semester} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, semester: e.target.value}})}>
                                    <option value="">Select Semester</option>
                                    {SEMESTERS_LIST.map(n => <option key={n} value={n}>{n} Semester</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Start Date</label>
                                <input type="date" className="w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={editModal.data.issueDate ? editModal.data.issueDate.split('T')[0] : ''} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, issueDate: e.target.value}})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Due Date</label>
                                <input type="date" className="w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={editModal.data.dueDate ? editModal.data.dueDate.split('T')[0] : ''} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, dueDate: e.target.value}})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Task Type</label>
                                <select className="w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={editModal.data.taskType} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, taskType: e.target.value}})}>
                                    <option value="Assignment">Assignment</option>
                                    <option value="Quiz">Quiz</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description</label>
                            <textarea className="w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs h-24" value={editModal.data.description} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, description: e.target.value}})} />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setEditModal({ isOpen: false, data: null })} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleEditSubmit} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE TASK SECTION */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-t-8 border-[#001f3f] mb-8">
                <h2 className="text-lg font-black text-[#001f3f] uppercase mb-4">CREATE TASK</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                    <input className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" placeholder="Task Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    
                    <input className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" placeholder="Subject" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />

                    <select className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                        <option value="">Select Department</option>
                        {DEPARTMENTS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <select className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                        <option value="">Select Sem</option>
                        {SEMESTERS_LIST.map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                        ))}
                    </select>

                    <input type="date" className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" title="Start Date" value={formData.issueDate} onChange={(e) => setFormData({...formData, issueDate: e.target.value})} />

                    <input type="date" className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" title="Due Date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                    
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
                                <h3 className="font-black text-lg text-[#001f3f] uppercase">{t.title} <span className="text-blue-500 font-bold">({t.taskType})</span></h3>
                                <p className="text-slate-500 text-xs mt-1">{t.description}</p>
                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-2 space-y-0.5">
                                    <p>Subject: {t.subject || 'General'} | Dept: {t.department} | Sem: {t.semester}</p>
                                    <p>Start: {new Date(t.issueDate).toLocaleDateString()} | Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => setEditModal({ isOpen: true, data: t })} className="bg-blue-500 hover:bg-blue-600 transition-colors text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl">EDIT</button>
                                <button onClick={() => setDeleteModal({ isOpen: true, taskId: t._id })} className="bg-red-500 hover:bg-red-600 transition-colors text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl">DELETE TASK</button>
                            </div>
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
                                                <a href={`${process.env.REACT_APP_API_URL}/uploads/${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 font-black uppercase text-[10px] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors mt-2 inline-block">
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
                                <p className="text-xs text-slate-400 font-bold">No submissions yet.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tasks;