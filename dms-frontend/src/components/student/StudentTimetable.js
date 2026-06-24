import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiEye, FiFileText, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StudentTimetable = ({ studentData }) => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, idToDelete: null });

  const confirmDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/timetable/delete/${modal.idToDelete}`);
      toast.success("Timetable deleted successfully!");
      setTimetables(timetables.filter(t => t._id !== modal.idToDelete));
    } catch (err) {
      toast.error("Failed to delete timetable.");
    } finally {
      setModal({ isOpen: false, idToDelete: null });
    }
  };

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
    <div className="p-0 sm:p-0">
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-black text-[#001f3f] mb-2">Delete Timetable?</h3>
            <p className="text-xs text-slate-500 font-bold mb-6">Are you sure you want to permanently delete this timetable? It will be removed for everyone.</p>
            <div className="flex gap-3">
              <button onClick={() => setModal({ isOpen: false, idToDelete: null })} className="flex-1 py-3 bg-slate-100 font-bold rounded-lg text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}


      
      {timetables.length === 0 ? (
        <div className="text-red-500 font-bold p-4 bg-red-50 rounded-lg">No timetable has been uploaded.</div>
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
    <div key={item._id} className="bg-white p-6 rounded-lg shadow-lg border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-blue-600 shrink-0"><FiFileText size={24} /></div>
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
           className="bg-slate-100 p-3 rounded-lg text-slate-600 hover:bg-slate-200 transition-all">
          <FiEye size={20} />
        </a>
        
        {/* DOWNLOAD BUTTON - This will trigger a direct download */}
        <button 
          onClick={() => handleDownload(item.fileUrl, item.title || 'timetable')}
          className="bg-[#d4a017]/10 p-3 rounded-lg text-[#001f3f] hover:bg-[#d4a017] hover:text-white transition-all cursor-pointer"
        >
          <FiDownload size={20} />
        </button>
        {/* DELETE BUTTON */}
        <button 
          onClick={() => setModal({ isOpen: true, idToDelete: item._id })}
          className="bg-red-50 p-3 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
        >
          <FiTrash2 size={20} />
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