import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0e1629] px-4 md:px-0 pb-4 pt-[90px] md:pt-[105px]">
      <section className="bg-white border-x-4 border-b-4 border-[#001f3f] pt-8 md:pt-10 pb-8 px-6 md:px-16 relative overflow-hidden">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Left Text: slide-in effect style */}
          <div className="order-2 md:order-1 transition-all duration-700">
            <h1 className="text-3xl md:text-[40px] font-[900] text-[#001f3f] leading-[1.15] mb-4">
              Empowering Education Through <br className="hidden md:block" /> 
              Smart Management
            </h1>
            <p className="text-gray-700 text-sm md:text-[15px] font-bold max-w-lg mb-6 leading-relaxed">
              A smart and efficient way to manage students, teachers, attendance, and departmental records, 
              all in one place.
            </p>
            
            <button 
              onClick={() => navigate('/register')}
              className="group bg-[#001f3f] text-white px-8 md:px-10 py-3 md:py-3.5 rounded-xl text-lg md:text-xl font-bold hover:shadow-[0_0_20px_rgba(0,31,63,0.4)] transition-all duration-300 flex items-center gap-3">
              Unlock the System
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>

          {/* Right Images: Floating Pill Animation */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end items-start gap-4 md:gap-6">
            <div className="w-28 h-52 md:w-36 md:h-64 rounded-full border-[3px] border-[#001f3f] overflow-hidden shadow-lg hover:scale-105 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=500" 
                alt="Student" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating effect given to this pill using animate-bounce or custom margin-top */}
            <div className="w-28 h-52 md:w-36 md:h-64 rounded-full border-[3px] border-[#001f3f] overflow-hidden mt-8 md:mt-12 shadow-lg hover:scale-105 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=500" 
                alt="Library" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bottom Quote with Fade-in Effect */}
        <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-4 text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-[#001f3f] tracking-tight">
            “Learning today, leading tomorrow.”
          </h2>
          <div className="animate-bounce mt-3 md:mt-0">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3135/3135810.png" 
              alt="Grad Cap" 
              className="w-10 h-10 md:w-12 md:h-12"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;