import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Menu icons for mobile
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

const Navbar = () => {
  const [showRegDropdown, setShowRegDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Navigation Links array for DRY code
  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'About', path: '/about' },
    { title: 'Departments', path: '/departments' },
    { title: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white shadow-sm px-4 md:px-16 py-4 flex justify-between items-center border-b border-gray-100">
      
      {/* 1. Circular Logo Section */}
      <Link to="/" className="flex items-center">
        <div className="h-12 md:h-[60px] shrink-0 flex items-center justify-center my-auto">
          <img 
            src="/logo.png" 
            alt="DMS Logo" 
            className="h-full w-auto object-contain"
          />
        </div>
      </Link>

      {/* 2. Desktop Navigation Links */}
      <div className="hidden lg:flex gap-10 font-bold text-[#002147] text-lg">
        {navLinks.map((link) => (
          <Link 
            key={link.title} 
            to={link.path} 
            className="hover:text-[#d4a017] transition-colors"
          >
            {link.title}
          </Link>
        ))}
      </div>

      {/* 3. Desktop Action Buttons */}
      <div className="hidden lg:flex items-center gap-4">
        <button 
          onClick={() => navigate('/login')}
          className="border-2 border-[#002147] text-[#002147] px-8 py-2.5 rounded-lg font-black text-lg hover:bg-[#002147] hover:text-white transition-all duration-300"
        >
          Login
        </button>

        <div 
          className="relative"
          onMouseEnter={() => setShowRegDropdown(true)}
          onMouseLeave={() => setShowRegDropdown(false)}
        >
          <button className="bg-[#d4a017] text-white px-8 py-3 rounded-lg font-black text-lg flex items-center gap-2 shadow-md hover:bg-[#b88a14] transition-all">
            Register <span>{showRegDropdown ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</span>
          </button>

          <AnimatePresence>
            {showRegDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-64 bg-white border-2 border-[#002147] rounded-lg shadow-2xl overflow-hidden z-[110]"
              >
                <button onClick={() => navigate('/register', { state: { type: 'student' } })} className="w-full px-6 py-4 text-left font-bold text-[#002147] hover:bg-gray-50 border-b border-gray-100">Register as Student</button>
                <button onClick={() => navigate('/register', { state: { type: 'teacher' } })} className="w-full px-6 py-4 text-left font-bold text-[#002147] hover:bg-gray-50">Register as Teacher</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Mobile Menu Button (Hamburger) */}
      <div className="lg:hidden flex items-center gap-3">
        <button 
           onClick={() => navigate('/login')}
           className="text-[#002147] font-black text-sm uppercase border-b-2 border-[#002147]"
        >
            Login
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[#002147] p-2"
        >
          {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* 5. Mobile Side Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-[80px] bg-white z-[90] lg:hidden flex flex-col p-8 space-y-6 shadow-xl"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.title} 
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black text-[#002147] border-b-2 border-gray-50 pb-2"
              >
                {link.title}
              </Link>
            ))}
            
            <div className="pt-6 space-y-4">
               <p className="text-[#d4a017] font-black uppercase tracking-widest text-sm">Join Us Today</p>
               <button 
                 onClick={() => { navigate('/register', { state: { type: 'student' } }); setIsMobileMenuOpen(false); }}
                 className="w-full bg-[#002147] text-white py-4 rounded-lg font-bold text-lg"
               >
                 Register as Student
               </button>
               <button 
                 onClick={() => { navigate('/register', { state: { type: 'teacher' } }); setIsMobileMenuOpen(false); }}
                 className="w-full border-2 border-[#002147] text-[#002147] py-4 rounded-lg font-bold text-lg"
               >
                 Register as Teacher
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;