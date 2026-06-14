import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Timetable = () => {
    // 'title' field added to state
    const [uploadData, setUploadData] = useState({ title: '', dept: '', semester: '', startDate: '', endDate: '', file: null });
    const [myTimetables, setMyTimetables] = useState([]);
    const [adminTimetables, setAdminTimetables] = useState([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const fetchAllData = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/timetable/list`);
            const data = Array.isArray(res.data) ? res.data : [];
            setMyTimetables(data.filter(t => !t.uploadedBy || t.uploadedBy === 'teacher'));
            setAdminTimetables(data.filter(t => t.uploadedBy === 'admin'));
        } catch (err) {
            toast.error("Error loading data");
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    const handleUpload = async () => {
        if (!uploadData.file || !uploadData.title || !uploadData.dept) {
            return toast.error("Please fill all fields and select a file!");
        }

        const formData = new FormData();
        formData.append('title', uploadData.title); // Title field added
        formData.append('dept', uploadData.dept);
        formData.append('semester', uploadData.semester);
        formData.append('startDate', uploadData.startDate);
        formData.append('endDate', uploadData.endDate);
        formData.append('file', uploadData.file);
        formData.append('uploadedBy', 'teacher');
        
        try {
            // Header added to ensure the file uploads correctly to the backend
            await axios.post(`${process.env.REACT_APP_API_URL}/api/timetable/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Uploaded successfully!");
            setUploadData({ title: '', dept: '', semester: '', startDate: '', endDate: '', file: null });
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

    return (
        <div className="p-2 sm:p-4 md:p-6 w-full">
            <ToastContainer />
            <h2 className="text-2xl font-black text-[#001f3f] uppercase mb-8 italic">
               Timetable <span className="text-[#d4a017]">Management</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {/* 1. UPLOAD */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-t-8 border-[#001f3f]">
                    <h3 className="font-black text-[#001f3f] uppercase text-sm mb-4">UPLOAD TIMETABLE</h3>
                    {/* Title Input added */}
                    <input type="text" placeholder="Timetable Title" className="w-full border-2 border-slate-100 bg-slate-50 p-3 mb-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={uploadData.title} onChange={(e) => setUploadData({...uploadData, title: e.target.value})} />
                    
                    <select className="w-full border-2 border-slate-100 bg-slate-50 p-3 mb-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={uploadData.dept} onChange={(e) => setUploadData({...uploadData, dept: e.target.value})}>
                        <option value="">Department</option>
                        <option value="CS">Computer Science</option>
                        <option value="SE">Software Engineering</option>
                    </select>
                    
                    <input type="number" placeholder="Semester" className="w-full border-2 border-slate-100 bg-slate-50 p-3 mb-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" value={uploadData.semester} onChange={(e) => setUploadData({...uploadData, semester: e.target.value})} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <input type="date" className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" onChange={(e) => setUploadData({...uploadData, startDate: e.target.value})} />
                        <input type="date" className="border-2 border-slate-100 bg-slate-50 p-3 rounded-xl outline-none focus:border-[#001f3f] font-bold text-xs" onChange={(e) => setUploadData({...uploadData, endDate: e.target.value})} />
                    </div>
                    
                    <input type="file" className="w-full mb-4 text-xs font-semibold text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})} />
                    <button onClick={handleUpload} className="w-full bg-[#001f3f] text-[#d4a017] py-3.5 rounded-xl font-black uppercase text-xs tracking-wider shadow-lg hover:opacity-90 transition-all">UPLOAD NOW</button>
                </div>

                {/* 2. SCHEDULE OVERVIEW */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-t-8 border-[#d4a017]">
                    <h3 className="font-black text-[#001f3f] uppercase text-sm mb-4">SCHEDULE OVERVIEW</h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {myTimetables.length > 0 ? myTimetables.map(t => (
                            <div key={t._id} className="border-b border-slate-50 py-3 flex justify-between items-center text-xs">
                                <div>
                                    <p className="font-black text-[#001f3f] uppercase">{t.title || "No Title"}</p>
                                    <p className="text-slate-400 font-bold uppercase mt-0.5">{t.dept} (Sem {t.semester})</p>
                                </div>
                                <div className="flex gap-3 items-center shrink-0">
                                    <a href={`${process.env.REACT_APP_API_URL}/${t.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold uppercase text-[10px]">View</a>
                                    {deleteConfirmId === t._id ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => confirmDelete(t._id)} className="text-red-700 font-black uppercase text-[10px]">Yes</button>
                                            <button onClick={() => setDeleteConfirmId(null)} className="text-gray-400 font-black uppercase text-[10px]">No</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteConfirmId(t._id)} className="text-red-500 font-black uppercase text-[10px]">Delete</button>
                                    )}
                                </div>
                            </div>
                        )) : <p className="text-gray-400 text-xs font-bold italic">No files uploaded.</p>}
                    </div>
                </div>

                {/* 3. ADMIN ASSIGNED */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-t-8 border-purple-600">
                    <h3 className="font-black text-[#001f3f] uppercase text-sm mb-4">ADMIN ASSIGNED</h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {adminTimetables.map(t => (
                            <div key={t._id} className="border-b border-slate-50 py-3 flex justify-between items-center text-xs">
                                <div>
                                    <p className="font-black text-[#001f3f] uppercase">{t.title || "Admin File"}</p>
                                    <p className="text-slate-400 font-bold uppercase mt-0.5">{t.dept} (Sem {t.semester})</p>
                                </div>
                                <a href={`${process.env.REACT_APP_API_URL}/${t.fileUrl}`} target="_blank" rel="noreferrer" className="text-purple-600 underline font-bold uppercase text-[10px] shrink-0">View</a>
                            </div>
                        ))}
                        {adminTimetables.length === 0 && <p className="text-gray-400 text-xs font-bold italic">No admin files assigned.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;