import React, { useState } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { chatWithAssistant } from '../lib/openai';
import { Patient } from '../types';

interface ChatBoxProps {
  patients: Patient[];
}

export default function ChatBox({ patients }: ChatBoxProps) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am Meddy AI. How can I assist with patient triage today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAssistant(userMessage, patients);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase()?.includes('expired') 
        ? "The API key is expired. Please provide a new key in .env.local."
        : "I'm sorry, I encountered an error. Please check your API connection.";
      setMessages(prev => [...prev, { role: 'bot', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-64 mt-4">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
        <Bot className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Staff Assistant</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 custom-scrollbar pr-1">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn(
            "flex gap-2 max-w-[85%]",
            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-slate-200" : "bg-blue-100"
            )}>
              {msg.role === 'user' ? <User className="w-3 h-3 text-slate-500" /> : <Bot className="w-3 h-3 text-blue-600" />}
            </div>
            <div className={cn(
              "p-2 rounded-lg text-[11px] leading-relaxed",
              msg.role === 'user' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 text-blue-600" />
            </div>
            <div className="bg-slate-100 p-2 rounded-lg">
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          disabled={loading}
          placeholder="Ask Meddy AI..."
          className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-4 pr-10 text-[11px] outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button 
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}
