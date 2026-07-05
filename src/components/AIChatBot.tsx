import React, { useState, useRef, useEffect } from 'react';
import { INITIAL_PETS, INITIAL_POSTS, FAQS } from '../data';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const PRESET_PROMPTS = [
  { text: '¿Quién es Curly?', icon: 'pets' },
  { text: '¿Cómo puedo adoptar una mascota?', icon: 'volunteer_activism' },
  { text: '¿Qué donaciones se necesitan?', icon: 'favorite' },
  { text: '¿Cómo está RunRun?', icon: 'healing' }
];

function findAnswer(input: string): string {
  const q = input.toLowerCase();

  // Pet-specific queries
  for (const pet of INITIAL_PETS) {
    const petName = pet.name.toLowerCase();
    if (q.includes(petName)) {
      const gender = pet.gender === 'male' ? 'macho' : pet.gender === 'female' ? 'hembra' : 'grupo';
      const species = pet.species === 'dog' ? 'perro' : 'gato';
      let answer = `**${pet.name}** es un ${species} ${gender} de **${pet.age}** que está en **${pet.location}**.\n\n`;
      answer += `${pet.story}\n\n`;
      answer += `**Estado:** ${pet.status}\n`;
      answer += `**Etiquetas:** ${pet.tags.join(', ')}`;
      if (pet.status === 'Buscando hogar' || q.includes('adopt') || q.includes('hogar')) {
        answer += '\n\nSi deseas adoptarlo, ve a la sección **Mascotas del Campus**, haz clic en su tarjeta y llena el formulario de adopción responsable.';
      }
      return answer;
    }
  }

  // Adoption
  if (q.includes('adopt') || q.includes('adopción') || q.includes('hogar')) {
    const adoptables = INITIAL_PETS.filter(p => p.status === 'Buscando hogar' || p.status.toLowerCase().includes('hogar'));
    let answer = '**Proceso de Adopción Responsable:**\n\n';
    answer += '1. Ve a la sección **Mascotas del Campus**\n';
    answer += '2. Haz clic en la mascota que te interese\n';
    answer += '3. Completa el formulario de solicitud con tus datos\n';
    answer += '4. El equipo de Bienestar Universitario te contactará\n\n';
    if (adoptables.length > 0) {
      answer += `**Mascotas buscando hogar actualmente:** ${adoptables.map(p => p.name).join(', ')}\n\n`;
    }
    answer += '**Requisitos:**\n';
    answer += '- Ser mayor de edad\n';
    answer += '- Contar con espacio adecuado\n';
    answer += '- Compromiso de cuidado y alimentación\n';
    answer += '- Seguimiento post-adopción por parte del voluntariado';
    return answer;
  }

  // Donations
  if (q.includes('don') || q.includes('donación') || q.includes('donar') || q.includes('aport') || q.includes('colabor')) {
    let answer = '**Formas de Donar:**\n\n';
    answer += '💳 **Donación con Tarjeta:** Ve a la sección **Donaciones**, elige una campaña y dona con tarjeta de crédito/débito simulada.\n\n';
    answer += '🏦 **Transferencia Bancaria:** Usa las cuentas institucionales:\n';
    answer += '  - Banco de la Nación Cta. Cte: **00-068-123456**\n';
    answer += '  - BCP (Recaudadora): **191-9876543-0-12**\n\n';
    answer += '📱 **Yape / Plin:** 993 376 465\n\n';
    answer += '📦 **Donaciones Físicas:** Alimento, medicinas y accesorios en:\n';
    answer += '  - Puerta Principal (Vigilancia) Lun-Sáb 8am-6pm\n';
    answer += '  - Oficina de Bienestar Universitario (2do Piso)\n\n';
    answer += '**Campañas activas:**\n';
    for (const c of INITIAL_POSTS.filter(() => true).slice(0, 3)) {
      const camp = [{t:'Alimento Mensual',a:340,m:500},{t:'Cirugía Firulais',a:210,m:800},{t:'Esterilización',a:950,m:1200}];
      // just use static campaign info
    }
    answer += '- Alimento Mensual para el Campus (S/.340 / S/.500)\n';
    answer += '- Cirugía y Terapia de RunRun (S/.210 / S/.800)\n';
    answer += '- Campaña de Esterilización Integral (S/.950 / S/.1200)';
    return answer;
  }

  // Volunteer
  if (q.includes('volunt') || q.includes('voluntariado') || q.includes('ayudar') || q.includes('participar')) {
    return '**¿Cómo ser Voluntario?**\n\n'
      + 'El voluntariado de bienestar animal de la UNDC coordina:\n\n'
      + '🐾 Paseos supervisados los fines de semana\n'
      + '🍖 Jornadas de alimentación\n'
      + '💉 Campañas de vacunación\n'
      + '🛁 Baños y cuidado básico\n\n'
      + 'Contáctanos vía WhatsApp: **987 654 321**\n\n'
      + 'También puedes ir a la **Oficina de Bienestar Universitario** en el Pabellón de Servicios Centrales, 2do Piso.';
  }

  // Veterinary / health
  if (q.includes('vete') || q.includes('veterin') || q.includes('salud') || q.includes('enfer') || q.includes('herid')) {
    let answer = '**Atención Veterinaria en la UNDC:**\n\n';
    answer += 'Si encuentras una mascota herida o en mal estado:\n\n';
    answer += '1. **Reporta** en la sección **Comunidad > Reportar Mascota**\n';
    answer += '2. Los voluntarios coordinarán la atención con la veterinaria aliada\n';
    answer += '3. Las campañas de donación cubren gastos médicos\n\n';
    const inTreatment = INITIAL_PETS.filter(p => p.statusType === 'error' || p.status === 'En tratamiento');
    if (inTreatment.length > 0) {
      answer += `**Mascotas en tratamiento:** ${inTreatment.map(p => `${p.name} (${p.status})`).join(', ')}`;
    }
    return answer;
  }

  // Location / campus
  if (q.includes('dónde') || q.includes('donde') || q.includes('ubic') || q.includes('campus') || q.includes('universidad')) {
    let answer = '**Ubicación de las Mascotas en el Campus UNDC:**\n\n';
    for (const pet of INITIAL_PETS) {
      answer += `- **${pet.name}**: ${pet.location}\n`;
    }
    answer += '\nRecuerda respetar sus espacios y horarios de descanso.';
    return answer;
  }

  // Food
  if (q.includes('comid') || q.includes('aliment') || q.includes('croqu') || q.includes('comer')) {
    return '**Alimentación Recomendada:**\n\n'
      + '🍗 **Marcas recomendadas:** Ricocan, Ricocat, Mimaskot, Cambo o similares.\n'
      + '❌ **Evita:** Alimento suelto o a granel, comida chatarra, huesos de pollo cocidos.\n\n'
      + 'Puedes donar alimento en los **Puntos de Acopio** (Puerta Principal u Oficina de Bienestar).\n\n'
      + 'Si ves a alguien dándoles comida inapropiada, repórtalo amablemente o avisa al voluntariado.';
  }

  // About the project
  if (q.includes('quién') || q.includes('quien') || q.includes('qué es') || q.includes('que es') || q.includes('proyect') || q.includes('iniciativ')) {
    return '**UNDC Pets - Bienestar Animal**\n\n'
      + 'Es una iniciativa solidaria de la **Universidad Nacional de Cañete** para:\n\n'
      + '🐶 Brindar refugio y cuidado a perros y gatos del campus\n'
      + '🏥 Costear tratamientos veterinarios y alimentación\n'
      + '📢 Concientizar sobre la tenencia responsable\n'
      + '🤝 Facilitar adopciones responsables\n\n'
      + 'Todo esto es posible gracias a estudiantes, docentes, voluntarios y donantes de la comunidad cañetana.';
  }

  // Greetings
  if (q.includes('hola') || q.includes('buen') || q.includes('salud')) {
    return '¡Hola! 🐾 Soy el **Asistente Virtual UNDC Pets**.\n\n¿En qué puedo ayudarte? Puedes preguntarme sobre:\n\n'
      + '• **Mascotas** del campus (Curly, Princesa, RunRun, Gata Ingeniera)\n'
      + '• **Adopción** responsable\n'
      + '• **Donaciones** y campañas activas\n'
      + '• **Voluntariado** universitario\n'
      + '• **Ubicación** de los animales en el campus\n\n'
      + '¡Escribe tu pregunta o elige una de las sugerencias!';
  }

  // Default fallback
  return '**¡Buena pregunta!** 🤔\n\n'
    + 'Puedo ayudarte con información sobre:\n\n'
    + '🐾 **Mascotas:** Quiénes son, dónde están, su historia\n'
    + '🏠 **Adopción:** Cómo adoptar responsablemente\n'
    + '💰 **Donaciones:** Cómo donar con tarjeta, Yape, Plin o transferencia\n'
    + '🤲 **Voluntariado:** Cómo unirte al equipo de bienestar\n'
    + '📍 **Ubicaciones:** Dónde encontrar a cada mascota\n\n'
    + '¿Podrías ser más específico? Por ejemplo: _"¿Quién es Princesa?"_, _"¿Cómo donar?"_ o _"¿Dónde está RunRun?"_';
}

export default function AIChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: '¡Hola! 🐾 Soy **UNDC Pets AI**, tu asistente del bienestar animal de la **Universidad Nacional de Cañete**. Pregúntame sobre las mascotas del campus, adopciones, donaciones o voluntariado. ¿En qué puedo ayudarte?'
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

    // Simulate a short delay for realism
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));

    const answer = findAnswer(text);
    setMessages(prev => [...prev, { role: 'model', content: answer }]);
    setIsLoading(false);
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
            <p className="text-[11px] text-slate-200 mt-1">Sistema inteligente de información sobre las mascotas del campus.</p>
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
              <span className="text-[9px] text-slate-400 font-medium mt-1 px-1">Guardián está escribiendo...</span>
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
