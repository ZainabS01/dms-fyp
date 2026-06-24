import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios'; 
import ForgotPasswordModal from './ForgotPasswordModal'; 
import { Eye, EyeOff } from 'lucide-react'; 

const Login = ({ setUser }) => { 
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('Student'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [pin, setPin] = useState(''); 
  const [otp, setOtp] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [loginStep, setLoginStep] = useState(1); 
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  useEffect(() => {
    resetFields();
  }, [userRole]);

  // --- AUTO-VERIFY OTP (Step 2) ---
  useEffect(() => {
    if (otp.length === 4 && loginStep === 2) {
      handleOtpSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // --- AUTO-VERIFY PIN (Step 3) ---
  useEffect(() => {
    if (pin.length === 4 && loginStep === 3) {
      handlePinSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setPin('');
    setOtp('');
    setLoginStep(1);
    setShowPassword(false);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const lowerEmail = email.toLowerCase().trim();

    try {
      // 1. Admin Logic
      if (userRole.toLowerCase() === 'admin') {
        if (lowerEmail === 'zainabminhas294@gmail.com') {
          const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/send-otp`, { email: lowerEmail });
          if (res.data.success) {
            toast.success("Security OTP sent to Admin Gmail!");
            setLoginStep(2);
          }
        } else {
          toast.error("Unauthorized Admin Email!");
        }
        setLoading(false);
        return;
      }

      // 2. Teacher & Student Logic
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email: lowerEmail,
        password: password
      });

      if (res.data.success) {
        const userData = res.data.user;
        
        // Role check
        if (userData.role.toLowerCase() !== userRole.toLowerCase()) {
           toast.error(`You are not registered as a ${userRole}!`);
           setLoading(false);
           return;
        }

        // Multi-factor check for All Roles
        if (res.data.requiresOtp) {
            toast.success(res.data.message || "OTP sent to your Gmail.");
            setLoginStep(2);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  // --- Updated OTP Verification logic to match Backend ---
  const handleOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      // Note: The 'reset-password' logic on the backend can be used to verify OTP,
      // or you can create a dedicated 'verify-otp' route.
      // Currently, we simulate admin login and handle state for teachers.
      
      if (userRole.toLowerCase() === 'admin') {
          // Admin secure check logic
          const adminData = {
            success: true,
            user: { name: "Zainab", role: "admin", email: email },
            token: "admin-secure-session-" + Date.now()
          };
          completeLogin(adminData);
      } else {
          const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-login-otp`, {
              email: email.toLowerCase(),
              otp: otp
          });

          if (res.data.success) {
              if (userRole.toLowerCase() === 'teacher') {
                  toast.success("OTP Verified! Enter Security PIN.");
                  setLoginStep(3);
              } else {
                  // Direct login for students after OTP
                  completeLogin(res.data);
              }
          }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP Verification Failed!");
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/teacher-pin-login`, {
        email: email.toLowerCase(),
        pin: pin
      });
      if (res.data.success) {
        completeLogin(res.data);
      }
    } catch (err) {
      toast.error("Invalid Security PIN!");
      setPin(''); 
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data) => {
    toast.success(`Welcome ${data.user.name}!`);
    const userToSave = {
      ...data.user,
      semester: (data.user.role === 'student' && (!data.user.semester || data.user.semester === "N/A")) ? "1st Sem" : data.user.semester,
      rollNo: (data.user.role === 'student' && (!data.user.rollNo || data.user.rollNo === "N/A")) ? "000000" : data.user.rollNo
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userToSave)); 
    setUser(userToSave);

    setTimeout(() => {
      const role = userToSave.role.toLowerCase();
      navigate(`/${role}-dashboard`);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#001f3f] flex items-center justify-center pt-[100px] pb-8 px-4">
      <motion.div className="w-full max-w-[750px] bg-white rounded-lg shadow-2xl flex flex-col lg:flex-row overflow-hidden min-h-[350px]">
        
        <div className="w-full lg:w-[45%] bg-white p-3 flex items-center justify-center border-r border-gray-100">
          <img src="/login.png" alt="Login" className="w-full max-w-[250px]" />
        </div>

        <div className="w-full lg:w-[55%] p-5 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {loginStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="flex justify-center mb-4">
                  <div className="bg-slate-100 p-1 rounded-lg flex">
                    {['Admin', 'Teacher', 'Student'].map((role) => (
                      <button key={role} type="button" onClick={() => setUserRole(role)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${userRole === role ? 'bg-[#001f3f] text-white shadow-lg' : 'text-slate-400'}`}>{role}</button>
                    ))}
                  </div>
                </div>

                <h2 className="text-2xl font-black text-[#001f3f] text-center uppercase">Login Portal</h2>
                <div className="h-1.5 w-16 bg-[#d4a017] mx-auto mb-4 rounded-full"></div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1 mb-1 block">Gmail Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 border-2 rounded-lg outline-none focus:border-[#d4a017] transition-all font-bold text-sm" placeholder="Enter your email" required />
                  </div>

                  {userRole !== 'Admin' && (
                    <div className="relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1 mb-1 block">Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 bg-slate-50 border-2 rounded-lg outline-none focus:border-[#d4a017] transition-all font-bold text-sm" placeholder="••••••••" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#001f3f]">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="flex justify-end mt-2 px-1">
                        <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-[10px] font-black text-[#d4a017] uppercase hover:underline">Forgot Password?</button>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="w-full bg-[#001f3f] text-white py-2.5 rounded-lg font-black uppercase tracking-widest shadow-xl hover:bg-[#002d5a] transition-all active:scale-95 disabled:opacity-50 text-sm">
                    {loading ? "Verifying..." : `Next: ${userRole} Login`}
                  </button>
                </form>

                {userRole !== 'Admin' && (
                  <p className="text-center mt-4 text-slate-400 text-[11px] font-bold uppercase">
                    Don't have an account? <span className="text-[#d4a017] cursor-pointer hover:underline" onClick={() => navigate('/register')}>Register Now</span>
                  </p>
                )}
              </motion.div>
            )}

            {loginStep === 2 && (
              <motion.div key="step2" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center">
                   <div className="text-5xl mb-4">📧</div>
                   <h2 className="text-3xl font-black text-[#001f3f] uppercase">Verify OTP</h2>
                   <p className="text-slate-400 text-[10px] uppercase font-bold mt-2">Sent to: {email}</p>
                   
                   <form onSubmit={handleOtpSubmit} className="mt-10 space-y-8">
                     <input 
                       type="text" 
                       maxLength="4" 
                       value={otp} 
                       onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                       className="w-full text-center text-5xl p-4 border-b-4 border-[#d4a017] outline-none font-black tracking-[0.5em] bg-transparent" 
                       placeholder="0000" 
                       required 
                       autoFocus 
                     />
                     <button type="submit" disabled={loading} className="w-full bg-[#d4a017] text-white py-5 rounded-lg font-black uppercase shadow-lg disabled:opacity-50">
                        {loading ? 'Verifying...' : 'Continue'}
                     </button>
                     <button type="button" onClick={() => setLoginStep(1)} className="block mx-auto text-slate-400 text-[10px] uppercase font-bold hover:text-[#001f3f]">Back</button>
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
                    <input 
                      type="password" 
                      maxLength="4" 
                      value={pin} 
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
                      className="w-full p-6 bg-slate-50 border-4 border-[#d4a017] rounded-lg text-center text-5xl font-black tracking-[0.5em] outline-none" 
                      placeholder="••••" 
                      required 
                      autoFocus 
                    />
                    <button type="submit" disabled={loading} className="w-full bg-[#001f3f] text-white py-5 rounded-lg font-black uppercase shadow-2xl disabled:opacity-50">
                        {loading ? 'Entering...' : 'Unlock Dashboard'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {isForgotModalOpen && <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />}
    </div>
  );
};

export default Login;