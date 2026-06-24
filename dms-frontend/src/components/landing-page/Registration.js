import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { SEMESTERS_LIST } from '../../constants/data';

const Registration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState('Student'); 
  const [loading, setLoading] = useState(false); 

  // Form States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const [department, setDepartment] = useState(location.state?.selectedDept || '');
  const [departmentsList, setDepartmentsList] = useState([]);
  const [gender, setGender] = useState('Female');

  useEffect(() => {
    window.scrollTo(0, 0);
    const defaultDeptNames = ["COMPUTER SCIENCE", "ENGLISH", "MATHEMATICS", "ZOOLOGY", "URDU", "POL-SCIENCE", "ECONOMICS"];
    axios.get(`${process.env.REACT_APP_API_URL}/api/departments`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setDepartmentsList(res.data.map(d => d.name.replace(/^BS\s+/i, '').trim().toUpperCase()));
        } else {
          setDepartmentsList(defaultDeptNames);
        }
      })
      .catch(err => {
        console.error("Error fetching departments:", err);
        setDepartmentsList(defaultDeptNames);
      });
  }, []);
  const [rollNo, setRollNo] = useState('');
  const [phone, setPhone] = useState('');
  const [semester, setSemester] = useState('');

  const [isVerifying] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) setPhone(val);
  };

  const handleRollChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 6) {
      setRollNo(val);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); 

    // Validation for Student Roll Number
    if (userRole === 'Student' && rollNo.length !== 6) {
      setLoading(false);
      return toast.error("Roll Number must be exactly 6 digits!");
    }

    // Creating Data Object to send to Backend
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole.toLowerCase(),
      department: department.trim(),
      rollNo: userRole.toLowerCase() === 'student' ? rollNo.trim() : undefined,
      semester: userRole.toLowerCase() === 'student' ? semester : undefined,
      phone: "+92" + phone.trim(),
      gender
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, userData);
      
      if (response.data.success) {
        toast.success(response.data.message || "Registered Successfully!");
        // Login page par redirect karna 2 seconds baad
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      // Backend se exact error message lena
      const serverMessage = error.response?.data?.message || "Registration Failed!";
      toast.error(serverMessage);
      console.log("Registration Error Details:", error.response?.data);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#001f3f] flex items-center justify-center pt-[130px] pb-10 px-4 overflow-x-hidden">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[1050px] bg-white rounded-lg shadow-2xl flex flex-col lg:flex-row overflow-hidden"
      >
        {/* Left Side: Sidebar */}
        <div className="w-full lg:w-[40%] p-3 md:p-4 flex flex-col items-center justify-center bg-white border-b lg:border-b-0 lg:border-r border-gray-100 text-center">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white shadow-2xl border-4 border-[#001f3f] p-2 mb-4 flex items-center justify-center overflow-hidden">
             <img src="/logo.png" alt="DMS Logo" className="w-full h-full object-contain" />
          </div>
          <div className="bg-[#001f3f] text-white rounded-lg p-4 w-full max-w-[380px] shadow-lg">
            <h2 className="text-lg md:text-xl font-black mb-2 uppercase">Welcome To DMS</h2>
            <p className="text-[10px] md:text-[11px] font-bold text-blue-100/70 mb-4">Efficient Departmental Management System.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Secure', 'Organized', 'Direct'].map((item) => (
                <span key={item} className="bg-white text-[#001f3f] px-4 py-1.5 rounded-full font-black uppercase text-[9px] shadow-md">{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-[60%] bg-white p-3 md:p-6 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!isVerifying && (
              <motion.div key="reg-form" initial={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-[750px] mx-auto px-2 lg:px-4">
                {/* Role Selector */}
                <div className="flex justify-center mb-5">
                  <div className="bg-[#f1f3f6] p-1.5 rounded-lg flex gap-2 border-2 border-[#001f3f]/10">
                    {['Teacher', 'Student'].map((role) => (
                      <button 
                        key={role}
                        type="button" 
                        disabled={loading}
                        onClick={() => setUserRole(role)} 
                        className={`px-8 py-2.5 rounded-lg font-black uppercase text-[10px] transition-all ${userRole === role ? 'bg-[#001f3f] text-white shadow-lg' : 'text-[#001f3f]'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h1 className="text-2xl font-black text-[#001f3f] uppercase border-b-[6px] border-[#001f3f] inline-block tracking-tighter pb-1">Join Portal</h1>
                </div>

                <form onSubmit={handleRegister} className="space-y-2">
                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border-2 border-[#001f3f] rounded-lg font-bold text-sm outline-none focus:bg-blue-50 transition-all" placeholder="EMAIL@DMS.COM" required />
                  </div>

                  <AnimatePresence>
                    {email.length > 5 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Full Name</label>
                            <input type="text" placeholder="FULL NAME" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border-2 border-[#001f3f] rounded-lg font-bold text-sm outline-none" required />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Phone No</label>
                            <div className="flex items-center border-2 border-[#001f3f] rounded-lg overflow-hidden bg-white">
                              <span className="px-3 py-2.5 font-black text-sm bg-gray-100 border-r-2 border-[#001f3f] text-[#001f3f] flex items-center">+92</span>
                              <input type="text" placeholder="3001234567" value={phone} onChange={handlePhoneChange} className="w-full p-2.5 font-bold text-sm outline-none" required />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Gender</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2.5 border-2 border-[#001f3f] rounded-lg font-bold text-sm bg-white outline-none cursor-pointer" required>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                            </select>
                          </div>
                        </div>

                        {userRole === 'Student' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Roll No</label>
                              <input type="text" placeholder="6 DIGITS" value={rollNo} onChange={handleRollChange} className="w-full p-2.5 border-2 border-[#001f3f] rounded-lg font-bold text-sm outline-none" required />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Semester</label>
                              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full p-2.5 border-2 border-[#001f3f] rounded-lg font-bold text-sm bg-white outline-none cursor-pointer" required>
                                <option value="">CHOOSE</option>
                                {SEMESTERS_LIST.map(n => <option key={n} value={n}>{n} Semester</option>)}
                              </select>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Department</label>
                            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full p-2.5 border-2 border-[#001f3f] rounded-lg font-bold text-sm bg-white outline-none cursor-pointer" required>
                              <option value="">SELECT DEPARTMENT</option>
                              {departmentsList.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Password</label>
                            <div className="relative">
                              <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 border-2 border-[#001f3f] rounded-lg font-bold text-sm outline-none" required />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#001f3f]">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            <div className="text-right mt-1">
                              <button type="button" onClick={() => setIsModalOpen(true)} className="text-[9px] font-black text-[#d4a017] uppercase hover:underline">Forgot Password?</button>
                            </div>
                          </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-[#001f3f] text-white py-2.5 rounded-lg font-black uppercase tracking-[0.2em] text-sm hover:bg-[#d4a017] transition-all shadow-xl mt-2">
                          {loading ? "Registering..." : `Create ${userRole} Account`}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center mt-3 text-slate-400 text-[11px] font-bold uppercase">
            Already have an account? <span className="text-[#d4a017] cursor-pointer hover:underline" onClick={() => navigate('/login')}>Login</span>
          </p>
        </div>
      </motion.div>
      <ForgotPasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Registration;