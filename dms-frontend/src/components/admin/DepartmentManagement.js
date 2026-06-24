import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiBookOpen, FiEdit2 } from 'react-icons/fi';
import { Building2, Cpu, TrendingUp, Landmark, Monitor, Database, BookOpen, Globe, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getDepartmentIcon = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('artificial intelligence') || lowerName.includes('ai')) return <Cpu size={28} />;
  if (lowerName.includes('economics') || lowerName.includes('finance') || lowerName.includes('business')) return <TrendingUp size={28} />;
  if (lowerName.includes('pol-science') || lowerName.includes('political') || lowerName.includes('politics')) return <Landmark size={28} />;
  if (lowerName.includes('computer science') || lowerName.includes('cs') || lowerName.includes('software') || lowerName.includes('it')) return <Monitor size={28} />;
  if (lowerName.includes('data')) return <Database size={28} />;
  if (lowerName.includes('english') || lowerName.includes('literature') || lowerName.includes('history')) return <BookOpen size={28} />;
  if (lowerName.includes('international') || lowerName.includes('relations')) return <Globe size={28} />;
  if (lowerName.includes('management') || lowerName.includes('admin')) return <Briefcase size={28} />;
  return <Building2 size={28} />;
};

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [highlight1, setHighlight1] = useState('');
  const [highlight2, setHighlight2] = useState('');
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments`);
      setDepartments(res.data);
    } catch (err) {
      toast.error("Failed to load departments");
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const highlights = [highlight1, highlight2].filter(h => h.trim() !== '');

    try {
      if (editId) {
        // Edit mode
        const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/departments/${editId}`, {
          name, description, highlights
        });
        if (res.data.success) {
          toast.success(res.data.message);
          setDepartments(departments.map(d => d._id === editId ? res.data.department : d));
          closeModal();
        }
      } else {
        // Create mode
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/departments`, {
          name, description, highlights
        });
        if (res.data.success) {
          toast.success(res.data.message);
          setDepartments([res.data.department, ...departments]);
          closeModal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${editId ? 'update' : 'create'} department`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (dept) => {
    setEditId(dept._id);
    setName(dept.name);
    setDescription(dept.description);
    setHighlight1(dept.highlights[0] || '');
    setHighlight2(dept.highlights[1] || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setName('');
    setDescription('');
    setHighlight1('');
    setHighlight2('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    
    try {
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/departments/${id}`);
      if (res.data.success) {
        toast.success("Department deleted!");
        setDepartments(departments.filter(d => d._id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete department");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-end gap-4 mb-10">
        <button 
          onClick={() => {
            closeModal();
            setIsModalOpen(true);
          }}
          className="bg-[#001f3f] text-white px-6 py-3 rounded-lg font-black text-xs uppercase flex items-center gap-2 hover:bg-[#d4a017] transition-all shadow-xl"
        >
          <FiPlus className="text-lg" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {departments.length > 0 ? (
          departments.map((dept) => (
            <div key={dept._id} className="bg-white p-4 sm:p-8 rounded-lg sm:rounded-lg shadow-xl border border-slate-50 relative overflow-hidden group">
              <div className="absolute -right-5 -top-5 w-20 h-20 bg-slate-50 rounded-full group-hover:bg-[#d4a017]/10 transition-all"></div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-[#001f3f]">
                  {getDepartmentIcon(dept.name)}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(dept)}
                    className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                    title="Edit Department"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => handleDelete(dept._id)}
                    className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    title="Delete Department"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <h3 className="font-black text-[#001f3f] text-xl uppercase tracking-tight mb-3">{dept.name}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase mb-6 line-clamp-3 leading-relaxed">
                {dept.description}
              </p>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="text-[10px] font-black text-[#d4a017] uppercase tracking-widest mb-3">Highlights</h4>
                {dept.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600 uppercase">
                    <FiBookOpen className="text-[#001f3f] mt-0.5 shrink-0" />
                    <span className="leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-lg border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest">No departments created yet ✨</p>
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg mx-4 rounded-lg sm:rounded-lg p-4 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h2 className="text-2xl font-black text-[#001f3f] uppercase">
                  {editId ? 'Edit' : 'Add New'} <span className="text-[#d4a017]">Department</span>
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-red-500 text-xl font-bold">✕</button>
              </div>

              <form onSubmit={handleAddDepartment} className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div className="w-full">
                    <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Department Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="E.g., BS Computer Science" 
                      className="w-full p-4 mt-1 border-2 border-slate-100 rounded-lg font-bold text-sm outline-none focus:border-[#001f3f] transition-all bg-slate-50" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Description</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Brief overview of the department..." 
                    className="w-full p-4 mt-1 border-2 border-slate-100 rounded-lg font-bold text-sm outline-none focus:border-[#001f3f] transition-all bg-slate-50 h-28 resize-none" 
                    required 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Key Highlights (Max 2)</label>
                  <input 
                    type="text" 
                    value={highlight1} 
                    onChange={(e) => setHighlight1(e.target.value)} 
                    placeholder="1. E.g., Industry-level tools & projects" 
                    className="w-full p-3 border-2 border-slate-100 rounded-lg font-bold text-xs outline-none focus:border-[#001f3f] transition-all bg-slate-50" 
                  />
                  <input 
                    type="text" 
                    value={highlight2} 
                    onChange={(e) => setHighlight2(e.target.value)} 
                    placeholder="2. E.g., Advanced computing skills" 
                    className="w-full p-3 border-2 border-slate-100 rounded-lg font-bold text-xs outline-none focus:border-[#001f3f] transition-all bg-slate-50" 
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-lg font-black uppercase text-xs hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-[#001f3f] text-white py-4 rounded-lg font-black uppercase text-xs hover:bg-[#d4a017] transition-all shadow-xl"
                  >
                    {isSubmitting ? (editId ? 'Updating...' : 'Creating...') : (editId ? 'Update Department' : 'Create Department')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepartmentManagement;
