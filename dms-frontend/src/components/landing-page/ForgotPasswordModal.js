import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- STEP 1: OTP BHEJNE KI LOGIC ---
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      if (res.data.success) {
        toast.success("OTP sent to your real Gmail account!");
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: OTP VERIFY AUR PASSWORD RESET ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      if (res.data.success) {
        toast.success("Password updated successfully!");
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        onClose(); // Modal band kar dein
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP or error!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001f3f]/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[40px] border-[10px] border-white shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-[#001f3f] p-6 text-center border-b-4 border-[#d4a017]">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            {step === 1 ? 'Recover Account' : 'Set New Password'}
          </h2>
          <p className="text-[10px] text-blue-200 uppercase tracking-[0.3em] mt-1">
            {step === 1 ? 'Verification Phase' : 'Security Phase'}
          </p>
        </div>

        <div className="p-8">
          {step === 1 ? (
            /* --- FORM STEP 1: EMAIL --- */
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#001f3f] uppercase tracking-widest ml-1">Enter Registered Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border-2 border-[#001f3f] rounded-2xl font-bold text-sm outline-none focus:bg-blue-50"
                  placeholder="YOURNAME@GMAIL.COM"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase italic text-sm shadow-xl hover:bg-[#d4a017] transition-all disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP to Gmail'}
              </button>
            </form>
          ) : (
            /* --- FORM STEP 2: OTP & NEW PASSWORD --- */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#001f3f] uppercase tracking-widest ml-1">Enter 4-Digit OTP</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-4 border-2 border-[#d4a017] rounded-2xl font-black text-center text-2xl tracking-[10px] outline-none"
                  placeholder="0000"
                  maxLength="4"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#001f3f] uppercase tracking-widest ml-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-4 border-2 border-[#001f3f] rounded-2xl font-bold text-sm outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase italic text-sm shadow-xl hover:bg-[#28a745] transition-all"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#001f3f]"
              >
                Back to Email
              </button>
            </form>
          )}

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="w-full mt-4 text-[11px] font-black text-[#001f3f] uppercase tracking-widest py-2 hover:underline"
          >
            Close Window
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordModal;