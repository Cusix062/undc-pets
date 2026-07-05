import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PETS, INITIAL_POSTS, FAQS } from '../data';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const PRESET_PROMPTS = [
  { text: '¿Quién es Curly?', icon: 'pets' },
  { text: '¿Cómo adoptar una mascota?', icon: 'volunteer_activism' },
  { text: '¿Qué donaciones se necesitan?', icon: 'favorite' },
  { text: '¿Cómo está RunRun?', icon: 'healing' }
];

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const API_AVAILABLE = API_KEY.length > 0;

const SYSTEM_CONTEXT = `Eres el asistente virtual oficial de "UNDC Pets - Bienestar Animal" de la Universidad Nacional de Cañete (UNDC).

Información actual sobre las mascotas del campus:
${INITIAL_PETS.map(p =>
  `- ${p.name}: ${p.species === 'dog' ? 'Perro' : 'Gato'}, ${p.gender === 'male' ? 'Macho' : 'Hembra'}, ${p.age}. Ubicación: ${p.location}. Estado: ${p.status}. Historia: ${p.story}. Etiquetas: ${p.tags.join(', ')}.`
).join('\n')}

Publicaciones recientes de la comunidad:
${INITIAL_POSTS.slice(0, 3).map(p => `- ${p.authorName}: "${p.content}"`).join('\n')}

Preguntas frecuentes:
${FAQS.map(f => `- ${f.question}: ${f.answer}`).join('\n')}

Información de donaciones:
- Se puede donar con tarjeta en la sección Donaciones
- Transferencia bancaria: Banco de la Nación Cta. Cte: 00-068-123456, BCP: 191-9876543-0-12
- Yape / Plin: 993 376 465
- Donaciones físicas en Puerta Principal (Lun-Sáb 8am-6pm) u Oficina de Bienestar Universitario

Responde en español, sé amigable y entusiasta, usa emojis ocasionalmente. Mantén las respuestas concisas pero informativas. Si no sabes algo, sugiere al usuario consultar en la página web.`;

export default function AIChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: API_AVAILABLE
        ? '¡Hola! 🐾 Soy **UNDC Pets AI**, tu asistente del bienestar animal de la **Universidad Nacional de Cañete**. Pregúntame sobre las mascotas del campus, adopciones, donaciones o voluntariado. ¿En qué puedo ayudarte?'
        : '¡Hola! 🐾 Soy **UNDC Pets AI**.\n\n⚠️ **Importante:** Para que funcione con inteligencia real de Gemini, necesito una clave API. Sigue estos pasos:\n\n1. Ve a **https://aistudio.google.com/app/apikey**\n2. Haz clic en **"Create API Key"**\n3. Copia la clave\n4. Crea un archivo **.env** en la raíz del proyecto con: `VITE_GEMINI_API_KEY=tu_clave_aqui`\n5. Ejecuta `npm run dev:client` de nuevo\n\nMientras tanto, puedo responder preguntas básicas sobre las mascotas del campus? 🐶🐱'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    if (!API_AVAILABLE) {
      // No API key configured - use local response
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
      setMessages(prev => [...prev, {
        role: 'model',
        content: '⚠️ No hay una clave API configurada.\n\nPara activar Gemini, ve a **https://aistudio.google.com/app/apikey**, genera una clave gratis y créa un archivo **.env** con:\n\n`VITE_GEMINI_API_KEY=tu_clave`\n\nLuego reinicia el servidor de desarrollo.'
      }]);
      return;
    }

    try {
      const genAI = new GoogleGenAI({ apiKey: API_KEY });

      const chatHistory = updatedMessages.slice(0, -1).map(m => ({
        role: m.role === 'model' ? 'model' : 'user' as const,
        parts: [{ text: m.content }]
      }));

      const chat = genAI.chats.create({
        model: 'gemini-2.0-flash',
        history: chatHistory,
        config: {
          systemInstruction: SYSTEM_CONTEXT,
          maxOutputTokens: 800,
          temperature: 0.7
        }
      });

      const result = await chat.sendMessage({ text: userMsg.content });
      const responseText = result.text || 'Lo siento, no pude generar una respuesta.';

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      console.error('Gemini API error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'Ups, ocurrió un error al conectar con Gemini. 😅\n\nPosibles causas:\n- La clave API no es válida\n- Límite de peticiones alcanzado\n- Problema de conexión\n\nVerifica tu clave en **https://aistudio.google.com/app/apikey** e inténtalo de nuevo.'
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

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      const isBullet = content.trim().startsWith('- ') || content.trim().startsWith('* ');
      if (isBullet) content = content.trim().substring(2);
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
      <div className="space-y-6 md:col-span-1">
        <div className="bg-gradient-to-br from-[#00346f] to-[#002450] text-white rounded-3xl p-6 space-y-4 shadow-md">
          <div className="bg-white/10 h-12 w-12 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] text-[#fc9d41] font-bold">smart_toy</span>
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg leading-tight">Asistente Virtual UNDC Pets</h3>
            <p className="text-[11px] text-slate-200 mt-1">Potenciado con **Gemini AI** de Google.</p>
          </div>
          <div className="border-t border-white/10 pt-4 space-y-3">
            <p className="text-xs font-bold text-[#fc9d41]">¿Qué me puedes preguntar?</p>
            <ul className="space-y-2 text-[11px] text-slate-100 font-medium list-inside">
              <li className="flex gap-1.5 items-start">
                <span className="material-symbols-outlined text-[14px] text-[#fc9d41] mt-0.5">help</span>
                <span>Información de cada mascota del campus.</span>
              </li>
              <li className="flex gap-1.5 items-start">
                <span className="material-symbols-outlined text-[14px] text-[#fc9d41] mt-0.5">help</span>
                <span>Proceso de adopción y voluntariado.</span>
              </li>
              <li className="flex gap-1.5 items-start">
                <span className="material-symbols-outlined text-[14px] text-[#fc9d41] mt-0.5">help</span>
                <span>Donaciones, campañas y puntos de acopio.</span>
              </li>
            </ul>
          </div>
          {!API_AVAILABLE && (
            <div className="bg-amber-400/20 border border-amber-400/30 rounded-xl p-3 text-xs text-amber-200">
              ⚠️ Modo local. Configura VITE_GEMINI_API_KEY en .env para activar Gemini.
            </div>
          )}
        </div>
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
      <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-md flex flex-col h-[550px] overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-[#00346f] text-white h-10 w-10 rounded-full flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[22px] font-bold">pets</span>
              </div>
              <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${API_AVAILABLE ? 'bg-emerald-500' : 'bg-amber-500'}`} title={API_AVAILABLE ? 'Conectado a Gemini' : 'Modo local'}></span>
            </div>
            <div>
              <h3 className="font-display font-bold text-xs text-slate-800">UNDC Pets Guardián AI</h3>
              <p className={`text-[10px] font-bold flex items-center gap-0.5 ${API_AVAILABLE ? 'text-emerald-600' : 'text-amber-600'}`}>
                <span className="material-symbols-outlined text-[10px] font-bold">circle</span>
                {API_AVAILABLE ? 'Gemini AI Conectado' : 'Sin API Key'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([{
              role: 'model',
              content: API_AVAILABLE
                ? '¡Conversación reiniciada! 🐾 Pregúntame lo que gustes sobre las mascotas de la UNDC.'
                : '¡Conversación reiniciada! 🐾 Recuerda configurar VITE_GEMINI_API_KEY en .env para usar Gemini.'
            }])}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Reiniciar chat"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
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
          {isLoading && (
            <div className="align-start self-start text-left max-w-[85%]">
              <div className="bg-white text-slate-800 border border-slate-100 rounded-2xl p-3.5 shadow-3xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium mt-1 px-1">Gemini está pensando...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleFormSubmit} className="bg-white border-t border-slate-100 p-4 flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading}
            placeholder="Pregúntame sobre Curly, adopciones, donaciones..."
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
