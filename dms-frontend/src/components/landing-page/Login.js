import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios'; 
import ForgotPasswordModal from './ForgotPasswordModal'; 

const Login = ({ setUser }) => { 
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('Student'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [pin, setPin] = useState(''); 
  const [otp, setOtp] = useState(''); 
  const [generatedOtp, setGeneratedOtp] = useState(''); // Real OTP save karne ke liye
  const [loading, setLoading] = useState(false);
  const [loginStep, setLoginStep] = useState(1); 

  useEffect(() => {
    resetFields();
  }, [userRole]);

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setPin('');
    setOtp('');
    setGeneratedOtp('');
    setLoginStep(1);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const lowerEmail = email.toLowerCase().trim();

    try {
      // 1. Agar ADMIN hai to password ki zaroorat nahi, seedha OTP bhejein
      if (userRole.toLowerCase() === 'admin') {
        if (lowerEmail === 'zainabminhas294@gmail.com') {
          const res = await axios.post('http://localhost:5000/api/auth/send-otp', { email: lowerEmail });
          if (res.data.success) {
            setGeneratedOtp(res.data.otp); // Backend se aaya OTP save karein
            toast.success("Security OTP sent to Admin Gmail!");
            setLoginStep(2);
          }
        } else {
          toast.error("Unauthorized Admin Email!");
        }
        setLoading(false);
        return;
      }

      // 2. TEACHER & STUDENT Login
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: lowerEmail,
        password: password
      });

      if (res.data.success) {
        const userData = res.data.user;

        if (userData.role.toLowerCase() !== userRole.toLowerCase()) {
           toast.error(`Aap as a ${userRole} registered nahi hain!`);
           setLoading(false);
           return;
        }

        // Agar Teacher hai to Password sahi hone ke baad OTP bhejein
        if (userData.role.toLowerCase() === 'teacher') {
            const otpRes = await axios.post('http://localhost:5000/api/auth/send-otp', { email: lowerEmail });
            if (otpRes.data.success) {
                setGeneratedOtp(otpRes.data.otp);
                toast.success("Password Verified! OTP sent to Gmail.");
                setLoginStep(2);
            }
        } else {
            // Student direct login
            completeLogin(res.data);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    // Real validation: Jo backend se aaya us se match karein
    if (otp === generatedOtp) {
      if (userRole.toLowerCase() === 'teacher') {
        toast.success("OTP Verified! Enter Security PIN.");
        setLoginStep(3);
      } else {
        // Admin Login Completion
        const adminData = {
          success: true,
          user: { name: "Zainab Admin", role: "admin", email: email },
          token: "admin-secure-session-" + Date.now()
        };
        completeLogin(adminData);
      }
    } else {
      toast.error("Ghalat OTP! Gmail check karein.");
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/teacher-pin-login', {
        email: email.toLowerCase(),
        pin: pin
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
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); 
    setUser(data.user);
    setTimeout(() => {
      navigate(`/${data.user.role.toLowerCase()}-dashboard`);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#001f3f] flex items-center justify-center pt-[150px] pb-30 px-10">
      <Toaster />
      <motion.div className="w-full max-w-[1100px] bg-white rounded-[40px] shadow-2xl flex flex-col lg:flex-row overflow-hidden min-h-[600px]">
        
        {/* Visual Side */}
        <div className="w-full lg:w-[45%] bg-[#f8fafc] p-10 flex items-center justify-center border-r border-gray-100">
          <img src="/login.png" alt="Login" className="w-full max-w-[350px]" />
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-[55%] p-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {loginStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="flex justify-center mb-6">
                  <div className="bg-slate-100 p-1 rounded-2xl flex">
                    {['Admin', 'Teacher', 'Student'].map((role) => (
                      <button key={role} onClick={() => setUserRole(role)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRole === role ? 'bg-[#001f3f] text-white shadow-lg' : 'text-slate-400'}`}>{role}</button>
                    ))}
                  </div>
                </div>

                <h2 className="text-3xl font-black text-[#001f3f] text-center uppercase italic">Login Portal</h2>
                <div className="h-1.5 w-16 bg-[#d4a017] mx-auto mb-10 rounded-full"></div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-[#d4a017]" placeholder="Gmail Address" required />
                  {userRole !== 'Admin' && (
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-[#d4a017]" placeholder="Password" required />
                  )}
                  <button type="submit" disabled={loading} className="w-full bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                    {loading ? "Verifying..." : `Next: ${userRole} Login`}
                  </button>
                </form>
              </motion.div>
            )}

            {loginStep === 2 && (
              <motion.div key="step2" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center">
                   <div className="text-5xl mb-4">📧</div>
                   <h2 className="text-3xl font-black text-[#001f3f] uppercase">Verify OTP</h2>
                   <p className="text-slate-400 text-[10px] uppercase font-bold mt-2">Sent to: {email}</p>
                   
                   <form onSubmit={handleOtpSubmit} className="mt-10 space-y-8">
                     <input type="text" maxLength="4" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full text-center text-5xl p-4 border-b-4 border-[#d4a017] outline-none font-black tracking-[0.5em]" placeholder="0000" required autoFocus />
                     <button type="submit" className="w-full bg-[#d4a017] text-white py-5 rounded-2xl font-black uppercase shadow-lg">Verify & Proceed</button>
                     <button type="button" onClick={() => setLoginStep(1)} className="block mx-auto text-slate-400 text-[10px] uppercase font-bold">Back</button>
                   </form>
                </div>
              </motion.div>
            )}

            {loginStep === 3 && (
              <motion.div key="step3" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <div className="text-center">
                  <div className="text-5xl mb-4">🔐</div>
                  <h2 className="text-3xl font-black text-[#001f3f] uppercase">Security PIN</h2>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mt-2">Enter your 4-Digit Teacher PIN</p>
                  
                  <form onSubmit={handlePinSubmit} className="mt-10 space-y-6">
                    <input type="password" maxLength="4" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-6 bg-slate-50 border-4 border-[#d4a017] rounded-[30px] text-center text-5xl font-black tracking-[0.5em] outline-none" placeholder="••••" required autoFocus />
                    <button type="submit" className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase shadow-2xl">Enter Dashboard</button>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;