import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios'; 
import ForgotPasswordModal from './ForgotPasswordModal'; 

const Login = ({ setUser }) => { 
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState('Student'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [pin, setPin] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginStep, setLoginStep] = useState(1); 

  // Page load par fields clear karne ke liye
  useEffect(() => {
    resetFields();
  }, []);

  // Fields ko khali karne ka function
  const resetFields = () => {
    setEmail('');
    setPassword('');
    setPin('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: email.toLowerCase(),
        password
      });

      if (res.data.success) {
        const userData = res.data.user;

        if (userData.role.toLowerCase() !== userRole.toLowerCase()) {
           toast.error(`Aap as a ${userRole} registered nahi hain!`);
           setLoading(false);
           return;
        }

        if (userData.role.toLowerCase() === 'teacher') {
            toast.success("Password Verified! Please enter your PIN.");
            setLoginStep(2);
            setLoading(false);
            return;
        }

        completeLogin(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed!");
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/teacher-pin-login', {
        email: email.toLowerCase(),
        pin
      });

      if (res.data.success) {
        completeLogin(res.data);
      }
    } catch (err) {
      toast.error("Invalid Security PIN!");
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data) => {
    toast.success(`Welcome ${data.user.name}!`);
    
    // Save data
    localStorage.clear();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); 
    localStorage.setItem('userRole', data.user.role);
    setUser(data.user);

    // --- BOXES EMPTY KARNE KA LOGIC ---
    resetFields(); 

    setTimeout(() => {
      navigate(`/${data.user.role.toLowerCase()}-dashboard`);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#001f3f] flex items-center justify-center pt-[150px] pb-30 px-10 overflow-x-hidden">
      <Toaster />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[1200px] bg-white rounded-[40px] shadow-2xl flex flex-col lg:flex-row overflow-hidden"
      >
        {/* Left Side Visual */}
        <div className="w-full lg:w-[45%] bg-[#f8fafc] p-10 flex items-center justify-center border-r border-gray-100">
          <div className="w-full max-w-[400px] rounded-[30px] overflow-hidden shadow-lg border-[10px] border-white">
            <img src="/login.png" alt="Login Visual" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-[55%] p-8 md:p-16">
          <AnimatePresence mode="wait">
            {loginStep === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-[450px] mx-auto text-center"
              >
                <div className="flex justify-center mb-8">
                  <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-2">
                    {['Teacher', 'Student'].map((role) => (
                      <button 
                        key={role}
                        type="button"
                        onClick={() => {
                            setUserRole(role);
                            resetFields(); // Role change par bhi fields khali honi chahiye
                        }}
                        className={`px-8 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${userRole === role ? 'bg-[#001f3f] text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-[#001f3f] uppercase tracking-tighter mb-2">Login Portal</h1>
                <div className="h-1.5 w-20 bg-[#d4a017] mx-auto mb-10 rounded-full"></div>

                <form onSubmit={handleLogin} className="space-y-5 text-left" autoComplete="off">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 mt-1 border-2 border-slate-100 rounded-2xl font-bold text-[#001f3f] outline-none focus:border-[#001f3f] transition-all bg-slate-50" placeholder="name@uog.edu.pk" required />
                  </div>

                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 mt-1 border-2 border-slate-100 rounded-2xl font-bold text-[#001f3f] outline-none focus:border-[#001f3f] transition-all bg-slate-50" placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-11 opacity-40">{showPassword ? "🙈" : "👁️"}</button>
                    <div className="text-right mt-2">
                      <button type="button" onClick={() => setIsModalOpen(true)} className="text-[9px] font-black text-[#d4a017] uppercase hover:underline">Forgot Password?</button>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col gap-4">
                    <button type="submit" disabled={loading} className="w-full bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-blue-900 shadow-xl transition-all">
                      {loading ? "Verifying..." : `Sign In As ${userRole}`}
                    </button>
                    <button type="button" onClick={() => navigate('/register')} className="w-full border-2 border-slate-200 text-slate-400 py-4 rounded-2xl font-black uppercase text-[11px]">Create New Account</button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-[450px] mx-auto text-center"
              >
                <h1 className="text-4xl font-bold text-[#001f3f] uppercase tracking-tighter mb-2">Secure PIN</h1>
                <div className="h-1.5 w-20 bg-[#d4a017] mx-auto mb-10 rounded-full"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-8 italic">Verified: {email}</p>

                <form onSubmit={handlePinSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#001f3f] uppercase tracking-widest">Enter 4-Digit Security PIN</label>
                    <input 
                      type="password" 
                      maxLength="4" 
                      value={pin} 
                      onChange={(e) => setPin(e.target.value)} 
                      className="w-full p-6 border-4 border-[#d4a017] rounded-[30px] text-center text-5xl font-black tracking-[0.5em] outline-none bg-slate-50 focus:bg-white shadow-inner transition-all" 
                      placeholder="••••" 
                      autoFocus
                      required 
                    />
                  </div>
                  <div className="pt-4 flex flex-col gap-4">
                    <button type="submit" disabled={loading} className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-[#d4a017] transition-all">
                      {loading ? "Granting Access..." : "Verify & Login"}
                    </button>
                    <button type="button" onClick={() => {setLoginStep(1); resetFields();}} className="text-[10px] font-black text-slate-400 uppercase hover:text-[#001f3f] transition-colors">← Back to Password</button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <ForgotPasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Login;