import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', taskType: 'Assignment', dueDate: '' });
    const [editMode, setEditMode] = useState(null); // Edit ke liye state

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        const res = await axios.get('http://localhost:5000/api/tasks/list');
        setTasks(res.data);
    };

    const handleAction = async (id, payload, actionType) => {
        try {
            if (actionType === 'DELETE') {
                await axios.delete(`http://localhost:5000/api/tasks/delete/${id}`);
                toast.error("Task Deleted Successfully!");
            } else {
                await axios.put(`http://localhost:5000/api/tasks/feedback/${id}`, payload);
                toast.success("Feedback Updated Successfully!");
            }
            fetchTasks();
        } catch (err) { toast.error("Error occurred!"); }
    };

    return (
        <div className="p-6">
            <ToastContainer position="top-right" autoClose={2000} />
            
            {/* 1. PORTION: CREATE TASK */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-xl font-bold mb-4 text-blue-900">CREATE TASK</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className="border p-2 rounded" placeholder="Title" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    <input type="date" className="border p-2 rounded" onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                    <select className="border p-2 rounded" onChange={(e) => setFormData({...formData, taskType: e.target.value})}>
                        <option>Assignment</option><option>Quiz</option>
                    </select>
                </div>
                <textarea className="w-full border p-2 mt-4 rounded" placeholder="Description" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <button onClick={async () => { await axios.post('http://localhost:5000/api/tasks/add', formData); fetchTasks(); toast.success("Task Created!"); }} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">CREATE TASK</button>
            </div>

            {/* 2 & 3 PORTION: LIST & REVIEW */}
            <div className="space-y-6">
                {tasks.map(t => (
                    <div key={t._id} className="bg-white p-6 rounded shadow border-l-4 border-blue-900 grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-lg">{t.title} <span className="text-blue-500">({t.taskType})</span></h3>
                            <p className="text-gray-600 text-sm">{t.description}</p>
                            <div className="text-xs text-gray-500 mt-2">
                                <p>Issue: {new Date(t.issueDate).toLocaleDateString()}</p>
                                <p className="text-red-500">Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded">
                            <input type="number" defaultValue={t.grade} id={`grade-${t._id}`} className="w-full border p-2 mb-2" placeholder="Grade" />
                            <textarea defaultValue={t.teacherRemarks} id={`remarks-${t._id}`} className="w-full border p-2 mb-2" placeholder="Remarks" />
                            <div className="flex gap-2">
                                <button onClick={() => handleAction(t._id, { 
                                    grade: document.getElementById(`grade-${t._id}`).value, 
                                    teacherRemarks: document.getElementById(`remarks-${t._id}`).value 
                                }, 'SAVE')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">SAVE FEEDBACK</button>
                                
                                <button onClick={() => handleAction(t._id, null, 'DELETE')} className="text-red-600 font-bold text-sm">DELETE</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Tasks;