
import React, { useState, useEffect, useRef } from 'react';
import { Message, BotResponse, Reminder, ReminderFlowState } from './types';
import { getBotResponse } from './services/botLogic';

const App: React.FC = () => {
  // --- States ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: "Hi! I’m your Health-Care Assistant 🤍 How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Medicine Reminder State
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('hc_reminders');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Conversation state for multi-step reminder setting
  const [reminderFlow, setReminderFlow] = useState<ReminderFlowState>('IDLE');
  const [tempReminderName, setTempReminderName] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Save reminders to local storage
  useEffect(() => {
    localStorage.setItem('hc_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Background check for reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      reminders.forEach(reminder => {
        if (reminder.time === currentTime && !reminder.taken) {
          // Check if we already sent an alert for this specific time today to avoid spamming
          // For simplicity in this demo, we just push a bot message
          addBotMessage(`⏰ Reminder: It's time to take your medicine: **${reminder.medicineName}**.`);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminders]);

  // --- Helpers ---

  const addBotMessage = (text: string, suggestions?: string[]) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      role: 'bot',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const handleSendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      processLogic(trimmed);
      setIsTyping(false);
    }, 600);
  };

  const processLogic = (input: string) => {
    // 1. Handle Multi-step Reminder Flow
    if (reminderFlow === 'AWAITING_NAME') {
      if (input.toLowerCase() === 'cancel') {
        setReminderFlow('IDLE');
        addBotMessage("Reminder setup cancelled. How else can I help?");
        return;
      }
      setTempReminderName(input);
      setReminderFlow('AWAITING_TIME');
      addBotMessage(`Got it: ${input}. What time should I remind you? (Please use HH:mm format, e.g., 08:30 or 20:15)`, ['Cancel']);
      return;
    }

    if (reminderFlow === 'AWAITING_TIME') {
      if (input.toLowerCase() === 'cancel') {
        setReminderFlow('IDLE');
        setTempReminderName('');
        addBotMessage("Reminder setup cancelled.");
        return;
      }
      
      // Basic time validation
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (timeRegex.test(input)) {
        const newReminder: Reminder = {
          id: Date.now().toString(),
          medicineName: tempReminderName,
          time: input,
          taken: false
        };
        setReminders(prev => [...prev, newReminder]);
        setReminderFlow('IDLE');
        setTempReminderName('');
        addBotMessage(`Perfect! I've set a reminder for **${newReminder.medicineName}** at **${newReminder.time}**. I'll notify you here!`, ['Show Reminders', 'Symptoms']);
      } else {
        addBotMessage("That doesn't look like a valid time. Please use the format HH:mm (e.g., 14:30).", ['Cancel']);
      }
      return;
    }

    // 2. Handle specific keywords for the flow start
    if (input.toLowerCase().includes('reminder')) {
      setReminderFlow('AWAITING_NAME');
      addBotMessage("I can help you set a medicine reminder! What is the name of the medicine?", ['Cancel']);
      return;
    }

    if (input.toLowerCase() === 'show reminders') {
      if (reminders.length === 0) {
        addBotMessage("You have no active reminders. Would you like to set one?", ['Medicine Reminder']);
      } else {
        addBotMessage("Here are your current medicine reminders. You can see them in the panel above the chat input.");
      }
      return;
    }

    // 3. Standard Rule-Based Logic
    const response = getBotResponse(input);
    addBotMessage(response.text, response.suggestions);
  };

  const toggleReminderTaken = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, taken: !r.taken } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-2xl relative overflow-hidden border-x border-gray-200">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <i className="fas fa-user-md text-blue-600 text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-base leading-none">HealthCare Assistant</h1>
            <p className="text-[10px] text-blue-100 mt-1 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
              Available 24/7
            </p>
          </div>
        </div>
        <button 
          onClick={() => setReminders([])}
          className="text-[10px] bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded transition-colors"
          title="Clear all reminders"
        >
          Reset App
        </button>
      </header>

      {/* Active Reminders Mini-Panel (Sticky) */}
      {reminders.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 p-3 max-h-32 overflow-y-auto scrollbar-hide z-10">
          <h3 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center">
            <i className="fas fa-clock mr-1"></i> Active Reminders
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {reminders.map(r => (
              <div key={r.id} className="bg-white p-2 rounded-lg border border-blue-100 flex items-center justify-between shadow-sm animate-fade-in">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={r.taken} 
                    onChange={() => toggleReminderTaken(r.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <div className={r.taken ? 'line-through text-gray-400' : 'text-gray-700'}>
                    <span className="text-xs font-semibold">{r.medicineName}</span>
                    <span className="text-[10px] ml-2 text-gray-500 bg-gray-100 px-1 rounded">{r.time}</span>
                  </div>
                </div>
                <button onClick={() => deleteReminder(r.id)} className="text-red-400 hover:text-red-600 text-xs">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat History */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth scrollbar-hide"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
              </div>
              <div className={`text-[9px] mt-1.5 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl border border-gray-100 rounded-tl-none flex space-x-1 items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        )}
      </main>

      {/* Menu Options (Quick Actions) */}
      <div className="bg-white px-4 py-2 border-t border-gray-100">
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          {['Symptoms', 'Diseases', 'Medicines', 'Doctor Appointment', 'Emergency Help', 'Medicine Reminder'].map((option) => (
            <button
              key={option}
              onClick={() => handleSendMessage(option)}
              className="whitespace-nowrap bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors shadow-sm"
            >
              {option === 'Medicine Reminder' ? <><i className="fas fa-bell mr-1"></i> {option}</> : option}
            </button>
          ))}
        </div>
      </div>

      {/* Footer / Input Area */}
      <footer className="p-4 bg-white border-t border-gray-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={reminderFlow !== 'IDLE' ? "Waiting for your input..." : "Ask me anything..."}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <i className="fas fa-paper-plane text-sm"></i>
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-[11px] text-gray-400 font-medium tracking-wide">
            ⭐ Please do not forget to drop a star if you like it!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
