import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiEye, FiFileText } from 'react-icons/fi';

const StudentTimetable = ({ studentData }) => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetables = async () => {
      if (!studentData?.department || !studentData?.semester) return;
      try {
        const dept = studentData.department;
        const sem = studentData.semester;
        // Important: Check the URL (Prefix set in the backend)
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/timetable/list?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}`); 
        const allData = Array.isArray(res.data) ? res.data : [];
        setTimetables(allData.filter(t => !t.audience || t.audience === 'student' || t.audience === 'both'));
      } catch (err) {
        console.error("Error details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetables();
  }, [studentData]);

  if (loading) return <div className="p-10 text-center font-black">Loading Data...</div>;

  return (
    <div className="p-2 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-black text-[#001f3f] uppercase mb-8">Class <span className="text-[#d4a017]">Timetable</span></h2>
      
      {timetables.length === 0 ? (
        <div className="text-red-500 font-bold p-4 bg-red-50 rounded-xl">No timetable has been uploaded.</div>
      ) : (
        <div className="grid gap-6">
 {/* Only update the map function part */}
{timetables.map((item) => {
  // Download function to prevent redirection to a new tab
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/${fileUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'timetable.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove(); // Cleanup
    } catch (err) {
      console.error("Download failed:", err);
      // If direct download fails, fallback to standard link
      window.open(`${process.env.REACT_APP_API_URL}/${fileUrl}`, '_blank');
    }
  };

  return (
    <div key={item._id} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shrink-0"><FiFileText size={24} /></div>
        <div>
          <h4 className="font-black text-[#001f3f] uppercase line-clamp-2 md:line-clamp-none">
            {item.title && item.title.trim() !== "" 
              ? item.title 
              : `${item.dept || 'General'} - Semester ${item.semester || 'N/A'}`}
          </h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
            {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex gap-3 md:justify-end w-full md:w-auto">
        {/* VIEW BUTTON - This will open in a new tab */}
        <a href={`${process.env.REACT_APP_API_URL}/${item.fileUrl}`} target="_blank" rel="noreferrer" 
           className="bg-slate-100 p-3 rounded-xl text-slate-600 hover:bg-slate-200 transition-all">
          <FiEye size={20} />
        </a>
        
        {/* DOWNLOAD BUTTON - This will trigger a direct download */}
        <button 
          onClick={() => handleDownload(item.fileUrl, item.title || 'timetable')}
          className="bg-[#d4a017]/10 p-3 rounded-xl text-[#001f3f] hover:bg-[#d4a017] hover:text-white transition-all cursor-pointer"
        >
          <FiDownload size={20} />
        </button>
      </div>
    </div>
  );
})}
        </div>
      )}
    </div>
  );
};

export default StudentTimetable;