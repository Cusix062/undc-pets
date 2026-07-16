import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

const ADMIN_EMAILS = ['2301010130@undc.edu.pe'];

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<{ error?: string }>;
  deleteAccount: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, isAdmin: false, loading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
  updateAvatar: async () => ({}),
  deleteAccount: async () => ({}),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (u: User | null) => {
    if (!u?.email) {
      setIsAdmin(false);
      return;
    }
    if (ADMIN_EMAILS.includes(u.email)) {
      setIsAdmin(true);
      return;
    }
    try {
      const { data } = await supabase.from('admins').select('email').eq('email', u.email).maybeSingle();
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      checkAdmin(u).then(() => setLoading(false));
    });

    const { unsubscribe } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      checkAdmin(u);
    });

    return unsubscribe;
  }, [checkAdmin]);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          given_name: name.split(' ')[0],
          family_name: name.split(' ').slice(1).join(' '),
        },
      },
    });
    return { error: error?.message };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateAvatar = async (avatarUrl: string) => {
    const { error } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
    return { error: error?.message };
  };

  const deleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      // fallback: try admin API won't work client-side, so inform user
      return { error: 'No se pudo eliminar la cuenta. Contacta al administrador.' };
    }
    await supabase.auth.signOut();
    return {};
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signUp, signIn, signOut, updateAvatar, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
