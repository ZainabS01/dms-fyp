import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiFolder, FiArrowRight, FiActivity, FiDownload, FiEye, FiFileText, FiX 
} from 'react-icons/fi';

const StudentCourseData = ({ selectedDept, selectedSem }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // --- CRITICAL FIX ---
        // If props are empty, manually specify the string used on the Teacher side
        const dept = selectedDept || "Computer Science"; 
        const sem = selectedSem || "8th Sem";

        console.log(`Fetching for: ${dept} and ${sem}`); // For debugging

        const res = await axios.get(`http://localhost:5000/api/subjects/${dept}/${sem}`);
        setSubjects(res.data);
      } catch (err) {
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDept, selectedSem]);

  return (
    <div className="space-y-8">
      {/* --- TOP STATUS BAR --- */}
      <div className="flex items-center justify-between bg-white/50 p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#d4a017]/10 text-[#d4a017] rounded-xl flex items-center justify-center">
            <FiActivity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Academic Status</p>
            <p className="text-xs font-black text-[#001f3f] uppercase mt-1">
              {loading ? "Syncing with Server..." : `${subjects.length} Courses Found`}
            </p>
          </div>
        </div>
        {/* Sync Indicator */}
        {!loading && subjects.length > 0 && (
          <div className="hidden md:block px-4 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">
            ● Live Data
          </div>
        )}
      </div>

      {/* --- COURSES GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subjects.length > 0 ? (
          subjects.map((sub) => (
            <div 
              key={sub._id} 
              onClick={() => setSelectedSubject(sub)}
              className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-100 group hover:border-[#d4a017] transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-[#001f3f] group-hover:text-[#d4a017] transition-all duration-500">
                <FiFolder size={28} />
              </div>

              <h4 className="font-black text-[#001f3f] text-sm uppercase mb-1 leading-tight group-hover:text-[#d4a017] transition-colors">
                {sub.title}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Code: {sub.code} • {sub.categories?.length || 0} Folders
              </p>

              <button className="mt-5 flex items-center gap-2 text-[10px] font-black text-[#d4a017] group-hover:text-[#001f3f] uppercase tracking-widest transition-colors">
                View Material <FiArrowRight strokeWidth={3} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-inner">
             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <FiFileText size={30} className="text-slate-200" />
             </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">
              {loading ? "Searching Database..." : "No data found. Please check Department & Semester."}
            </p>
          </div>
        )}
      </div>

      {/* --- MODAL (Download & View Logic) --- */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-[#001f3f]/95 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3.5rem] overflow-hidden shadow-2xl relative flex flex-col border border-white/20">
            
            <div className="p-4 sm:p-10 bg-slate-50/50 border-b flex justify-between items-center gap-4">
              <div>
                <p className="text-[10px] font-black text-[#d4a017] uppercase tracking-[0.4em] mb-1">Subject Resources</p>
                <h3 className="text-xl sm:text-2xl font-black text-[#001f3f] uppercase italic leading-tight">{selectedSubject.title}</h3>
              </div>
              <button onClick={() => setSelectedSubject(null)} className="p-3 sm:p-4 bg-white text-slate-400 hover:text-red-500 rounded-2xl shadow-sm transition-all border border-slate-100 hover:rotate-90 shrink-0">
                <FiX size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 custom-scrollbar">
              {selectedSubject.categories?.map((cat) => (
                <div key={cat._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="p-2 bg-yellow-50 text-[#d4a017] rounded-lg"><FiFolder size={18} /></div>
                    <h5 className="font-black text-[#001f3f] text-[11px] uppercase tracking-widest">{cat.name}</h5>
                  </div>
                  
                  <div className="space-y-3">
                    {cat.files?.map((file) => (
                      <div key={file._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-[#001f3f] transition-all duration-300">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FiFileText className="text-[#d4a017] shrink-0" size={16} />
                          <span className="text-[10px] font-bold text-[#001f3f] group-hover:text-white truncate max-w-[120px]">{file.fileName}</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a href={`http://localhost:5000${file.fileUrl}`} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center bg-white text-blue-500 rounded-lg hover:scale-110 transition-all shadow-sm">
                            <FiEye size={14} />
                          </a>
                          <a href={`http://localhost:5000${file.fileUrl}`} download={file.fileName} className="w-8 h-8 flex items-center justify-center bg-white text-[#d4a017] rounded-lg hover:scale-110 transition-all shadow-sm">
                            <FiDownload size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                    {(!cat.files || cat.files.length === 0) && (
                      <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-2xl">
                         <p className="text-[9px] text-slate-300 font-bold uppercase italic">Empty Folder</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourseData;