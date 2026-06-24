import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';


const Contact = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [submittedTo, setSubmittedTo] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  // 1. Form Reset State
  const [formData, setFormData] = useState({
    fullName: "",
    status: "",
    email: "",
    department: "",
    semester: "",
    message: ""
  });
  
  const [departmentsList, setDepartmentsList] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/departments`)
      .then(res => setDepartmentsList(res.data.map(d => {
        const name = d.name.replace(/^BS\s+/i, '').trim();
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      })))
      .catch(err => console.error("Error fetching departments:", err));
  }, []);

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
        semester: formData.status === "Student" ? formData.semester : "N/A",
        subject: "Contact Form Query",
        message: formData.message,
        recipient: target.toLowerCase()
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/query/add`, queryData);

      setSubmittedTo(target);
      setShowDropdown(false);
      
      setFormData({
        fullName: "",
        status: "",
        email: "",
        department: "",
        semester: "",
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
  className="scroll-mt-32 bg-[#001f3f] p-5 md:p-6 rounded-lg shadow-2xl relative"
>
            <h3 className="text-lg md:text-xl font-black text-white uppercase mb-5">Get In Touch</h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Full Name" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="bg-white p-3 rounded-lg font-bold text-sm outline-none focus:ring-2 ring-[#d4a017]" 
                />
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="bg-white p-3 rounded-lg font-bold text-sm outline-none focus:ring-2 ring-[#d4a017]"
                >
                  <option value="" disabled hidden>Status</option>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                </select>
              </div>
              
              <input 
                type="email" placeholder="Email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-white p-3 rounded-lg font-bold text-sm outline-none focus:ring-2 ring-[#d4a017] w-full" 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="bg-white p-3 rounded-lg font-bold text-sm outline-none focus:ring-2 ring-[#d4a017]" 
                >
                  <option value="" disabled hidden>Department</option>
                  {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="bg-white p-3 rounded-lg font-bold text-sm outline-none focus:ring-2 ring-[#d4a017]"
                >
                  <option value="" disabled hidden>Semester (If Student)</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s} Semester</option>)}
                </select>
              </div>

              <textarea 
                placeholder="Message" rows="3" 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="bg-white p-3 rounded-lg font-bold text-sm outline-none focus:ring-2 ring-[#d4a017] w-full resize-none"
              ></textarea>
              
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-white text-[#001f3f] w-full py-3 rounded-lg font-black hover:bg-gray-100 transition-all flex justify-center items-center gap-2 text-sm tracking-wide"
                >
                  Submit To <span>{showDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-2xl overflow-hidden z-30 border-2 border-[#d4a017]"
                    >
                      <button onClick={() => handleSelection("Admin")} type="button" className="w-full py-3 px-4 text-[#001f3f] font-black text-sm hover:bg-[#d4a017] hover:text-white transition-colors border-b border-gray-100 text-left">Admin</button>
                      <button onClick={() => handleSelection("Teacher")} type="button" className="w-full py-3 px-4 text-[#001f3f] font-black text-sm hover:bg-[#d4a017] hover:text-white transition-colors text-left">Teacher</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {submittedTo && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="mt-4 p-4 bg-green-500 text-white rounded-lg text-center font-black uppercase text-xs shadow-xl tracking-wide">
                    ✅ Submitted to {submittedTo} Successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section with Accordion */}
      <div className="w-full bg-[#f4f7f6] py-16 md:py-20 border-t border-gray-100" id="faq">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-5xl font-black text-[#001f3f] uppercase tracking-tight">Top Queries</h2>
            <div className="w-24 h-1 bg-[#d4a017] mx-auto mt-4 rounded-full"></div>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            className="max-w-[800px] mx-auto px-4"
          >
            <div className="space-y-4">
              {[
                { q: "How can I access the DMS portal?", a: "Students and teachers receive login credentials from the department office. Use your official username and password to sign in safely." },
                { q: "What should I do if I forget my password?", a: "Simply click on the 'Forgot Password' link on the login page, enter your registered email, and follow the instructions to reset it." },
                { q: "How can I view my attendance and semester details?", a: "Log in to your student dashboard. You will see dedicated sections for attendance tracking, subject-wise details, and semester progress." },
                { q: "How do teachers update attendance or upload data?", a: "Teachers have a specialized Teacher Panel where they can mark attendance, upload course materials, and enter marks for students easily." },
                { q: "Is my data secure in the DMS system?", a: "Absolutely. We use secure authentication and encrypted storage to ensure that all academic and personal records remain private and protected." }
              ].map((faq, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeInUp} 
                  className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                  >
                    <h4 className="text-base md:text-lg font-bold text-[#001f3f] pr-4">{faq.q}</h4>
                    <span className={`text-[#d4a017] transform transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : 'rotate-0'}`}>
                      <ChevronDown size={20} />
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-gray-600 font-medium text-sm md:text-base leading-relaxed border-t border-gray-100 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;