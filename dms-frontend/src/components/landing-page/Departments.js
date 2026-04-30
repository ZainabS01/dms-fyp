import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Navigation ke liye

const Departments = () => {
  const navigate = useNavigate();

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const departments = [
    { name: "BS Computer Science", icon: "💻", desc: "The Computer Science Department provides students with modern technology skills, programming expertise, and hands-on software development experience.", highlights: ["Hands-on projects & Industry-level tools", "Problem-solving & Advanced computing skills"] },
    { name: "BS English", icon: "📖", desc: "The English Department enhances communication skills, literary understanding, and writing abilities through creative and critical learning.", highlights: ["Strong training in writing and communication", "Literature-based critical analysis skills"] },
    { name: "BS Mathematics", icon: "➕", desc: "The Mathematics Department builds a strong foundation in analytical thinking, logical reasoning, and quantitative problem-solving.", highlights: ["Balanced curriculum of pure and applied Mathematics", "Development of strong analytical research skills"] },
    { name: "BS Zoology", icon: "🔬", desc: "Focuses on the scientific study of animals, their behavior, physiology, and ecological roles through practical labs and research.", highlights: ["Hands-on laboratory and field observations", "Strong foundation in animal biology and ecology"] },
    { name: "BS Urdu", icon: "✍️", desc: "Offers a deep understanding of Urdu language, literature, poetry, and writing. It enhances students' creative expression.", highlights: ["Development of strong writing and linguistic skills", "Study of classical poetry and modern prose"] },
    { name: "BS Pol-Science", icon: "🏛️", desc: "Provides insight into political systems, governance, public policies, and international relations for critical thinkers.", highlights: ["Study of government structures and global affairs", "Development of leadership and decision-making skills"] },
    { name: "BS Economics", icon: "💰", desc: "Provides a deep understanding of how markets, economies, and financial systems work to study economic trends and policy-making.", highlights: ["Strong foundation in microeconomics and macroeconomics", "Development of analytical statistics skills"] }
  ];

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
        className="bg-[#001f3f] text-white py-20 px-6 text-center w-full"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-tighter">Our Departments</h1>
        <p className="text-gray-300 max-w-3xl mx-auto text-sm md:text-xl font-bold uppercase opacity-90 tracking-wide">
          A detailed overview of all academic departments within the institution
        </p>
      </motion.section>

      {/* 2. Main Departments List */}
      <div className="max-w-[1200px] mx-auto px-6 py-20 space-y-12">
        {departments.map((dept, index) => (
          <motion.div 
            key={index}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="flex flex-col md:flex-row bg-white rounded-[30px] shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow"
          >
            {/* Icon/Name Side */}
            <div className="md:w-1/3 bg-[#94a3b8] p-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-6xl bg-white/20 p-6 rounded-full">{dept.icon}</div>
              <h2 className="text-2xl font-black text-[#001f3f] uppercase italic leading-tight">{dept.name}</h2>
              <button className="bg-[#001f3f] text-white px-6 py-2 rounded-full text-xs font-bold uppercase hover:bg-white hover:text-[#001f3f] transition-all">
                Visit Department
              </button>
            </div>

            {/* Description Side */}
            <div className="md:w-2/3 p-8 md:p-12 space-y-6">
              <div>
                <h3 className="text-[#001f3f] text-xl font-black uppercase italic mb-2">Description</h3>
                <p className="text-gray-600 font-bold text-sm md:text-base leading-relaxed uppercase">{dept.desc}</p>
              </div>
              <div>
                <h3 className="text-[#001f3f] text-xl font-black uppercase italic mb-2">Highlights</h3>
                <ul className="space-y-2">
                  {dept.highlights.map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-500 font-bold text-xs md:text-sm uppercase italic">
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
      <section className="bg-white py-20 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-[#001f3f] uppercase italic mb-4">More Departments Coming Soon...!</h2>
          <p className="text-gray-500 font-bold uppercase mb-12 text-xs md:text-sm italic">Exciting new departments are on the way, stay tuned!</p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoon.map((item, index) => (
              <motion.div 
                key={index} whileHover={{ y: -10 }}
                className="bg-[#001f3f] p-8 rounded-[30px] text-white flex flex-col items-center space-y-4"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl opacity-90">{item.icon}</div>
                <h4 className="font-black uppercase text-xs tracking-widest">{item.name}</h4>
                <p className="text-[10px] opacity-60 font-bold">COMING SOON</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Request Course Section (Navigation Logic Here) */}
      <motion.section 
  className="bg-[#001f3f] py-20 px-6 text-center text-white w-full border-b-[8px] border-yellow-500"
>
        <h2 className="text-3xl md:text-5xl font-black uppercase italic mb-4">Can't Find Course</h2>
        <p className="text-gray-300 max-w-xl mx-auto font-bold uppercase text-sm md:text-lg mb-10 opacity-80 italic leading-snug">
          Requesting a new community and a course as well for better collaboration and learning.
        </p>
        <button 
  onClick={() => navigate('/contact#contact-form')} 
  className="bg-white text-[#001f3f] px-12 py-5 rounded-xl font-black uppercase italic hover:bg-[#d4a017] hover:text-white transition-all shadow-2xl tracking-widest"
>
  Request a Course
</button>
      </motion.section>
    </div>
    
  );
};

export default Departments;