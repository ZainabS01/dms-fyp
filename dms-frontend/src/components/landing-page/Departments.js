import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Departments = () => {
  const navigate = useNavigate();

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const [departments, setDepartments] = useState([]);

  const defaultDepartments = [
    { name: "BS Computer Science", icon: "💻", description: "The Computer Science Department provides students with modern technology skills, programming expertise, and hands-on software development experience.", highlights: ["Hands-on projects & Industry-level tools", "Problem-solving & Advanced computing skills"] },
    { name: "BS English", icon: "📖", description: "The English Department enhances communication skills, literary understanding, and writing abilities through creative and critical learning.", highlights: ["Strong training in writing and communication", "Literature-based critical analysis skills"] },
    { name: "BS Mathematics", icon: "➕", description: "The Mathematics Department builds a strong foundation in analytical thinking, logical reasoning, and quantitative problem-solving.", highlights: ["Balanced curriculum of pure and applied Mathematics", "Development of strong analytical research skills"] },
    { name: "BS Zoology", icon: "🔬", description: "Focuses on the scientific study of animals, their behavior, physiology, and ecological roles through practical labs and research.", highlights: ["Hands-on laboratory and field observations", "Strong foundation in animal biology and ecology"] },
    { name: "BS Urdu", icon: "✍️", description: "Offers a deep understanding of Urdu language, literature, poetry, and writing. It enhances students' creative expression.", highlights: ["Development of strong writing and linguistic skills", "Study of classical poetry and modern prose"] },
    { name: "BS Pol-Science", icon: "🏛️", description: "Provides insight into political systems, governance, public policies, and international relations for critical thinkers.", highlights: ["Study of government structures and global affairs", "Development of leadership and decision-making skills"] },
    { name: "BS Economics", icon: "💰", description: "Provides a deep understanding of how markets, economies, and financial systems work to study economic trends and policy-making.", highlights: ["Strong foundation in microeconomics and macroeconomics", "Development of analytical statistics skills"] }
  ];

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments`);
        if (res.data && res.data.length > 0) {
          setDepartments(res.data.map(d => ({ ...d, name: d.name.replace(/^BS\s+/i, '').trim().toUpperCase() })));
        } else {
          setDepartments(defaultDepartments.map(d => ({ ...d, name: d.name.replace(/^BS\s+/i, '').trim().toUpperCase() })));
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
        setDepartments(defaultDepartments.map(d => ({ ...d, name: d.name.replace(/^BS\s+/i, '').trim().toUpperCase() })));
      }
    };
    fetchDepartments();
  }, []);

  const comingSoon = [
    { name: "BS Information Technology", icon: "🌐" },
    { name: "BS Botany", icon: "🌿" },
    { name: "BS Physics", icon: "⚛️" },
    { name: "BBA", icon: "💼" }
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pt-[80px] w-full overflow-x-hidden">
      
      {/* 1. Header Section */}
      <motion.section 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-[#001f3f] text-white py-8 md:py-10 px-6 text-center w-full"
      >
        <h1 className="text-2xl md:text-4xl font-bold mb-3 uppercase tracking-tighter">Our Departments</h1>
        <p className="text-gray-300 max-w-3xl mx-auto text-xs md:text-sm font-bold uppercase opacity-90 tracking-wide">
          A detailed overview of all academic departments within the institution
        </p>
      </motion.section>

      {/* 2. Main Departments List */}
      <div className="max-w-[1100px] mx-auto px-6 py-8 md:py-10 space-y-6">
        {departments.map((dept, index) => (
          <motion.div 
            key={index}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="flex flex-col md:flex-row bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow"
          >
            {/* Icon/Name Side */}
            <div className="md:w-1/3 bg-[#94a3b8] p-4 md:p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="text-4xl md:text-5xl bg-white/20 p-4 rounded-full">{dept.icon}</div>
              <h2 className="text-xl md:text-2xl font-black text-[#001f3f] uppercase leading-tight">{dept.name}</h2>
              <button 
                onClick={() => navigate('/register', { state: { selectedDept: dept.name } })}
                className="bg-[#001f3f] text-white px-6 py-2 rounded-full text-xs font-bold uppercase hover:bg-white hover:text-[#001f3f] transition-all"
              >
                Visit Department
              </button>
            </div>

            {/* Description Side */}
            <div className="md:w-2/3 p-4 space-y-3">
              <div>
                <h3 className="text-[#001f3f] text-lg font-black uppercase mb-1">Description</h3>
                <p className="text-gray-600 font-bold text-xs md:text-sm leading-relaxed uppercase">{dept.description}</p>
              </div>
              <div>
                <h3 className="text-[#001f3f] text-lg font-black uppercase mb-1">Highlights</h3>
                <ul className="space-y-1">
                  {dept.highlights.map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-500 font-bold text-xs md:text-sm uppercase tracking-wide">
                      <span className="text-[#001f3f]">●</span> {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Coming Soon Section */}
      <section className="bg-white py-8 md:py-10 px-6">
        <div className="max-w-[1100px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-[#001f3f] uppercase mb-3">More Departments Coming Soon...!</h2>
          <p className="text-gray-500 font-bold uppercase mb-8 text-[10px] md:text-xs tracking-wide">Exciting new departments are on the way, stay tuned!</p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoon.map((item, index) => (
              <motion.div 
                key={index} whileHover={{ y: -5 }}
                className="bg-[#001f3f] p-4 md:p-5 rounded-lg text-white flex flex-col items-center space-y-3"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl opacity-90">{item.icon}</div>
                <h4 className="font-black uppercase text-xs tracking-widest">{item.name}</h4>
                <p className="text-[10px] opacity-60 font-bold">COMING SOON</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Request Course Section (Navigation Logic Here) */}
      <motion.section 
  className="bg-[#001f3f] py-8 md:py-10 px-6 text-center text-white w-full border-b-[6px] border-yellow-500"
>
        <h2 className="text-2xl md:text-3xl font-black uppercase mb-3">Can't Find Course</h2>
        <p className="text-gray-300 max-w-xl mx-auto font-bold uppercase text-xs md:text-sm mb-6 opacity-90 leading-snug tracking-wide">
          Requesting a new community and a course as well for better collaboration and learning.
        </p>
        <button 
  onClick={() => navigate('/contact#contact-form')} 
  className="bg-white text-[#001f3f] px-8 py-3 rounded-lg font-black uppercase hover:bg-[#d4a017] hover:text-white transition-all shadow-lg tracking-widest text-xs md:text-sm"
>
  Request a Course
</button>
      </motion.section>
    </div>
    
  );
};

export default Departments;