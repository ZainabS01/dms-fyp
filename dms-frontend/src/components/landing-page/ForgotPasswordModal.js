import React, { useState } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- PHASE 1: SEND OTP TO GMAIL ---
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email) return toast.error("Please write your registered email!");
    
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, { 
        email: email.toLowerCase().trim() 
      });
      
      if (res.data.success) {
        toast.success("OTP has been sent to your Gmail! Please check your Inbox.");
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Problem searching for email!");
    } finally {
      setLoading(false);
    }
  };

// --- PHASE 2: MANUAL RESET PASSWORD (BULLETPROOF EMAIL CHECK) ---
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    
    // Trim definitions
    const targetEmail = email ? email.toLowerCase().trim() : "";
    const targetOtp = otp ? String(otp).trim() : "";

    if (!targetEmail) {
      return toast.error("Email address is missing! Please 'Edit Email' and write it again.");
    }
    if (!newPassword) {
      return toast.error("Please enter a new password first!");
    }
    if (!targetOtp || targetOtp.length !== 4) {
      return toast.error("Please enter the valid 4-digit OTP code received on your Gmail!");
    }

    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, { 
        email: targetEmail, 
        otp: targetOtp, 
        newPassword: newPassword 
      });

      if (res.data.success) {
        toast.success("Congratulations! Password successfully updated.");
        setEmail('');
        setOtp('');
        setNewPassword('');
        setStep(1);
        onClose(); 
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Password could not be updated!");
      setOtp(''); // Safe fallback
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001f3f]/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-sm rounded-lg border-[4px] border-white shadow-2xl overflow-hidden"
      >
        <div className="bg-[#001f3f] p-6 text-center border-b-4 border-[#d4a017]">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {step === 1 ? 'Recover Account' : 'Set New Password'}
          </h2>
          <p className="text-[10px] text-blue-200 uppercase tracking-[0.3em] mt-1">
            {step === 1 ? 'Verification Phase' : 'Security Phase'}
          </p>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                onSubmit={handleSendOTP} 
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#001f3f] uppercase tracking-widest ml-1">Registered Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border-2 border-[#001f3f] rounded-lg font-bold text-sm outline-none focus:bg-blue-50 transition-all"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#001f3f] text-white py-3 rounded-lg font-black uppercase text-sm shadow-xl hover:bg-[#d4a017] transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Verify Gmail'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="step2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                onSubmit={handleResetPassword} 
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#001f3f] uppercase tracking-widest ml-1">New Secure Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border-2 border-[#001f3f] rounded-lg font-bold text-sm outline-none focus:border-[#28a745] transition-all"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#001f3f] uppercase tracking-widest ml-1">4-Digit OTP Code</label>
                  <input 
                    type="text" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                    className="w-full p-3 border-2 border-[#d4a017] rounded-lg font-black text-center text-xl tracking-[10px] outline-none bg-slate-50"
                    placeholder="----" 
                    maxLength="4"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#28a745] text-white py-3 rounded-lg font-black uppercase text-sm shadow-xl hover:bg-[#218838] transition-all"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#001f3f] mt-2"
                >
                  Edit Email
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <button 
            type="button"
            onClick={handleModalClose}
            className="w-full mt-6 text-[11px] font-black text-[#001f3f] uppercase tracking-widest py-2 border-t border-gray-100 hover:text-red-500 transition-colors"
          >
            Close Window
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordModal;