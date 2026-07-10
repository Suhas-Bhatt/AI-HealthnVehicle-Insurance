import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Send, Sparkles, Paperclip } from 'lucide-react';
import { API_ENDPOINTS } from './api';

/**
 * Assistant Page: Full-page AI Chatbot interface.
 */
const Assistant = ({ insuranceType }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: `Hello! I am your AI Assistant. How can I help you analyze ${insuranceType ? insuranceType : ''} data today?`, sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { id: Date.now(), text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');

    // Loading state
    setMessages((prev) => [...prev, { id: 'loading', text: "...", sender: 'ai' }]);

    try {
      const response = await fetch(API_ENDPOINTS.CHATBOT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          session_id: sessionId
        })
      });
      
      const data = await response.json();
      
      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
      }
      
      // Remove loading and add real response
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== 'loading');
        return [...filtered, { id: Date.now() + 1, text: data.reply || "Error: No response from AI", sender: 'ai' }];
      });

    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== 'loading');
        return [...filtered, { id: Date.now() + 1, text: "Sorry, I couldn't connect to the AI server.", sender: 'ai' }];
      });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
          <p className="text-sm text-zinc-400">Contextual Chat & Analysis</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-zinc-800' : 'bg-gradient-to-br from-primary to-secondary'}`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4 text-zinc-300" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-zinc-800/80 text-zinc-200 rounded-tr-sm border border-zinc-700' 
                    : 'bg-primary/10 text-primary-light rounded-tl-sm border border-primary/20 shadow-lg shadow-primary/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 relative z-10">
          <form onSubmit={handleSend} className="relative flex items-center">
            <button type="button" className="absolute left-4 text-zinc-500 hover:text-zinc-300 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about claims, fraud patterns, or policy details..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-14 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors shadow-inner"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="absolute right-3 p-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-center space-x-1 mt-3">
            <Sparkles className="w-3 h-3 text-primary-light" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">AI responses may not be 100% accurate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
