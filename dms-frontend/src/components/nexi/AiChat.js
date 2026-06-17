import React, { useState, useEffect, useRef } from 'react';
import { FiSidebar, FiEdit3, FiMic, FiSend, FiTrash2, FiCopy, FiPaperclip, FiX, FiArrowLeft } from 'react-icons/fi';
import { openaiServices } from '../services/openaiServices';
import toast from 'react-hot-toast';

// Real logo component using the nexi.png asset
const NexiLogo = ({ className = "w-10 h-10" }) => (
  <img 
    src="/nexi.png" 
    alt="Nexi Logo" 
    className={`${className} object-contain`} 
  />
);

// Simple helper to render bold text parsed from **text**
const formatBoldText = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-[#001f3f]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// Helper to parse and render standard markdown images ![alt](url) alongside bold formatting
const parseMarkdownImagesAndBold = (text) => {
  if (!text) return '';
  const parts = text.split(/(!\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    if (part.startsWith('![') && part.endsWith(')')) {
      const match = part.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const alt = match[1];
        const url = match[2];
        return (
          <img 
            key={`img-${index}`} 
            src={url} 
            alt={alt} 
            className="max-w-full md:max-w-md rounded-2xl my-3.5 border border-slate-200 shadow-md block hover:scale-[1.01] transition-transform duration-300"
          />
        );
      }
    }
    return formatBoldText(part);
  });
};

const formatResponseText = (text) => {
  if (!text) return '';
  
  // Split text into lines
  const lines = text.split('\n');
  const formattedElements = [];
  let currentList = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Check if it is a bullet point (starts with -, *, •)
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('• ')) {
      const bulletText = trimmedLine.substring(2);
      currentList.push(
        <li key={`li-${index}`} className="ml-5 list-disc mb-1.5 text-xs lg:text-sm font-semibold text-[#001f3f]/90 leading-relaxed">
          {parseMarkdownImagesAndBold(bulletText)}
        </li>
      );
    } else {
      // If we were building a list, push it now
      if (currentList.length > 0) {
        formattedElements.push(
          <ul key={`ul-${index}`} className="my-2 space-y-1">
            {currentList}
          </ul>
        );
        currentList = [];
      }

      if (trimmedLine) {
        // Render normal paragraph
        formattedElements.push(
          <p key={`p-${index}`} className="mb-2 text-xs lg:text-sm font-semibold leading-relaxed text-[#001f3f]/90">
            {parseMarkdownImagesAndBold(trimmedLine)}
          </p>
        );
      } else {
        // Render spacing for empty line
        formattedElements.push(<div key={`space-${index}`} className="h-2" />);
      }
    }
  });

  // Push any trailing list
  if (currentList.length > 0) {
    formattedElements.push(
      <ul key="ul-trailing" className="my-2 space-y-1">
        {currentList}
      </ul>
    );
  }

  return formattedElements;
};

const NexiChat = ({ user, setActiveTab, isOpen, onClose, backTab = 'overview' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('ur-PK'); // Default to Urdu for Pakistani students
  const [voiceError, setVoiceError] = useState('');
  const [attachedImage, setAttachedImage] = useState(null); // Base64 attached image
  const fileInputRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Local storage backup conversations list
  const [conversations, setConversations] = useState([]);

  // Sync sendMessage reference to avoid hooks closure trap
  const sendMessageRef = useRef(null);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  // Setup Web Speech API for voice typing
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;

      rec.onstart = () => {
        setIsListening(true);
        setVoiceError('');
      };

      rec.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          if (transcript.trim()) {
            setInputText(transcript);
            if (sendMessageRef.current) {
              sendMessageRef.current(transcript);
            }
          }
        } else {
          setInputText(transcript);
        }
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error", e);
        setVoiceError(e.error);
        setIsListening(false);
        toast.error(`Voice Error: ${e.error}`, { id: 'voice-toast' });
        setTimeout(() => setVoiceError(''), 4000);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Fetch conversations on load from backend API
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await openaiServices.getConversations();
        if (res.success) {
          setConversations(res.conversations);
        }
      } catch (err) {
        console.warn("Failed to load conversations from backend API, falling back to LocalStorage:", err);
        const saved = localStorage.getItem('nexi_conversations');
        if (saved) {
          try {
            setConversations(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse local storage conversations:", e);
          }
        }
      }
    };
    loadConversations();
  }, []);

  // Sync state to local storage as fallback database
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('nexi_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const activeConversation = conversations.find(c => (c._id || c.id) === activeConversationId);
  const activeMessages = activeConversation ? activeConversation.messages : [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, isLoading]);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else if (setActiveTab) {
      setActiveTab(backTab);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteConversation = async (id) => {
    const idStr = id ? id.toString() : '';
    if (idStr.startsWith('temp-conv-')) {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
      return;
    }

    try {
      const res = await openaiServices.deleteConversation(id);
      if (res.success) {
        setConversations(prev => prev.filter(c => c._id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
        }
      }
    } catch (err) {
      console.error("API Error deleting conversation, deleting locally:", err);
      setConversations(prev => prev.filter(c => (c._id || c.id) !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    }
  };

  const handleImageAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = voiceLang; // Apply dynamic English/Urdu choice
      recognitionRef.current.start();
    }
  };

  const handleCopyMessage = (text, msgId) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleDownloadPDF = (msg) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to download PDF.");
      return;
    }

    let htmlContent = msg.text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/\* (.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/\n/g, '<br />');

    if (htmlContent.includes('<li>')) {
      htmlContent = htmlContent.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');
      htmlContent = htmlContent.replace(/<\/ul>\s*<ul>/g, '');
    }

    let imgHtml = '';
    if (msg.image) {
      const imgSrc = msg.image.startsWith('data:') || msg.image.startsWith('http') 
        ? msg.image 
        : `${process.env.REACT_APP_API_URL}/${msg.image}`;
      imgHtml = `<div class="image-container" style="display: flex; justify-content: center; margin: 30px 0;"><img src="${imgSrc}" alt="Diagram/Attached Image" style="max-width: 100%; max-height: 450px; border-radius: 12px; border: 1px solid #e2e8f0;" /></div>`;
    } else {
      const inlineImgMatch = msg.text.match(/!\[.*?\]\((.*?)\)/);
      if (inlineImgMatch) {
        const imgSrc = inlineImgMatch[1];
        imgHtml = `<div class="image-container" style="display: flex; justify-content: center; margin: 30px 0;"><img src="${imgSrc}" alt="Diagram/Image" style="max-width: 100%; max-height: 450px; border-radius: 12px; border: 1px solid #e2e8f0;" /></div>`;
        htmlContent = htmlContent.replace(/!\[.*?\]\(.*?\)/g, '');
      }
    }

    const printDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const docTitle = activeConversation?.title || "DMS Study Notes";

    printWindow.document.write(`
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; color: #001f3f; margin: 0; padding: 40px; background-color: #fff; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #d4a017; padding-bottom: 20px; margin-bottom: 30px; }
            .header-title { margin: 0; font-size: 24px; font-weight: 800; color: #001f3f; text-transform: uppercase; letter-spacing: 1px; }
            .header-subtitle { margin: 5px 0 0 0; font-size: 12px; font-weight: 600; color: #d4a017; letter-spacing: 0.5px; }
            .header-right { text-align: right; font-size: 11px; color: #64748b; font-weight: 600; }
            .content { font-size: 14px; color: #1e293b; margin-bottom: 30px; }
            .content p { margin-bottom: 15px; }
            .content strong { color: #001f3f; font-weight: 600; }
            .content ul { margin-left: 20px; margin-bottom: 15px; }
            .content li { margin-bottom: 6px; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="header-title">DMS PORTAL</h1>
              <div class="header-subtitle">NEXI AI Assistant Study Material</div>
            </div>
            <div class="header-right">
              <div>Date: ${printDate}</div>
              <div>Student: ${user?.name || 'Zami'}</div>
              <div>Session: ${docTitle}</div>
            </div>
          </div>
          <div class="content">${htmlContent}</div>
          ${imgHtml}
          <div class="footer">
            Department Management System (DMS) • Digital Study Material
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleStartEdit = (msgId, text) => {
    setEditingMessageId(msgId);
    setEditingText(text);
  };

  const handleSaveEdit = async (msgId) => {
    if (!editingText.trim() || isLoading) return;

    // Save current messages for backup/rollback
    const activeConv = conversations.find(c => (c._id || c.id) === activeConversationId);
    if (!activeConv) return;
    const oldMessages = activeConv.messages;

    // Optimistic Update: edit text and remove all messages after this edited message in client state
    setConversations(prev => prev.map(conv => {
      if ((conv._id || conv.id) === activeConversationId) {
        const msgIndex = conv.messages.findIndex(m => (m.id || m._id) === msgId);
        if (msgIndex !== -1) {
          const updatedMessages = conv.messages.slice(0, msgIndex + 1).map(m => 
            (m.id || m._id) === msgId ? { ...m, text: editingText } : m
          );
          return { ...conv, messages: updatedMessages };
        }
      }
      return conv;
    }));

    setIsLoading(true);
    setEditingMessageId(null);

    try {
      const activeIdStr = activeConversationId ? activeConversationId.toString() : '';
      if (activeIdStr.startsWith('temp-conv-')) {
        throw new Error("Cannot edit temporary conversation on server");
      }

      const res = await openaiServices.editMessage(activeConversationId, msgId, editingText);
      if (res.success && res.conversation) {
        setConversations(prev => prev.map(conv => 
          (conv._id || conv.id) === activeConversationId ? res.conversation : conv
        ));
      }
    } catch (err) {
      console.warn("API edit message failed, falling back to local simulation:", err);
      // Fallback: restore messages and just do inline text replacement
      setConversations(prev => prev.map(conv => {
        if ((conv._id || conv.id) === activeConversationId) {
          return {
            ...conv,
            messages: oldMessages.map(m => (m.id || m._id) === msgId ? { ...m, text: editingText } : m)
          };
        }
        return conv;
      }));
    } finally {
      setIsLoading(false);
      setEditingText('');
    }
  };

  const getAiResponse = (userText) => {
    const text = userText.toLowerCase();
    if (text.includes('what is dms') || text.includes('dms?')) {
      return {
        text: 'The Department Management System (DMS) is a simple, smart, and efficient platform designed to digitalize all academic and administrative processes within the department.',
        suggestions: ['How to manage it?', 'How to manage it?']
      };
    } else if (text.includes('how to manage') || text.includes('manage')) {
      return {
        text: 'To manage DMS, navigate to the sidebar menu items. Teachers can manage attendance, verification, upload results, and create tasks, while admins can manage faculty, notices, and students.',
        suggestions: ['Timetable schedule', 'Query Hub']
      };
    } else if (text.includes('paper') || text.includes('solution')) {
      return {
        text: 'Paper solutions are available under the Course Data tab. Students can download or view standard solutions uploaded by their professors.',
        suggestions: ['What is DMS?', 'Timetable schedule']
      };
    }

    return {
      text: "I am NEXI, your intelligent helper. I can support you with managing DMS, finding paper solutions, looking up class timetables, and answering portal queries.",
      suggestions: ['What is DMS?', 'Paper solution']
    };
  };

  const sendMessage = async (textToSend, imageToSend = null) => {
    const finalImage = imageToSend || attachedImage;
    if (!textToSend.trim() && !finalImage) return;
    if (isLoading) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      image: finalImage,
      timestamp: 'Delivered'
    };

    setIsLoading(true);
    let targetConvId = activeConversationId;

    // Fast-optimistic UI Update: Render user message immediately
    if (!targetConvId) {
      const tempConvId = `temp-conv-${Date.now()}`;
      const tempConv = {
        id: tempConvId,
        title: textToSend.length > 20 ? textToSend.slice(0, 18) + '...' : textToSend,
        messages: [userMessage]
      };
      setConversations(prev => [tempConv, ...prev]);
      setActiveConversationId(tempConvId);
      targetConvId = tempConvId;
    } else {
      setConversations(prev => prev.map(conv => {
        if ((conv._id || conv.id) === targetConvId) {
          return { ...conv, messages: [...conv.messages, userMessage] };
        }
        return conv;
      }));
    }

    setInputText('');
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      let res;
      const targetIdStr = targetConvId ? targetConvId.toString() : '';
      if (targetIdStr.startsWith('temp-conv-')) {
        // Create new conversation via backend API
        res = await openaiServices.startConversation(textToSend, finalImage);
      } else {
        // Add message to existing conversation via backend API
        res = await openaiServices.sendMessage(targetConvId, textToSend, finalImage);
      }

      if (res.success && res.conversation) {
        // Swap out client placeholder with real DB conversation object
        setConversations(prev => prev.map(conv => {
          if ((conv._id || conv.id) === targetConvId) {
            return res.conversation;
          }
          return conv;
        }));
        const targetIdStr = targetConvId ? targetConvId.toString() : '';
        if (targetIdStr.startsWith('temp-conv-')) {
          setActiveConversationId(res.conversation._id);
        }
      }
    } catch (err) {
      console.warn("API Request failed, reverting to simulated client AI response:", err);
      // Offline fallback
      const responseData = getAiResponse(textToSend);
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseData.text,
        suggestions: responseData.suggestions
      };

      setConversations(prev => prev.map(conv => {
        if ((conv._id || conv.id) === targetConvId) {
          const cleanedMessages = (conv.messages || []).map(m => {
            const mId = m ? (m.id || m._id) : null;
            const mIdStr = mId ? mId.toString() : '';
            return mIdStr.startsWith('temp-') ? { ...m, id: Date.now() } : m;
          });
          return {
            ...conv,
            messages: [...cleanedMessages, aiMessage]
          };
        }
        return conv;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage(inputText);
    }
  };

  const containerClass = "flex flex-col lg:flex-row h-full w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden";

  return (
    <div className={containerClass}>
      
      {/* Left Sidebar (Overlay on mobile, inline on desktop) */}
      <div className={`transition-all duration-300 ease-in-out bg-[#f8fafc] border-r border-slate-200 flex flex-col flex-shrink-0 h-full absolute lg:relative z-20 ${
        isSidebarOpen ? 'w-full sm:w-[320px] lg:w-[280px] opacity-100 translate-x-0' : 'w-full sm:w-[320px] lg:w-0 opacity-0 -translate-x-full lg:translate-x-0 pointer-events-none border-r-0 overflow-hidden'
      }`}>
        {/* Sidebar Header with Logo and Assistant Title */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NexiLogo className="w-10 h-10 flex-shrink-0" />
            <div className="text-left leading-tight">
              <h4 className="font-black text-[#001f3f] text-sm">The DMS Assistant</h4>
              <p className="text-slate-400 text-[10px] font-bold">Your Intelligent Helper</p>
            </div>
          </div>
          {/* Mobile close sidebar button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-[#001f3f]/70 hover:text-[#d4a017] p-1.5 hover:bg-slate-200 rounded-lg transition-all"
            title="Close Sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Conversations List Header */}
        <div className="p-4 pb-2 flex justify-between items-center">
          <h5 className="text-xs font-black text-[#001f3f]/50 uppercase tracking-widest">Conversations</h5>
          <button 
            onClick={handleNewChat}
            className="text-[#001f3f]/50 hover:text-[#001f3f] p-1.5 hover:bg-slate-200 rounded-lg transition-all"
            title="New Chat"
          >
            <FiEdit3 size={16} />
          </button>
        </div>

        {/* Conversations list matching user pills with Portal Theme styling */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5 custom-scrollbar">
          {conversations.map((item) => {
            const itemId = item._id || item.id;
            const isActive = activeConversationId === itemId;
            return (
              <div key={itemId} className="relative group w-full">
                <button 
                  onClick={() => handleSelectConversation(itemId)}
                  className={`w-full text-left p-3.5 pr-10 rounded-xl text-xs font-black transition-all truncate border block ${
                    isActive 
                      ? 'bg-[#001f3f] border-[#d4a017] text-[#d4a017] shadow-sm font-black' 
                      : 'bg-slate-200/50 hover:bg-slate-200 border-transparent text-[#001f3f]/80 hover:text-[#001f3f]'
                  }`}
                >
                  {item.title}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(itemId);
                  }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all ${
                    isActive 
                      ? 'text-red-400 hover:text-red-300 hover:bg-slate-800' 
                      : 'text-slate-400 hover:text-red-500 hover:bg-slate-200 lg:opacity-0 lg:group-hover:opacity-100'
                  }`}
                  title="Delete Chat"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative w-full">
        {/* Mobile Overlay for Sidebar */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/20 z-10 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Top Header Panel (Matches the white dashboard headers) */}
        <div className="w-full bg-white border-b border-slate-100 py-2.5 px-3 sm:px-6 flex items-center gap-2 sm:gap-4 flex-shrink-0 h-14">
          <button 
            onClick={handleBack}
            className="text-[#001f3f]/70 hover:text-[#d4a017] p-1.5 hover:bg-slate-200 rounded-lg transition-all flex items-center justify-center mr-0.5"
            title="Go to Dashboard"
          >
            <FiArrowLeft size={20} />
          </button>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[#001f3f]/70 hover:text-[#d4a017] p-1.5 hover:bg-slate-200 rounded-lg transition-all flex items-center justify-center"
            title="Toggle Sidebar"
          >
            <FiSidebar size={20} />
          </button>

          {/* Title and New Chat shown only if sidebar is collapsed (Screen 1 & 2) */}
          {!isSidebarOpen && (
            <div className="flex items-center gap-1.5 sm:gap-2 animate-fade-in truncate">
              <h3 className="font-black text-[#001f3f] text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 truncate">
                The DMS Assistant
              </h3>
              <button 
                onClick={handleNewChat}
                className="text-slate-500 hover:text-[#d4a017] p-1 hover:bg-slate-200 rounded-md transition-all flex items-center justify-center flex-shrink-0"
                title="New Chat"
              >
                <FiEdit3 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Chat Content Body */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8 flex flex-col bg-white">
          
          {/* Internal sub-header inside chat pane with Assistant title */}
          <div className="w-full flex justify-end items-center mb-6 flex-shrink-0 text-slate-500 font-bold border-b border-slate-100 pb-3">
            <span className="text-[#001f3f] text-xs lg:text-sm font-black flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#d4a017] rounded-full shadow-[0_0_8px_#d4a017] inline-block"></span>
              ▣ The DMS Assistant
            </span>
          </div>

          {activeMessages.length === 0 && !isLoading ? (
            /* Center Logo View (Screen 1 & 3) */
            <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
              <div className="mb-4">
                <NexiLogo className="w-24 h-24 mx-auto" />
              </div>
              <h1 className="text-xl lg:text-2xl font-black text-[#001f3f] mb-1">The DMS Assistant</h1>
              <p className="text-slate-400 text-xs lg:text-sm font-medium">Your Intelligent Helper</p>
            </div>
          ) : (
            /* Messages Stream View (Screen 2) */
            <div className="space-y-6 max-w-3xl mx-auto w-full pb-6">
              <div className="text-center my-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full">
                  Today
                </span>
              </div>

              {activeMessages.map((msg) => {
                const msgId = msg.id || msg._id;
                const isEditing = editingMessageId === msgId;
                return (
                  <div key={msgId} className="flex flex-col group">
                    {msg.sender === 'user' ? (
                      // User Message (Right Side blue bubble)
                      <div className="flex flex-col items-end w-full">
                        <div className="bg-[#001f3f] text-white rounded-2xl py-3 px-5 max-w-[75%] font-bold shadow-sm text-xs lg:text-sm leading-relaxed relative">
                          {isEditing ? (
                            <div className="flex flex-col gap-2 min-w-[220px]">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="bg-[#001831] text-white text-xs lg:text-sm p-2 rounded-xl outline-none resize-none w-full border border-[#d4a017]/30 focus:border-[#d4a017] custom-scrollbar"
                                rows={2}
                              />
                              <div className="flex justify-end gap-1.5 text-[10px]">
                                <button 
                                  onClick={() => handleSaveEdit(msgId)}
                                  className="bg-[#d4a017] text-[#001f3f] px-2.5 py-1 rounded-lg font-black hover:bg-yellow-500 transition-all cursor-pointer"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingMessageId(null)}
                                  className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg font-black hover:bg-slate-600 transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {msg.image && (
                                msg.image.startsWith('data:application/pdf') ? (
                                  <div className="flex items-center gap-2 p-3 bg-white/10 rounded-xl mb-2 border border-white/20 max-w-xs">
                                    <span className="text-xl">📄</span>
                                    <div className="text-left">
                                      <p className="text-xs font-black text-white truncate max-w-[150px]">Document.pdf</p>
                                      <a 
                                        href={msg.image} 
                                        download="Document.pdf" 
                                        className="text-[10px] text-[#d4a017] hover:underline font-black cursor-pointer"
                                      >
                                        Download PDF
                                      </a>
                                    </div>
                                  </div>
                                ) : msg.image.startsWith('data:text/plain') ? (
                                  <div className="flex items-center gap-2 p-3 bg-white/10 rounded-xl mb-2 border border-white/20 max-w-xs">
                                    <span className="text-xl">📝</span>
                                    <div className="text-left">
                                      <p className="text-xs font-black text-white truncate max-w-[150px]">Document.txt</p>
                                      <a 
                                        href={msg.image} 
                                        download="Document.txt" 
                                        className="text-[10px] text-[#d4a017] hover:underline font-black cursor-pointer"
                                      >
                                        Download File
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <img 
                                    src={msg.image} 
                                    alt="Attached Input" 
                                    className="max-w-full md:max-w-sm rounded-xl mb-2 border border-[#d4a017]/20 shadow-sm block"
                                  />
                                )
                              )}
                              <span>{msg.text}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Hover action bar for user message */}
                        {!isEditing && (
                          <div className="flex items-center gap-2 mt-1 mr-1 text-[10px] text-slate-400 font-bold tracking-wide transition-opacity duration-200 opacity-60 hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                            <button 
                              onClick={() => handleStartEdit(msgId, msg.text)}
                              className="hover:text-[#d4a017] transition-all flex items-center gap-1 cursor-pointer"
                              title="Edit message"
                            >
                              <FiEdit3 size={11} /> Edit
                            </button>
                            <span className="text-slate-300">•</span>
                            <button 
                              onClick={() => handleCopyMessage(msg.text, msgId)}
                              className="hover:text-[#d4a017] transition-all flex items-center gap-1 cursor-pointer"
                              title="Copy to clipboard"
                            >
                              <FiCopy size={11} /> {copiedMessageId === msgId ? 'Copied!' : 'Copy'}
                            </button>
                            <span className="text-slate-300">•</span>
                            <span className="text-[9px] font-normal">{msg.timestamp || 'Delivered'}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      // AI Response (Left Side grey bubble)
                      <div className="flex flex-col items-start w-full">
                        <div className="flex items-start gap-3 w-full">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                            <NexiLogo className="w-5 h-5" />
                          </div>
                          <div className="bg-[#eef2f6] text-[#001f3f] rounded-2xl py-4 px-6 max-w-[80%] font-bold shadow-sm text-xs lg:text-sm leading-relaxed">
                            {msg.image && (
                              <img 
                                src={msg.image.startsWith('data:') || msg.image.startsWith('http') ? msg.image : `${process.env.REACT_APP_API_URL}/${msg.image}`} 
                                alt="Generated Output" 
                                className="max-w-full md:max-w-sm rounded-xl mb-2 border border-slate-200 shadow-sm block"
                              />
                            )}
                            {formatResponseText(msg.text)}
                          </div>
                        </div>

                        {/* Hover action bar for AI message */}
                        <div className="flex items-center gap-2 mt-1 ml-11 text-[10px] text-slate-400 font-bold tracking-wide transition-opacity duration-200 opacity-60 hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                          <button 
                            onClick={() => handleCopyMessage(msg.text, msgId)}
                            className="hover:text-[#d4a017] transition-all flex items-center gap-1 cursor-pointer"
                            title="Copy response to clipboard"
                          >
                            <FiCopy size={11} /> {copiedMessageId === msgId ? 'Copied!' : 'Copy Message'}
                          </button>
                          <span className="text-slate-300">•</span>
                          <button 
                            onClick={() => handleDownloadPDF(msg)}
                            className="hover:text-[#d4a017] transition-all flex items-center gap-1 cursor-pointer"
                            title="Download study notes as PDF"
                          >
                            <span>📄</span> Download PDF
                          </button>
                        </div>

                        {/* AI suggestions matching buttons under AI message bubble */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-3 ml-11">
                            {msg.suggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                onClick={() => sendMessage(sug)}
                                className="bg-slate-100 hover:bg-[#d4a017]/10 text-[#001f3f] hover:text-[#d4a017] border border-slate-200 hover:border-[#d4a017] px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 block"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* NEXI typing loader bubble */}
              {isLoading && (
                <div className="flex flex-col items-start w-full animate-pulse">
                  <div className="flex items-start gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <NexiLogo className="w-5 h-5 animate-spin" />
                    </div>
                    <div className="bg-[#eef2f6] text-slate-400 rounded-2xl py-3.5 px-5 max-w-[80%] font-bold shadow-sm text-xs lg:text-sm">
                      NEXI is thinking...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar Area */}
        <div className="p-4 lg:p-6 border-t border-slate-100 bg-white flex-shrink-0">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-2.5">
            {/* Image Preview Block */}
            {attachedImage && (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#d4a017] shadow-md group/preview bg-slate-100 flex items-center justify-center">
                {attachedImage.startsWith('data:application/pdf') ? (
                  <div className="flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-3xl mb-1">📄</span>
                    <span className="text-[9px] font-black text-[#001f3f] truncate w-20">PDF File</span>
                  </div>
                ) : attachedImage.startsWith('data:text/plain') ? (
                  <div className="flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-3xl mb-1">📝</span>
                    <span className="text-[9px] font-black text-[#001f3f] truncate w-20">Text File</span>
                  </div>
                ) : (
                  <img 
                    src={attachedImage} 
                    alt="Preview Attachment" 
                    className="w-full h-full object-cover" 
                  />
                )}
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-all cursor-pointer flex items-center justify-center z-10"
                  title="Remove file"
                >
                  <FiX size={12} />
                </button>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 sm:p-3 flex items-center shadow-inner gap-2 sm:gap-3 w-full">
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*,application/pdf,text/plain" 
                className="hidden" 
              />

              {/* Paperclip button (placed on the left of input for best mobile usability and spacing) */}
              <button
                onClick={handleImageAttachClick}
                disabled={isLoading}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-[#d4a017] hover:bg-slate-200/60 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
                title="Attach Image (Vision AI)"
              >
                <FiPaperclip size={18} />
              </button>

              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={
                  isListening 
                    ? "Listening..." 
                    : (voiceError 
                        ? `Error: ${voiceError}` 
                        : (isLoading ? "Wait..." : "Type Your Message..."))
                } 
                className="flex-1 bg-transparent outline-none text-xs sm:text-sm font-bold text-slate-700 placeholder:text-slate-400 disabled:opacity-50 min-w-0" 
              />

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Language Toggle Badge */}
                <button
                  onClick={() => setVoiceLang(prev => prev === 'en-US' ? 'ur-PK' : 'en-US')}
                  className="text-[9px] sm:text-[10px] font-black bg-slate-200/80 hover:bg-slate-200 text-[#001f3f] px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg transition-all cursor-pointer select-none"
                  title={`Switch Speech Recognition Language (Current: ${voiceLang === 'en-US' ? 'English' : 'Urdu'})`}
                >
                  {voiceLang === 'en-US' ? 'EN' : 'UR'}
                </button>

                {/* Microphone Button (Speech-to-Text) */}
                <button
                  onClick={toggleListening}
                  className={`p-1.5 sm:p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse shadow-md' 
                      : 'text-slate-400 hover:text-[#d4a017] hover:bg-slate-200/60'
                  }`}
                  title={isListening ? "Stop Listening" : `Voice Input`}
                >
                  <FiMic size={18} />
                </button>

                {/* Send Button */}
                <button 
                  onClick={() => sendMessage(inputText)}
                  disabled={isLoading || (!inputText.trim() && !attachedImage)}
                  className={`p-1.5 sm:p-2 rounded-xl transition-all flex items-center justify-center ${
                    (inputText.trim() || attachedImage) 
                      ? 'bg-[#001f3f] text-[#d4a017] hover:bg-opacity-95 shadow-md cursor-pointer' 
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                  title="Send Message"
                >
                  <FiSend size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexiChat;