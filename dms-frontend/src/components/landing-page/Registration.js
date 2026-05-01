import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import ForgotPasswordModal from './ForgotPasswordModal';

const Registration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState('Student'); 
  const [loading, setLoading] = useState(false); 

  // Form States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [phone, setPhone] = useState('+92');
  const [semester, setSemester] = useState('');

  const [isVerifying] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith("+92")) val = "+92";
    if (val.length <= 13) setPhone(val);
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
      phone: phone.trim()
    };

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
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
    <div className="relative min-h-screen w-full bg-[#001f3f] flex items-center justify-center pt-[200px] pb-24 px-6 overflow-x-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[1200px] bg-[#f1f3f6] border-[15px] md:border-[22px] border-white rounded-[50px] md:rounded-[80px] shadow-[0_50px_100px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row overflow-hidden"
      >
        {/* Left Side: Sidebar */}
        <div className="w-full lg:w-[45%] p-10 flex flex-col items-center justify-center bg-[#f8fafc] border-b-4 lg:border-b-0 lg:border-r-4 border-white text-center">
          <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-white shadow-2xl border-4 border-[#001f3f] p-3 mb-10 flex items-center justify-center overflow-hidden">
             <img src="/logo.png" alt="DMS Logo" className="w-full h-full object-contain" />
          </div>
          <div className="bg-[#001f3f] text-white rounded-[40px] p-8 w-full max-w-[420px] shadow-2xl border-b-[6px] border-[#d4a017]">
            <h2 className="text-xl font-black mb-4 uppercase italic">Welcome To DMS</h2>
            <p className="text-[11px] font-bold text-blue-100/70 mb-8">Efficient Departmental Management System.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Secure', 'Organized', 'Direct'].map((item) => (
                <span key={item} className="bg-white text-[#001f3f] px-5 py-2 rounded-full font-black uppercase text-[9px] shadow-md">{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-[55%] bg-white p-8 md:p-16 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!isVerifying && (
              <motion.div key="reg-form" initial={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-[500px] mx-auto">
                {/* Role Selector */}
                <div className="flex justify-center mb-8">
                  <div className="bg-[#f1f3f6] p-1.5 rounded-2xl flex gap-2 border-2 border-[#001f3f]/10">
                    {['Teacher', 'Student'].map((role) => (
                      <button 
                        key={role}
                        type="button" 
                        disabled={loading}
                        onClick={() => setUserRole(role)} 
                        className={`px-8 py-2.5 rounded-xl font-black uppercase text-[10px] transition-all ${userRole === role ? 'bg-[#001f3f] text-white shadow-lg' : 'text-[#001f3f]'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h1 className="text-4xl font-black text-[#001f3f] uppercase italic border-b-[8px] border-[#001f3f] inline-block tracking-tighter pb-1">Join Portal</h1>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 border-2 border-[#001f3f] rounded-2xl font-bold text-sm outline-none focus:bg-blue-50 transition-all" placeholder="EMAIL@DMS.COM" required />
                  </div>

                  <AnimatePresence>
                    {email.length > 5 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Full Name</label>
                            <input type="text" placeholder="FULL NAME" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 mt-1 border-2 border-[#001f3f] rounded-2xl font-bold text-sm outline-none" required />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Phone No</label>
                            <input type="text" placeholder="PHONE NO" value={phone} onChange={handlePhoneChange} className="w-full p-3.5 mt-1 border-2 border-[#001f3f] rounded-2xl font-bold text-sm outline-none" required />
                          </div>
                        </div>

                        {userRole === 'Student' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Roll No</label>
                              <input type="text" placeholder="6 DIGITS" value={rollNo} onChange={handleRollChange} className="w-full p-3.5 mt-1 border-2 border-[#001f3f] rounded-2xl font-bold text-sm outline-none" required />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Semester</label>
                              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full p-3.5 mt-1 border-2 border-[#001f3f] rounded-2xl font-bold text-sm bg-white" required>
                                <option value="">CHOOSE</option>
                                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Semester</option>)}
                              </select>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Password</label>
                          <div className="relative mt-1">
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3.5 border-2 border-[#001f3f] rounded-2xl font-bold text-sm outline-none" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-3.5 text-xl opacity-50">{showPassword ? "🙈" : "👁️"}</button>
                          </div>
                          <div className="text-right mt-1">
                            <button type="button" onClick={() => setIsModalOpen(true)} className="text-[9px] font-black text-[#d4a017] uppercase hover:underline">Forgot Password?</button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-[#001f3f] uppercase ml-1 tracking-widest">Department</label>
                          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full p-3.5 mt-1 border-2 border-[#001f3f] rounded-2xl font-bold text-sm bg-white" required>
                            <option value="">SELECT DEPARTMENT</option>
                            <option value="COMPUTER SCIENCE">COMPUTER SCIENCE</option>
                            <option value="IT">IT</option>
                            <option value="SOFTWARE ENGINEERING">SOFTWARE ENGINEERING</option>
                            <option value="Testing">Testing</option>
                          </select>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase italic tracking-[0.2em] text-sm hover:bg-[#d4a017] transition-all shadow-xl">
                          {loading ? "Registering..." : `Create ${userRole} Account`}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="button" onClick={() => navigate('/login')} className="w-full border-2 border-[#001f3f] text-[#001f3f] py-4 rounded-2xl font-black uppercase italic tracking-[0.2em] text-sm hover:bg-gray-100 transition-all mt-4">
            Already have account? Login
          </button>
        </div>
      </motion.div>
      <ForgotPasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Registration;