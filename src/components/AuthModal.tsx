import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onNotification: (msg: string) => void;
}

export default function AuthModal({ open, onClose, onNotification }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirm('');
    setError('');
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); setLoading(false); return; }
        if (password !== confirm) { setError('Las contraseñas no coinciden'); setLoading(false); return; }
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, given_name: name.split(' ')[0], family_name: name.split(' ').slice(1).join(' ') },
          },
        });
        if (signUpError) throw signUpError;
        onNotification('¡Cuenta creada! Revisa tu correo para confirmar.');
        onClose();
        reset();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onNotification('¡Bienvenido de vuelta!');
        onClose();
        reset();
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md overflow-y-auto max-h-[90vh] shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00346f] to-[#0050aa] p-6 text-white text-center space-y-1">
          <span className="material-symbols-outlined text-[36px] text-white/80">pets</span>
          <h2 className="font-display font-extrabold text-xl">UNDC Pets</h2>
          <p className="text-xs text-slate-200">{mode === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta en la comunidad'}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-medium flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Nombre completo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Juan Pérez" required className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00346f] focus:ring-1 focus:ring-[#00346f]/20 bg-slate-50" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ejemplo@undc.edu.pe" required className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00346f] focus:ring-1 focus:ring-[#00346f]/20 bg-slate-50" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00346f] focus:ring-1 focus:ring-[#00346f]/20 bg-slate-50" />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Confirmar contraseña</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" required minLength={6} className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00346f] focus:ring-1 focus:ring-[#00346f]/20 bg-slate-50" />
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#00346f] to-[#0050aa] hover:from-[#002450] hover:to-[#00346f] disabled:from-slate-300 disabled:to-slate-300 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
            {loading ? (
              <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">{mode === 'login' ? 'login' : 'person_add'}</span>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</>
            )}
          </button>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            {mode === 'login' ? (
              <span>¿No tienes cuenta? <button type="button" onClick={() => switchMode('register')} className="text-[#00346f] font-bold hover:underline">Regístrate aquí</button></span>
            ) : (
              <span>¿Ya tienes cuenta? <button type="button" onClick={() => switchMode('login')} className="text-[#00346f] font-bold hover:underline">Inicia sesión</button></span>
            )}
          </div>

          <button type="button" onClick={onClose} className="w-full text-xs text-slate-400 hover:text-slate-600 py-1">Cancelar</button>
        </form>
      </div>
    </div>
  );
}
