import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Contact = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [submittedTo, setSubmittedTo] = useState("");

  // 1. Form Reset State
  const [formData, setFormData] = useState({
    fullName: "",
    status: "STATUS",
    email: "",
    department: "",
    semester: "SEMESTER (If Student)",
    message: ""
  });

  useEffect(() => {
    if (window.location.hash === '#contact-form') {
      const element = document.getElementById('contact-form');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else if (window.location.hash === '#faq') {
      const element = document.getElementById('faq');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (submittedTo) {
      const timer = setTimeout(() => setSubmittedTo(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [submittedTo]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // 2. Handle Selection & Clear Fields
  const handleSelection = async (target) => {
    try {
      const queryData = {
        studentName: formData.fullName || "Visitor",
        email: formData.email,
        rollNumber: formData.email || "N/A",
        department: formData.department || "N/A",
        semester: formData.status === "STUDENT" ? formData.semester : "N/A",
        subject: "Contact Form Query",
        message: formData.message,
        recipient: target.toLowerCase()
      };

      await axios.post('http://localhost:5000/api/query/add', queryData);

      setSubmittedTo(target);
      setShowDropdown(false);
      
      setFormData({
        fullName: "",
        status: "STATUS",
        email: "",
        department: "",
        semester: "SEMESTER (If Student)",
        message: ""
      });
    } catch (err) {
      console.error("Failed to submit query:", err);
      alert("Failed to submit query. Please try again.");
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans pt-[90px] md:pt-[80px] w-full overflow-x-hidden">
      
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
        className="bg-[#001f3f] text-white py-8 md:py-12 px-6 text-center w-full"
      >
        <h1 className="text-2xl md:text-4xl font-bold mb-3 uppercase tracking-tighter">Contact Us</h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-xs md:text-sm font-bold uppercase opacity-90">
          We're here to help — reach out anytime
        </p>
      </motion.section>

      <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-[#001f3f] uppercase border-b-4 border-[#001f3f] inline-block mb-1">Reach Us</h2>
            <div className="space-y-5">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full border-2 border-[#001f3f] flex items-center justify-center group-hover:bg-[#001f3f] group-hover:text-white transition-all text-sm">📞</div>
                <a href="tel:+923016101870" className="font-bold text-[#001f3f] hover:underline">+92 301 610 1870</a>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full border-2 border-[#001f3f] flex items-center justify-center group-hover:bg-[#001f3f] group-hover:text-white transition-all text-sm">✉️</div>
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=departmentmanagementsystem300@gmail.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold text-[#001f3f] text-xs md:text-sm break-all uppercase hover:underline"
                >
                  departmentmanagementsystem300@gmail.com
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form with State Binding */}
          <motion.div 
  id="contact-form" // This ID is mandatory
  className="scroll-mt-32 bg-[#001f3f] p-6 md:p-8 rounded-3xl shadow-2xl relative"
>
            <h3 className="text-lg md:text-xl font-black text-white uppercase mb-5">Get In Touch</h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="FULL NAME" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="bg-white p-3 rounded-lg font-bold text-xs uppercase outline-none focus:ring-2 ring-[#d4a017]" 
                />
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="bg-white p-3 rounded-lg font-bold text-xs uppercase outline-none focus:ring-2 ring-[#d4a017]"
                >
                  <option>STATUS</option>
                  <option>STUDENT</option>
                  <option>TEACHER</option>
                </select>
              </div>
              
              <input 
                type="email" placeholder="EMAIL" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-white p-3 rounded-lg font-bold text-xs uppercase outline-none focus:ring-2 ring-[#d4a017] w-full" 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="DEPARTMENT" 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="bg-white p-3 rounded-lg font-bold text-xs uppercase outline-none focus:ring-2 ring-[#d4a017]" 
                />
                <select 
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="bg-white p-3 rounded-lg font-bold text-xs uppercase outline-none focus:ring-2 ring-[#d4a017]"
                >
                  <option>SEMESTER (If Student)</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <textarea 
                placeholder="MESSAGE" rows="3" 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="bg-white p-3 rounded-lg font-bold text-xs uppercase outline-none focus:ring-2 ring-[#d4a017] w-full resize-none"
              ></textarea>
              
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-white text-[#001f3f] w-full py-3 rounded-lg font-black uppercase hover:bg-gray-100 transition-all flex justify-center items-center gap-2 text-xs tracking-wide"
                >
                  Submit To {showDropdown ? '▲' : '▼'}
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-30 border-2 border-[#d4a017]"
                    >
                      <button onClick={() => handleSelection("Admin")} type="button" className="w-full py-3 px-4 text-[#001f3f] font-black text-xs uppercase hover:bg-[#d4a017] hover:text-white transition-colors border-b border-gray-100 text-left">Admin</button>
                      <button onClick={() => handleSelection("Teacher")} type="button" className="w-full py-3 px-4 text-[#001f3f] font-black text-xs uppercase hover:bg-[#d4a017] hover:text-white transition-colors text-left">Teacher</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {submittedTo && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="mt-4 p-4 bg-green-500 text-white rounded-xl text-center font-black uppercase text-xs shadow-xl tracking-wide">
                    ✅ Submitted to {submittedTo} Successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>

        {/* FAQ Section with Adjusted Gaps */}
        <div className="mt-10" id="faq">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-4xl font-black text-[#001f3f] uppercase">Top Queries</h2>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="max-w-4xl mx-auto border-[4px] border-[#001f3f] rounded-3xl p-6 md:p-8 space-y-3 bg-white shadow-xl"
          >
            {[
              { q: "1. How can I access the DMS portal?", a: "Students and teachers receive login credentials from the department office. Use your official username and password to sign in safely." },
              { q: "2. What should I do if I forget my password?", a: "Simply click on the 'Forgot Password' link on the login page, enter your registered email, and follow the instructions to reset it." },
              { q: "3. How can I view my attendance and semester details?", a: "Log in to your student dashboard. You will see dedicated sections for attendance tracking, subject-wise details, and semester progress." },
              { q: "4. How do teachers update attendance or upload data?", a: "Teachers have a specialized Teacher Panel where they can mark attendance, upload course materials, and enter marks for students easily." },
              { q: "5. Is my data secure in the DMS system?", a: "Absolutely. We use secure authentication and encrypted storage to ensure that all academic and personal records remain private and protected." }
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp} className="border-b-2 border-gray-100 pb-2 last:border-0">
                <h4 className="text-base md:text-lg font-black text-[#001f3f] uppercase mb-1 leading-tight">{faq.q}</h4>
                <p className="text-gray-600 font-bold text-xs uppercase leading-relaxed opacity-80">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Contact;