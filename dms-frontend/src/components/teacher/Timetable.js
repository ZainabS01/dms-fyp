import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

const Timetable = () => {
    const [uploadData, setUploadData] = useState({ dept: '', semester: '', file: null });

    const handleUpload = () => {
        // Yahan aapki API call aayegi (Axios)
        toast.success(`Timetable uploaded for ${uploadData.dept} - Semester ${uploadData.semester}`);
    };

    return (
        <div className="p-6">
            <ToastContainer />
            
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-blue-900">TIMETABLE MANAGEMENT</h2>
                <p className="text-gray-600">View your schedule or upload new timetables for students.</p>
            </div>

            {/* Grid Layout: Left for Upload, Right for View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. UPLOAD SECTION */}
                <div className="bg-white p-6 rounded shadow border-t-4 border-blue-600">
                    <h3 className="text-lg font-bold mb-4">UPLOAD TIMETABLE</h3>
                    <div className="space-y-4">
                        <select className="w-full border p-2 rounded" onChange={(e) => setUploadData({...uploadData, dept: e.target.value})}>
                            <option>Select Department</option>
                            <option>Computer Science</option>
                            <option>Software Engineering</option>
                        </select>
                        <input type="number" placeholder="Semester (e.g., 4)" className="w-full border p-2 rounded" onChange={(e) => setUploadData({...uploadData, semester: e.target.value})} />
                        <input type="file" className="w-full border p-2 rounded" onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})} />
                        <button onClick={handleUpload} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">UPLOAD NOW</button>
                    </div>
                </div>

                {/* 2. VIEW SECTION */}
                <div className="bg-white p-6 rounded shadow border-t-4 border-green-600">
                    <h3 className="text-lg font-bold mb-4">YOUR SCHEDULE (VIEW)</h3>
                    <div className="h-48 overflow-y-auto border p-4 bg-gray-50 rounded text-sm">
                        <p className="text-gray-500 italic">No timetable assigned yet...</p>
                        {/* Yahan API se fetch kiya hua schedule map hoga */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;