import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  // Animation Variants
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    // 1. "pt-[110px]" se top gap add kiya aur "w-full" se poori screen par spread kiya
<div className="bg-white w-full min-h-screen pt-[100px] md:pt-[80px] overflow-x-hidden">
      
      {/* 2. "max-w-none" aur "w-full" se side gaps khatam ho jayenge */}
      <div className="w-full mx-auto px-0 md:px-100 pb-20">
        
        {/* 1. Header Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-[#001f3f] text-white py-16 px-6 text-center w-full"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-4 uppercase ">About The Department Management System</h1>
          <p className="text-gray-300 max-w-1xl mx-auto text-sm md:text-lg font-bold uppercase">
            Learn more about the system and the purpose behind its development.
          </p>
        </motion.section>

        {/* 2. White Content Area */}
        <div className="bg-white px-6 md:px-16 py-12 space-y-20 w-full">
          
          {/* What is DMS? Section */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="border-4 border-[#001f3f] p-8 md:p-12 rounded-3xl text-center shadow-lg bg-gray-50"
          >
            <h2 className="text-2xl md:text-4xl font-black text-[#001f3f] mb-6 underline decoration-4 underline-offset-8 uppercase">What is DMS?</h2>
            <p className="text-gray-700 text-justify text-sm md:text-lg font-bold leading-relaxed max-w-4xl mx-auto uppercase">
              The Department Management System (DMS) is a simple, smart, and efficient 
              platform designed to digitalize all academic and administrative processes 
              within the department. This system helps teachers, students, and 
              administrators manage records easily with improved accuracy and faster access. 
              DMS organizes student information, attendance, semester data, courses, and announcements in one secure place.
            </p>
          </motion.div>

          {/* Vision & Mission Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="order-2 md:order-1">
              <h2 className="text-3xl font-black text-[#001f3f] mb-4 uppercase">Our Vision</h2>
              <p className="text-gray-600 font-bold uppercase text-sm leading-relaxed">
                Our vision is to create a modern, fully digital department where information is organized, transparent, and always accessible. We aim to use technology to improve communication, decision-making, and overall academic efficiency.
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="order-1 md:order-2">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=500" alt="Vision" className="rounded-[2rem] border-4 border-[#001f3f] shadow-xl w-full h-64 object-cover" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=500" alt="Mission" className="rounded-[2rem] border-4 border-[#001f3f] shadow-xl w-full h-64 object-cover" />
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <h2 className="text-3xl font-black text-[#001f3f] mb-4 uppercase">Our Mission</h2>
              <p className="text-gray-600 font-bold uppercase text-sm leading-relaxed text-justify">
                Our mission is to simplify and digitalize all departmental tasks for faster, accurate, and smooth management. We aim to provide a smart system that supports teachers, students, and administrators with easy access to reliable information.
              </p>
            </motion.div>
          </div>

          {/* Meet My Mates Section */}
          <section className="bg-slate-400 -mx-6 md:-mx-16 py-16 px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-[#001f3f] mb-2 uppercase ">Meet My Mates</h2>
            <p className="text-[#001f3f] font-bold mb-12 uppercase opacity-80">The brains and passion behind the development of this system</p>
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              {[
                { name: "Zainab", role: "Frontend Developer" },
                { name: "Khadija", role: "Backend Developer" },
                { name: "Bisma", role: "UI/UX Designer" }
              ].map((mate, index) => (
                <motion.div key={index} variants={fadeIn} className="bg-white p-6 rounded-3xl border-b-8 border-[#001f3f] shadow-2xl hover:-translate-y-2 transition-transform">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 border-4 border-[#d4a017] overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${mate.name}`} alt={mate.name} />
                  </div>
                  <h3 className="text-xl font-black text-[#001f3f] uppercase">{mate.name}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase italic">{mate.role}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Work Ethics Section */}
          <div className="text-center pb-10">
            <h2 className="text-3xl font-black text-[#001f3f] mb-2 uppercase">Our Work Ethics</h2>
            <p className="text-gray-500 font-bold mb-10 uppercase text-xs">Dedicated to integrity, quality, and continuous improvement</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Integrity', 'Efficiency', 'Innovation', 'Excellence'].map((ethic, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-[#001f3f] transition-all"
                >
                  <h4 className="font-black text-[#001f3f] text-sm uppercase">{ethic}</h4>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;