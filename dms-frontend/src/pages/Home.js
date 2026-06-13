import React, { useState, useEffect } from 'react';
import HeroSection from '../components/landing-page/HeroSection';
import { 
  Users, ShieldCheck, Zap, Database, Search, 
  Settings, PenTool, Share2, Star, ChevronLeft, ChevronRight 
} from 'lucide-react';

const Home = () => {
  const [insights, setInsights] = useState(() => {
    const savedInsights = localStorage.getItem('dmsInsights');
    return savedInsights ? JSON.parse(savedInsights) : [];
  });

  useEffect(() => {
    localStorage.setItem('dmsInsights', JSON.stringify(insights));
  }, [insights]);

  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    text: ''
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (currentIndex < insights.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.text) return;
    
    const newInsight = {
      name: formData.name,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      rating: formData.rating,
      text: formData.text
    };

    setInsights([newInsight, ...insights]);
    setFormData({ name: '', rating: 5, text: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. TOP SECTION (Blue Background Frame) */}
      <div className="bg-[#0e1629] px-4 md:px-10">
        <HeroSection />
      </div>

      {/* 2. LOWER SECTIONS (Clean White Background - No Blue Frame) */}
      <div className="bg-white">
        
        {/* Why We Built This System? */}
        <section className="py-8 md:py-10 px-6 md:px-16 text-center max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[#001f3f] mb-3 uppercase tracking-tighter">
            Why We Built This System?
          </h2>
          <p className="text-gray-500 mb-8 font-bold text-xs md:text-sm max-w-2xl mx-auto">
            To simplify academic operations by centralizing student and department data management.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Database />, title: "Student Data Reduction", text: "Centralized storage ensures no duplicate records across departments." },
              { icon: <Users />, title: "Transparency & Accuracy", text: "Real-time updates for grades, attendance and administrative tasks." },
              { icon: <Zap />, title: "Data Access for Students", text: "Fast and easy access to personal performance and department info." },
              { icon: <Users />, title: "Efficient Teacher Management", text: "Assign roles and manage schedules with a few simple clicks." },
              { icon: <Settings />, title: "Centralized Department Control", text: "Complete control over all departmental activities from a single dashboard." },
              { icon: <ShieldCheck />, title: "Secure & Reliable System", text: "Built with industry-standard security to keep sensitive data safe." }
            ].map((item, index) => (
              <div key={index} className="border-2 border-[#001f3f] p-6 rounded-[2rem] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group bg-white flex flex-col items-center">
                <div className="bg-[#001f3f] text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-800 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-black text-[#001f3f] text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 font-bold leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What We Stand For */}
        <section className="py-8 md:py-10 px-6 md:px-16 flex flex-col lg:flex-row items-center gap-6 md:gap-8 max-w-7xl mx-auto">
          <div className="lg:w-1/2 space-y-6 text-left">
            <h2 className="text-2xl md:text-3xl font-black text-yellow-500 tracking-tight">What We Stand For</h2>
            {[
              { title: "Innovation & Simplicity", desc: "Developing easy-to-use tools that solve complex academic problems." },
              { title: "Trust & Transparency", desc: "Ensuring all academic records are accurate, reliable and secure." },
              { title: "Growth & Collaboration", desc: "Fostering an environment where departments can work together effortlessly." }
            ].map((item, i) => (
              <div key={i} className="border-l-8 border-yellow-400 p-6 md:p-8 rounded-r-2xl bg-gray-50 hover:bg-yellow-50 transition-colors cursor-default shadow-sm">
                <h3 className="font-black text-[#001f3f] text-xl mb-2">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-600 font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="lg:w-1/2 w-full mt-8 lg:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800" 
              alt="Team" 
              className="rounded-[2rem] w-full h-[300px] md:h-[400px] object-cover shadow-2xl border-4 md:border-8 border-yellow-500"
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 py-8 md:py-10 px-6 md:px-16 text-center">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-[#001f3f] mb-2 uppercase">How It Works</h2>
            <p className="text-gray-500 mb-8 text-xs md:text-sm font-black tracking-wide">Simple features designed to simplify every step of academic management.</p>
            
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
        <section className="py-8 md:py-10 px-6 md:px-16 text-center max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[#001f3f] mb-6 uppercase tracking-tighter">Student Insights</h2>
          {insights.length === 0 ? (
            <p className="text-gray-500 font-bold">No insights yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="relative">
              {insights.length > 3 && (
                <button 
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className={`absolute left-[-10px] md:left-[-40px] top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-xl transition-all duration-300 ${currentIndex === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#001f3f] text-white hover:bg-[#d4a017] hover:scale-110'}`}
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {insights.slice(currentIndex, currentIndex + 3).map((rev, i) => (
                  <div key={i} className="bg-white border-2 border-blue-900 p-8 rounded-3xl relative text-left shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-blue-950 text-lg">{rev.name}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rev.date}</span>
                      </div>
                      <div className="flex mb-4 gap-1">
                        {[...Array(5)].map((_, star) => (
                          <Star 
                            key={star} 
                            size={16} 
                            className={star < (rev.rating || 5) ? "text-yellow-500" : "text-gray-200"}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <p className="text-sm font-bold text-gray-700 leading-relaxed">"{rev.text}"</p>
                    </div>
                  </div>
                ))}
              </div>

              {insights.length > 3 && (
                <button 
                  onClick={nextSlide}
                  disabled={currentIndex >= insights.length - 3}
                  className={`absolute right-[-10px] md:right-[-40px] top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-xl transition-all duration-300 ${currentIndex >= insights.length - 3 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#001f3f] text-white hover:bg-[#d4a017] hover:scale-110'}`}
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          )}
        </section>

        {/* Contact Form */}
        <section className="pb-12 px-6 md:px-16">
          <div className="bg-[#f8fafc] border-[1.5px] border-[#001f3f] rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-lg">
            <h2 className="text-xl md:text-2xl font-black text-[#001f3f] text-center mb-1 uppercase tracking-tight">Tell Us What You Think</h2>
            <p className="text-center text-gray-500 text-[10px] font-bold mb-6 tracking-wide">Your feedback helps us grow and improve every feature we offer.</p>
            
            <form onSubmit={handleReviewSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-left">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-[#001f3f] ml-2 uppercase tracking-wide">Your Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-[1.5px] border-[#001f3f] rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-100 outline-none font-bold shadow-inner text-xs bg-white" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-[#001f3f] ml-2 uppercase tracking-wide">Rating</label>
                  <select value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="w-full border-[1.5px] border-[#001f3f] rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-100 outline-none font-bold shadow-inner text-xs bg-white cursor-pointer">
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-left mb-6">
                <label className="text-[10px] font-black text-[#001f3f] ml-2 uppercase tracking-wide">What You Think</label>
                <textarea required value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full border-[1.5px] border-[#001f3f] rounded-xl p-3 min-h-[80px] focus:ring-2 focus:ring-blue-100 outline-none font-bold shadow-inner text-xs bg-white"></textarea>
              </div>
              <div className="text-center">
                <button type="submit" className="bg-[#001f3f] text-white px-8 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-[#d4a017] transition-all shadow-md active:scale-95">
                  Submit Now
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;