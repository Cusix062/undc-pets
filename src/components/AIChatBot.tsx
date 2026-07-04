/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const PRESET_PROMPTS = [
  { text: '¿Quién es Bobby?', icon: 'pets' },
  { text: '¿Cómo puedo adoptar a Luna?', icon: 'volunteer_activism' },
  { text: '¿Qué donaciones se necesitan?', icon: 'favorite' },
  { text: '¿Cómo está Firulais de la cadera?', icon: 'healing' }
];

export default function AIChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: '¡Hola! 🐾 Soy **UNDC Pets AI**, tu asistente inteligente y guardián virtual del bienestar animal de la **Universidad Nacional de Cañete**. Puedes preguntarme sobre las mascotas del campus, cómo adoptar responsablemente, cómo colaborar con alimentos/medicinas o unirte al voluntariado. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error('No se pudo conectar con el servidor.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (error) {
      console.error('Error during AI Chat:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'Ups, disculpa. Tuve un pequeño problema para conectarme al servidor de IA. Por favor intenta de nuevo.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(userInput);
  };

  // Safe simple markdown-like formatter to render bold, bullet points, and headers
  const renderFormattedText = (text: string) => {
    // Escape or split lines to render list items nicely
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      
      // Match bullet point
      const isBullet = content.trim().startsWith('- ') || content.trim().startsWith('* ');
      if (isBullet) {
        content = content.trim().substring(2);
      }

      // Formatting strong elements **bold**
      const boldParts = content.split('**');
      const renderedLine = boldParts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="font-extrabold text-[#00346f]">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 text-slate-700 leading-relaxed text-xs my-0.5">
            {renderedLine}
          </li>
        );
      }

      return (
        <p key={idx} className="text-slate-700 leading-relaxed text-xs my-1">
          {renderedLine}
        </p>
      );
    });
  };

  return (
    <div id="ai-chatbot-container" className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Quick guide and recommendations */}
      <div className="space-y-6 md:col-span-1">
        <div className="bg-gradient-to-br from-[#00346f] to-[#002450] text-white rounded-3xl p-6 space-y-4 shadow-md">
          <div className="bg-white/10 h-12 w-12 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] text-[#fc9d41] font-bold">smart_toy</span>
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg leading-tight">Asistente Virtual UNDC Pets</h3>
            <p className="text-[11px] text-slate-200 mt-1">Desarrollado con inteligencia artificial de Google para guiar y concientizar a la comunidad universitaria.</p>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <p className="text-xs font-bold text-[#fc9d41]">¿Qué me puedes preguntar?</p>
            <ul className="space-y-2 text-[11px] text-slate-100 font-medium list-inside">
              <li className="flex gap-1.5 items-start">
                <span className="material-symbols-outlined text-[14px] text-[#fc9d41] mt-0.5">help</span>
                <span>Ubicación y estado de las mascotas en tiempo real.</span>
              </li>
              <li className="flex gap-1.5 items-start">
                <span className="material-symbols-outlined text-[14px] text-[#fc9d41] mt-0.5">help</span>
                <span>Proceso para adoptar, apadrinar o ser voluntario.</span>
              </li>
              <li className="flex gap-1.5 items-start">
                <span className="material-symbols-outlined text-[14px] text-[#fc9d41] mt-0.5">help</span>
                <span>Normas para alimentar de forma segura a los animales.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-3">
          <h4 className="font-display font-bold text-xs text-slate-800">Preguntas Frecuentes</h4>
          <div className="flex flex-col gap-2">
            {PRESET_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(prompt.text)}
                className="flex items-center gap-2 text-left bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 hover:text-slate-900 border border-slate-100 p-2.5 rounded-xl transition-all text-xs font-semibold group"
              >
                <span className="material-symbols-outlined text-primary text-[16px] group-hover:scale-110 transition-transform">
                  {prompt.icon}
                </span>
                <span className="truncate">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-md flex flex-col h-[550px] overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-[#00346f] text-white h-10 w-10 rounded-full flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[22px] font-bold">pets</span>
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" title="Conectado"></span>
            </div>
            <div>
              <h3 className="font-display font-bold text-xs text-slate-800">UNDC Pets Guardián AI</h3>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px] font-bold">circle</span> En Línea
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setMessages([{
              role: 'model',
              content: '¡Conversación reiniciada! 🐾 Pregúntame lo que gustes sobre el bienestar de nuestras mascotas de la UNDC.'
            }])}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Reiniciar chat"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-grow p-6 overflow-y-auto bg-slate-50/20 space-y-4 flex flex-col">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`max-w-[85%] flex flex-col ${
                  isUser ? 'align-end self-end text-right' : 'align-start self-start text-left'
                }`}
              >
                <div
                  className={`rounded-2xl p-3.5 shadow-3xs border text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#00346f] text-white border-[#002450]'
                      : 'bg-white text-slate-800 border-slate-100'
                  }`}
                >
                  {isUser ? msg.content : <div className="space-y-1">{renderFormattedText(msg.content)}</div>}
                </div>
                <span className="text-[9px] text-slate-400 font-medium mt-1 px-1">
                  {isUser ? 'Tú' : 'UNDC Pets AI'}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="align-start self-start text-left max-w-[85%]">
              <div className="bg-white text-slate-800 border border-slate-100 rounded-2xl p-3.5 shadow-3xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium mt-1 px-1">Guanrdián está escribiendo...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Footer */}
        <form onSubmit={handleFormSubmit} className="bg-white border-t border-slate-100 p-4 flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading}
            placeholder="Pregúntame sobre Bobby, Luna, voluntariados, donaciones..."
            className="flex-grow text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00346f] focus:ring-1 focus:ring-[#00346f] bg-slate-50"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-[#00346f] hover:bg-[#002450] disabled:bg-slate-300 text-white p-3 rounded-xl shadow-xs transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>

      </div>

    </div>
  );
}
