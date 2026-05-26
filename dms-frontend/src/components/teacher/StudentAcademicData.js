import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiBookOpen, FiPlus, FiFolder, FiUpload, FiFileText, 
  FiChevronDown, FiX, FiDownload, FiEye, FiTrash2, FiEdit2, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';

const StudentAcademicData = () => {
  const [selectedDept, setSelectedDept] = useState('Computer Science');
  const [selectedSem, setSelectedSem] = useState('8th Sem');
  const [subjects, setSubjects] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [activeSubCode, setActiveSubCode] = useState(null);

  const [newSub, setNewSub] = useState({ code: '', title: '', cr: '' });
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', id: '', subCode: '', title: '' });
  const [editFolderModal, setEditFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState({ id: '', name: '', subCode: '' });

  const [editSubjectModal, setEditSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState({ oldCode: '', code: '', title: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 2500);
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, selectedSem]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/subjects/${selectedDept}/${selectedSem}`);
      setSubjects(res.data);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  const handleAddSubject = async () => {
    if (!newSub.code || !newSub.title) return;
    try {
      await axios.post('http://localhost:5000/api/subjects/add', {
        ...newSub, department: selectedDept, semester: selectedSem
      });
      showToast("Subject Added!");
      setShowSubjectModal(false);
      setNewSub({ code: '', title: '', cr: '' });
      fetchData();
    } catch (err) { showToast("Error adding subject", "error"); }
  };

  const handleUpdateSubject = async () => {
    try {
      await axios.put(`http://localhost:5000/api/subjects/edit/${editingSubject.oldCode}`, {
        code: editingSubject.code,
        title: editingSubject.title
      });
      showToast("Subject Updated!");
      setEditSubjectModal(false);
      fetchData();
    } catch (err) { showToast("Update failed", "error"); }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/subjects/delete/${id}`);
      showToast("Subject Deleted", "error");
      fetchData();
    } catch (err) { showToast("Delete failed", "error"); }
  };

  const handleAddCategory = async () => {
    if (!newFolderName || !activeSubCode) return;
    try {
      await axios.post(`http://localhost:5000/api/subjects/category/add`, {
        subCode: activeSubCode,
        categoryName: newFolderName
      });
      showToast(`${newFolderName} Folder Created!`);
      setShowFolderModal(false);
      setNewFolderName('');
      fetchData();
    } catch (err) { showToast("Folder creation failed!", "error"); }
  };

  const handleDeleteFolder = async (subCode, catId) => {
    try {
      await axios.delete(`http://localhost:5000/api/subjects/category/${subCode}/${catId}`);
      showToast("Folder Deleted", "success");
      fetchData();
    } catch (err) {
      showToast("Delete failed!", "error");
    }
  };

  const handleRenameFolder = async () => {
    try {
      await axios.put(`http://localhost:5000/api/subjects/category/rename`, {
        subCode: editingFolder.subCode,
        catId: editingFolder.id,
        newName: editingFolder.name
      });
      showToast("Folder Renamed!");
      setEditFolderModal(false);
      fetchData();
    } catch (err) { showToast("Rename failed", "error"); }
  };

  const handleFileUpload = async (subCode, catId, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file); fd.append('subCode', subCode); fd.append('catId', catId);
    try {
      await axios.post('http://localhost:5000/api/subjects/upload', fd);
      showToast("File Uploaded!");
      fetchData();
    } catch (err) { showToast("Upload failed!", "error"); }
  };

  const handleDeleteFile = async (subCode, catId, fileId) => {
    try {
      await axios.delete(`http://localhost:5000/api/subjects/file/${subCode}/${catId}/${fileId}`);
      showToast("File Deleted", "error");
      fetchData();
    } catch (err) { showToast("Error deleting file", "error"); }
  };

  // --- CUSTOM DELETE MODAL ---
  const DeleteConfirmModal = () => {
    if (!confirmModal.show) return null;
    return (
      <div className="fixed inset-0 bg-[#001f3f]/80 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border-t-8 border-red-500 text-center animate-in zoom-in duration-300">
          <div className="p-4 bg-red-50 w-fit rounded-full mx-auto mb-4 text-red-500">
            <FiTrash2 size={30} />
          </div>
          <h3 className="font-black text-[#001f3f] uppercase italic mb-2 text-lg">Delete {confirmModal.type}?</h3>
          <p className="text-slate-400 text-[11px] font-bold uppercase mb-6 tracking-wider">
            Are you sure you want to remove <br/> <span className="text-red-500">"{confirmModal.title}"</span>?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
            <button 
              onClick={() => {
                if(confirmModal.type === 'folder') handleDeleteFolder(confirmModal.subCode, confirmModal.id);
                else handleDeleteSubject(confirmModal.id);
                setConfirmModal({ ...confirmModal, show: false });
              }}
              className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-200 hover:scale-105 transition-all"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen relative font-sans">
      <DeleteConfirmModal />
      
      {toast.show && (
        <div className={`fixed top-10 right-4 md:right-10 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-b-4 ${toast.type === 'success' ? 'bg-[#001f3f] text-[#d4a017] border-[#d4a017]' : 'bg-white text-red-600 border-red-600'}`}>
          {toast.type === 'success' ? <FiCheckCircle size={22}/> : <FiAlertCircle size={22}/>}
          <span className="text-[12px] font-black uppercase">{toast.msg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4 mb-10 border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#001f3f] rounded-2xl text-[#d4a017] shadow-lg"><FiBookOpen size={24} /></div>
          <div>
            <h3 className="text-lg font-black text-[#001f3f] uppercase italic">Teacher Portal / <span className="text-[#d4a017]">Data</span></h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Academic Records Management</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 w-full lg:w-auto">
          <select value={selectedDept} onChange={(e)=>setSelectedDept(e.target.value)} className="bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-[#001f3f] text-[11px] outline-none">
            {['Computer Science', 'Software Engineering', 'Information Technology'].map(dept => <option key={dept}>{dept}</option>)}
          </select>
          <select value={selectedSem} onChange={(e)=>setSelectedSem(e.target.value)} className="bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-[#001f3f] text-[11px] outline-none">
            {['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map(sem => <option key={sem}>{sem}</option>)}
          </select>
          <button onClick={()=>setShowSubjectModal(true)} className="bg-[#d4a017] text-[#001f3f] px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-md">
              <FiPlus strokeWidth={3}/> Add Subject
          </button>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-4">
        {subjects.map(sub => (
          <div key={sub._id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer">
              <div className="flex items-center gap-4 flex-1" onClick={() => setExpandedSubject(expandedSubject === sub.code ? null : sub.code)}>
                <FiFolder size={24} className={expandedSubject === sub.code ? "text-[#d4a017]" : "text-slate-300"} />
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Code: {sub.code}</p>
                   <h4 className="text-sm font-black text-[#001f3f] uppercase italic">{sub.title}</h4>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingSubject({oldCode: sub.code, code: sub.code, title: sub.title}); setEditSubjectModal(true); }} 
                  className="p-2 text-blue-400 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <FiEdit2 size={18} />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setConfirmModal({show: true, type: 'subject', id: sub._id, subCode: '', title: sub.title}); }} 
                  className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                >
                  <FiTrash2 size={18} />
                </button>
                <FiChevronDown className={`transition-transform duration-300 ${expandedSubject === sub.code ? 'rotate-180 text-[#d4a017]' : 'text-slate-300'}`} />
              </div>
            </div>

            {expandedSubject === sub.code && (
              <div className="p-4 md:p-8 bg-slate-50/50 border-t">
                <div className="flex justify-end mb-6">
                  <button 
                    onClick={() => { setActiveSubCode(sub.code); setShowFolderModal(true); }}
                    className="flex items-center gap-2 bg-[#001f3f] text-[#d4a017] px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-md"
                  >
                    <FiPlus strokeWidth={4} /> Add New Folder
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {sub.categories?.map(cat => (
                    <div key={cat._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative group transition-all hover:shadow-lg">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-slate-50 rounded-2xl text-[#d4a017]"><FiFolder /></div>
                        <div className="flex gap-2">
                           <button onClick={() => { setEditingFolder({id: cat._id, name: cat.name, subCode: sub.code}); setEditFolderModal(true); }} className="p-1.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><FiEdit2 size={14}/></button>
                           <button onClick={() => setConfirmModal({show: true, type: 'folder', id: cat._id, subCode: sub.code, title: cat.name})} className="p-1.5 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><FiTrash2 size={14}/></button>
                           <span className="text-[9px] font-black text-slate-300 uppercase bg-slate-50 px-3 py-1.5 rounded-full">Files: {cat.files?.length || 0}</span>
                        </div>
                      </div>
                      <h6 className="text-[11px] font-black text-[#001f3f] uppercase mb-4 italic tracking-widest">{cat.name}</h6>
                      
                      <label className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 border-2 border-dashed rounded-[1.5rem] cursor-pointer hover:border-[#d4a017] hover:bg-white transition-all mb-4">
                        <FiUpload size={14} className="text-slate-400" />
                        <span className="text-[9px] font-black text-slate-400 uppercase italic">Upload File</span>
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(sub.code, cat._id, e.target.files[0])} />
                      </label>

                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {cat.files?.map((file) => (
                          <div key={file._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100">
                            <span className="text-[10px] font-bold text-[#001f3f] truncate w-24">{file.fileName}</span>
                            <div className="flex gap-1">
                              <a href={`http://localhost:5000${file.fileUrl}`} target="_blank" rel="noreferrer" className="p-1.5 text-blue-400 hover:scale-110"><FiEye size={12}/></a>
                              <button onClick={() => handleDeleteFile(sub.code, cat._id, file._id)} className="p-1.5 text-red-400 hover:scale-110"><FiTrash2 size={12}/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* All Modals (Edit Subject, Edit Folder, Add Subject, Add Folder) */}
      {/* Edit Subject Modal */}
      {editSubjectModal && (
        <div className="fixed inset-0 bg-[#001f3f]/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border-t-8 border-blue-400 animate-in fade-in zoom-in duration-300">
              <button onClick={()=>setEditSubjectModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><FiX size={20}/></button>
              <div className="text-center mb-6">
                 <div className="p-4 bg-blue-50 w-fit rounded-full mx-auto mb-4 text-blue-400"><FiEdit2 size={30} /></div>
                 <h3 className="font-black text-[#001f3f] uppercase italic">Edit Subject</h3>
              </div>
              <div className="space-y-4">
                <input placeholder="Code" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-400" value={editingSubject.code} onChange={e=>setEditingSubject({...editingSubject, code: e.target.value.toUpperCase()})} />
                <input placeholder="Title" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-400" value={editingSubject.title} onChange={e=>setEditingSubject({...editingSubject, title: e.target.value})} />
                <button onClick={handleUpdateSubject} className="w-full py-4 bg-[#001f3f] text-blue-400 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Update Subject</button>
              </div>
          </div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {editFolderModal && (
        <div className="fixed inset-0 bg-[#001f3f]/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border-t-8 border-[#d4a017] animate-in fade-in zoom-in duration-300">
              <button onClick={()=>setEditFolderModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><FiX size={20}/></button>
              <div className="text-center mb-6">
                 <div className="p-4 bg-yellow-50 w-fit rounded-full mx-auto mb-4 text-[#d4a017]"><FiFolder size={30} /></div>
                 <h3 className="font-black text-[#001f3f] uppercase italic">Rename Folder</h3>
              </div>
              <input placeholder="Folder Name" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-[#d4a017] mb-4" value={editingFolder.name} onChange={e=>setEditingFolder({...editingFolder, name: e.target.value})} />
              <button onClick={handleRenameFolder} className="w-full py-4 bg-[#001f3f] text-[#d4a017] rounded-2xl font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Save Changes</button>
          </div>
        </div>
      )}

      {/* Create Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-[#001f3f]/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border-t-8 border-[#d4a017] animate-in zoom-in duration-300">
            <button onClick={()=>setShowSubjectModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><FiX size={20}/></button>
            <h3 className="font-black text-[#001f3f] uppercase italic mb-6 text-center">New Subject</h3>
            <div className="space-y-4">
              <input placeholder="CODE (e.g. CS-101)" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm" value={newSub.code} onChange={e=>setNewSub({...newSub, code: e.target.value.toUpperCase()})} />
              <input placeholder="SUBJECT TITLE" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm" value={newSub.title} onChange={e=>setNewSub({...newSub, title: e.target.value})} />
              <input placeholder="CREDIT HOURS" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm" value={newSub.cr} onChange={e=>setNewSub({...newSub, cr: e.target.value})} />
              <button onClick={handleAddSubject} className="w-full py-4 bg-[#d4a017] text-[#001f3f] rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-lg">Create Subject</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-[#001f3f]/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border-t-8 border-[#d4a017] animate-in zoom-in duration-300">
            <button onClick={()=>setShowFolderModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><FiX size={20}/></button>
            <h3 className="font-black text-[#001f3f] uppercase italic mb-6 text-center text-sm">Create Sub-Folder</h3>
            <input placeholder="FOLDER NAME (e.g. Midterm Papers)" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm mb-4" value={newFolderName} onChange={e=>setNewFolderName(e.target.value)} />
            <button onClick={handleAddCategory} className="w-full py-4 bg-[#001f3f] text-[#d4a017] rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-lg">Create Now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAcademicData;