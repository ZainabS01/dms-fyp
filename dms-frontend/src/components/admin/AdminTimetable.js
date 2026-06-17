import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronDown } from 'lucide-react';
import { DEPARTMENTS_LIST, SEMESTERS_LIST } from '../../constants/data';

const AdminTimetable = () => {
    const [uploadData, setUploadData] = useState({ title: '', dept: '', audience: '', semester: '', startDate: '', endDate: '', file: null });
    const [timetables, setTimetables] = useState([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const fetchAllData = async () => {
        try {
            const ttRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/timetable/list`);
            setTimetables(Array.isArray(ttRes.data) ? ttRes.data : []);
        } catch (err) {
            toast.error("Error loading timetables!");
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    const handleUpload = async () => {
        if (!uploadData.file || !uploadData.title || !uploadData.dept || !uploadData.audience) {
            return toast.error("Please fill all fields and select a file!");
        }
        if (uploadData.audience === 'student' && !uploadData.semester) {
            return toast.error("Please enter a semester for students!");
        }

        const formData = new FormData();
        formData.append('title', uploadData.title);
        formData.append('dept', uploadData.dept);
        formData.append('audience', uploadData.audience);
        if (uploadData.audience === 'student') {
            formData.append('semester', uploadData.semester);
        }
        formData.append('startDate', uploadData.startDate);
        formData.append('endDate', uploadData.endDate);
        formData.append('file', uploadData.file);
        formData.append('uploadedBy', 'admin');
        
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/timetable/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Uploaded successfully!");
            setUploadData({ title: '', dept: '', audience: '', semester: '', startDate: '', endDate: '', file: null });
            fetchAllData(); 
        } catch (err) { 
            console.error(err);
            toast.error("Upload failed!"); 
        }
    };

    const confirmDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/timetable/delete/${id}`);
            toast.success("Deleted successfully!");
            setDeleteConfirmId(null);
            fetchAllData();
        } catch (err) { toast.error("Delete failed!"); }
    };

    const adminTimetables = timetables.filter(t => t.uploadedBy === 'admin');


    return (
        <div className="p-2 sm:p-4 md:p-6 w-full animate-fadeIn pb-[20vh]">
            <ToastContainer />
            <h2 className="text-2xl font-black text-[#001f3f] uppercase mb-8">
                Timetable <span className="text-[#d4a017]">Management</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl">
                {/* 1. UPLOAD */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-t-8 border-[#001f3f]">
                    <h3 className="font-black text-[#001f3f] uppercase text-sm mb-4">UPLOAD TIMETABLE</h3>
                    
                    <input type="text" placeholder="Timetable Title" className="w-full border-2 border-slate-100 bg-slate-50 p-3 mb-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={uploadData.title} onChange={(e) => setUploadData({...uploadData, title: e.target.value})} />
                    
                    {/* Native Select for simplicity but you can add custom if preferred, native is fine here as it's not a small fixed container */}
                    <select 
                        value={uploadData.dept} 
                        onChange={(e) => setUploadData({...uploadData, dept: e.target.value})} 
                        className="w-full border-2 border-slate-100 bg-slate-50 p-3 mb-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs appearance-none"
                    >
                        <option value="">Select Department</option>
                        {DEPARTMENTS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <select 
                        value={uploadData.audience} 
                        onChange={(e) => setUploadData({...uploadData, audience: e.target.value})} 
                        className="w-full border-2 border-slate-100 bg-slate-50 p-3 mb-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs appearance-none"
                    >
                        <option value="">Share with (Teacher/Student)</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                    </select>

                    {uploadData.audience === 'student' && (
                        <select 
                            value={uploadData.semester} 
                            onChange={(e) => setUploadData({...uploadData, semester: e.target.value})} 
                            className="w-full border-2 border-slate-100 bg-slate-50 p-3 mb-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs appearance-none"
                        >
                            <option value="">Select Semester</option>
                            {SEMESTERS_LIST.map(s => <option key={s} value={s}>{s} Semester</option>)}
                        </select>
                    )}
                    

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <input type="date" className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" onChange={(e) => setUploadData({...uploadData, startDate: e.target.value})} />
                        <input type="date" className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" onChange={(e) => setUploadData({...uploadData, endDate: e.target.value})} />
                    </div>
                    
                    <input type="file" className="w-full mb-4 text-xs font-semibold text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})} />
                    <button onClick={handleUpload} className="w-full bg-[#001f3f] text-[#d4a017] py-3.5 rounded-xl font-black uppercase text-xs tracking-wider shadow-lg hover:opacity-90 transition-all">UPLOAD NOW</button>
                </div>

                {/* 2. ADMIN UPLOADED OVERVIEW */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-t-8 border-[#d4a017]">
                    <h3 className="font-black text-[#001f3f] uppercase text-sm mb-4">HISTORY</h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {adminTimetables.length > 0 ? adminTimetables.map(t => (
                            <div key={t._id} className="border-b border-slate-50 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="font-black text-[#001f3f] uppercase truncate">{t.title || "No Title"}</p>
                                    <div className="flex flex-col mt-1 gap-0.5">
                                        <span className="text-slate-400 font-black uppercase text-[10px]">Target: {t.audience || 'Unknown'}</span>
                                        <span className="text-slate-500 font-bold uppercase text-[10px] truncate">Dept: {t.department} {t.audience === 'student' ? `(Sem ${t.semester})` : ''}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 sm:gap-3 items-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                    <a href={`${process.env.REACT_APP_API_URL}/${t.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 font-black uppercase text-[10px] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">View</a>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`${process.env.REACT_APP_API_URL}/${t.fileUrl}`);
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', t.title || 'timetable');
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                            } catch (err) {
                                                window.open(`${process.env.REACT_APP_API_URL}/${t.fileUrl}`, '_blank');
                                            }
                                        }}
                                        className="text-green-600 font-black uppercase text-[10px] bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Download
                                    </button>
                                    {deleteConfirmId === t._id ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => confirmDelete(t._id)} className="text-red-700 font-black uppercase text-[10px] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">Yes</button>
                                            <button onClick={() => setDeleteConfirmId(null)} className="text-slate-500 font-black uppercase text-[10px] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">No</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteConfirmId(t._id)} className="text-red-600 font-black uppercase text-[10px] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                                    )}
                                </div>
                            </div>
                        )) : <p className="text-gray-400 text-xs font-bold">No admin files uploaded.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTimetable;
