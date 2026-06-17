import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };

  return (
    <footer className="w-full bg-white">
      {/* 1. Dark Blue CTA Section */}
      <div className="bg-[#001f3f] text-white py-16 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 uppercase">
          Let's Join — According to Your Department
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-sm md:text-base uppercase">
          Choose your department and be part of a smarter, connected academic system.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link to="/departments" onClick={handleScrollToTop}>
            <button className="bg-white text-[#002147] px-8 py-2.5 rounded font-bold hover:bg-gray-100 transition uppercase w-full md:w-auto">
              Departments
            </button>
          </Link>
          <Link to="/contact" onClick={handleScrollToTop}>
            <button className="border border-white text-white px-8 py-2.5 rounded font-bold hover:bg-white hover:text-[#002147] transition uppercase w-full md:w-auto">
              Contact Us
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Detailed Link Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" onClick={handleScrollToTop} className="flex items-center gap-2">
            <div className="w-10 h-10 shrink-0">
              <img
                src="/logo.png"
                alt="DMS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-[#002147] text-lg uppercase">
              Department Management System
            </span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            A comprehensive solution for modern institutions to manage students,
            faculty, and administration with real-time insights and security.
          </p>
        </div>

        {/* Links Column 1 - Clickable & Scroll to Top */}
        <div>
          <h4 className="font-bold text-[#002147] mb-4 text-sm uppercase tracking-wider underline decoration-2 underline-offset-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-500 text-sm font-bold uppercase">
            <li>
              <Link to="/" onClick={handleScrollToTop} className="hover:text-[#002147] transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/about" onClick={handleScrollToTop} className="hover:text-[#002147] transition-colors">About</Link>
            </li>
            <li>
              <Link to="/departments" onClick={handleScrollToTop} className="hover:text-[#002147] transition-colors">Departments</Link>
            </li>
            {/* <li>
              <Link to="/resources" onClick={handleScrollToTop} className="hover:text-[#002147] transition-colors">Resources</Link>
            </li> */}
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="font-bold text-[#002147] mb-4 text-sm uppercase tracking-wider underline decoration-2 underline-offset-4">Support</h4>
          <ul className="space-y-2 text-gray-500 text-sm font-bold uppercase">
            <li>
              <Link to="/contact" onClick={handleScrollToTop} className="hover:text-[#002147] transition-colors">Help Center</Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => {
                  setTimeout(() => {
                    const faqElement = document.getElementById('faq');
                    if (faqElement) {
                      faqElement.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }
                  }, 300);
                }}
                className="hover:text-[#002147] transition-colors"
              >
                FAQ
              </Link>
            </li>
            <li>
              <a href="/DMS_Documentation.pdf" download className="hover:text-[#002147] transition-colors">Documentation</a>
            </li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div>
          <h4 className="font-bold text-[#002147] mb-4 text-sm uppercase tracking-wider underline decoration-2 underline-offset-4">Contact Us</h4>
          <ul className="space-y-2 text-gray-500 text-sm font-bold">
            <li className="break-all hover:text-[#002147] transition-colors">
              <Link to="/contact" onClick={handleScrollToTop}>
                departmentmanagementsystem300@gmail.com
              </Link>
            </li>
            <li className="hover:text-[#002147] transition-colors">
              <Link to="/contact" onClick={handleScrollToTop}>
                +92 301 610 1870
              </Link>
            </li>
            <li className="uppercase underline underline-offset-4">CS Department, FYP Lab</li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="border-t border-gray-100 py-6 text-center text-gray-400 text-xs font-semibold tracking-widest uppercase">
        © 2026 Department Management System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;