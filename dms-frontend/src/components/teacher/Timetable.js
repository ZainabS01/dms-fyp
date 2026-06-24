import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { ArrowLeft } from 'lucide-react';

const Timetable = () => {
    const [adminTimetables, setAdminTimetables] = useState([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const fetchAllData = async () => {
        try {
            const rawUser = localStorage.getItem('user');
            let userDept = '';
            if (rawUser) {
                const parsedUser = JSON.parse(rawUser);
                if (parsedUser.department) {
                    userDept = parsedUser.department;
                }
            }

            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/timetable/list`);
            const data = Array.isArray(res.data) ? res.data : [];
            // Filter only timetables uploaded by admin for this teacher's department and audience is 'teacher' or 'both' or undefined (legacy)
            setAdminTimetables(data.filter(t => {
                const tDept = t.department ? t.department.trim().toUpperCase() : "";
                const uDept = userDept ? userDept.trim().toUpperCase() : "";
                const tAudience = t.audience ? t.audience.trim().toLowerCase() : "";
                
                // Remove 'BS ' prefix for flexible matching
                const cleanTDept = tDept.replace(/^BS\s+/i, '').trim();
                const cleanUDept = uDept.replace(/^BS\s+/i, '').trim();
                
                // Match if exact, or if one includes the other (ignoring BS), or if teacher is GENERAL
                const isDeptMatch = !uDept || uDept === 'GENERAL' || cleanTDept === cleanUDept || cleanTDept.includes(cleanUDept) || cleanUDept.includes(cleanTDept);
                
                return t.uploadedBy === 'admin' && isDeptMatch && (!tAudience || tAudience === 'teacher' || tAudience === 'both');
            }));
        } catch (err) {
            toast.error("Error loading data");
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

    useEffect(() => { fetchAllData(); }, []);



    return (
        <div className="p-0 sm:p-0 md:p-0 w-full">
            <ToastContainer />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl">
                {/* ADMIN ASSIGNED OVERVIEW */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 border-t-8 border-[#d4a017]">
                    <h3 className="font-black text-[#001f3f] uppercase text-sm mb-4">MY TIMETABLES</h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {adminTimetables.length > 0 ? adminTimetables.map(t => (
                            <div key={t._id} className="border-b border-slate-50 py-3 flex justify-between items-center text-xs">
                                <div>
                                    <p className="font-black text-[#001f3f] uppercase">{t.title || "No Title"}</p>
                                    <p className="text-slate-400 font-bold uppercase mt-0.5">{t.department}</p>
                                </div>
                                <div className="flex gap-3 items-center shrink-0">
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
                        )) : <p className="text-gray-400 text-xs font-bold">No timetables assigned to your department yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;