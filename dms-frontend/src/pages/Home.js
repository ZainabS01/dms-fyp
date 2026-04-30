import React from 'react';
import HeroSection from '../components/landing-page/HeroSection';
import Footer from '../components/landing-page/Footer';
import { 
  Users, ShieldCheck, Zap, Database, Search, 
  Settings, PenTool, Share2, Star 
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. TOP SECTION (Blue Background Frame) */}
      <div className="bg-[#0e1629] px-4 md:px-10">
        <HeroSection />
      </div>

      {/* 2. LOWER SECTIONS (Clean White Background - No Blue Frame) */}
      <div className="bg-white">
        
        {/* Why We Built This System? */}
        <section className="py-20 px-6 md:px-20 text-center max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-[#001f3f] mb-4 uppercase tracking-tighter">
            Why We Built This System?
          </h2>
          <p className="text-gray-500 mb-16 font-bold text-base max-w-2xl mx-auto">
            To simplify academic operations by centralizing student and department data management.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: <Database />, title: "Student Data Reduction", text: "Centralized storage ensures no duplicate records across departments." },
              { icon: <Users />, title: "Transparency & Accuracy", text: "Real-time updates for grades, attendance and administrative tasks." },
              { icon: <Zap />, title: "Data Access for Students", text: "Fast and easy access to personal performance and department info." },
              { icon: <Users />, title: "Efficient Teacher Management", text: "Assign roles and manage schedules with a few simple clicks." },
              { icon: <Settings />, title: "Centralized Department Control", text: "Complete control over all departmental activities from a single dashboard." },
              { icon: <ShieldCheck />, title: "Secure & Reliable System", text: "Built with industry-standard security to keep sensitive data safe." }
            ].map((item, index) => (
              <div key={index} className="border-2 border-[#001f3f] p-10 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group bg-white flex flex-col items-center">
                <div className="bg-[#001f3f] text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-800 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-black text-[#001f3f] text-xl mb-4">{item.title}</h3>
                <p className="text-sm text-gray-500 font-bold leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What We Stand For */}
        <section className="py-20 px-6 md:px-20 flex flex-col lg:flex-row items-center gap-16 max-w-7xl mx-auto">
          <div className="lg:w-1/2 space-y-10 text-left">
            <h2 className="text-5xl font-black text-yellow-500 tracking-tight">What We Stand For</h2>
            {[
              { title: "Innovation & Simplicity", desc: "Developing easy-to-use tools that solve complex academic problems." },
              { title: "Trust & Transparency", desc: "Ensuring all academic records are accurate, reliable and secure." },
              { title: "Growth & Collaboration", desc: "Fostering an environment where departments can work together effortlessly." }
            ].map((item, i) => (
              <div key={i} className="border-l-8 border-yellow-400 p-8 rounded-r-2xl bg-gray-50 hover:bg-yellow-50 transition-colors cursor-default shadow-sm">
                <h3 className="font-black text-[#001f3f] text-2xl mb-2">{item.title}</h3>
                <p className="text-base text-gray-600 font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800" 
              alt="Team" 
              className="rounded-[3rem] w-full h-[500px] object-cover shadow-2xl border-8 border-yellow-500"
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 py-20 px-6 md:px-16 text-center">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-black text-[#001f3f] mb-4 uppercase">How It Works</h2>
            <p className="text-gray-500 mb-16 text-sm font-black italic">Simple features designed to simplify every step of academic management.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                { icon: <PenTool />, title: "Register & Login", desc: "Get started by creating your account and logging into the dashboard." },
                { icon: <Database />, title: "Upload & Manage Data", desc: "Easily upload and manage records for students and staff." },
                { icon: <Search />, title: "Track & Analyze", desc: "Use advanced tools to monitor performance and attendance." },
                { icon: <Share2 />, title: "Collaborate & Share", desc: "Seamlessly share data between different departments." }
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-6 border-2 border-[#001f3f] p-8 rounded-[3rem] text-left bg-white hover:border-yellow-500 transition-all group">
                  <div className="bg-[#001f3f] text-white p-5 rounded-full group-hover:scale-110 transition-transform">{step.icon}</div>
                  <div>
                    <h4 className="font-black text-xl mb-1 text-[#001f3f]">{step.title}</h4>
                    <p className="text-xs font-bold text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Student Insights */}
        <section className="py-24 px-6 md:px-20 text-center max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-[#001f3f] mb-16 uppercase tracking-tighter">Student Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Laiba Khan", date: "Jan 12, 2026", text: "This system has made it so easy to track my records. Highly recommended!" },
              { name: "Hamza", date: "Feb 05, 2026", text: "The interface is so simple and the data is always accurate. Great job!" },
              { name: "Zainab", date: "Mar 20, 2026", text: "Accessing department info was never this easy. It saved me so much time." }
            ].map((rev, i) => (
              <div key={i} className="bg-white border-2 border-blue-900 p-10 rounded-[3.5rem] relative text-left shadow-lg hover:shadow-2xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-black text-blue-950 text-xl">{rev.name}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rev.date}</span>
                </div>
                <div className="flex text-yellow-500 mb-6 gap-1">
                  {[...Array(5)].map((_, star) => <Star key={star} size={18} fill="currentColor"/>)}
                </div>
                <p className="text-[15px] font-bold text-gray-700 italic leading-relaxed">"{rev.text}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="pb-32 px-6 md:px-16">
          <div className="bg-[#f8fafc] border-[3px] border-[#001f3f] rounded-[4rem] p-10 md:p-20 max-w-5xl mx-auto shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-[#001f3f] text-center mb-4 uppercase">Tell Us What You Think</h2>
            <p className="text-center text-gray-500 text-sm font-bold mb-16 italic">Your feedback helps us grow and improve every feature we offer.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 text-left">
              {["Your Name", "Email", "Status", "Rating"].map((label, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <label className="text-sm font-black text-[#001f3f] ml-6">{label}</label>
                  <input type="text" className="w-full border-2 border-[#001f3f] rounded-2xl py-5 px-8 focus:ring-4 focus:ring-blue-100 outline-none font-bold shadow-inner" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 text-left mb-16">
              <label className="text-sm font-black text-[#001f3f] ml-6">What You Think</label>
              <textarea className="w-full border-2 border-[#001f3f] rounded-[3rem] p-8 min-h-[200px] focus:ring-4 focus:ring-blue-100 outline-none font-bold shadow-inner"></textarea>
            </div>
            <div className="text-center">
              <button className="bg-[#001f3f] text-white px-20 py-6 rounded-[2rem] font-black text-2xl hover:scale-105 transition-all shadow-2xl active:scale-95">
                Submit Now
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;