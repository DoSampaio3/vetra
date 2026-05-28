'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, User } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('vetra_token');
    if (!token) { setLoading(false); return; }
    try {
      const { user } = await api.auth.me();
      setUser(user);
    } catch {
      localStorage.removeItem('vetra_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await api.auth.login(email, password);
    localStorage.setItem('vetra_token', token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (email: string, password: string, full_name: string) => {
    const { user, token } = await api.auth.register(email, password, full_name);
    localStorage.setItem('vetra_token', token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vetra_token');
    sessionStorage.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api.auth.me();
      setUser(user);
      return user;
    } catch {}
  }, []);

  // Decrement credits locally for instant UI feedback (optimistic)
  const decrementCredits = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      if (prev.credits === 999) return prev; // unlimited
      return { ...prev, credits: Math.max(0, prev.credits - 1) };
    });
  }, []);

  return { user, loading, login, register, logout, refreshUser, decrementCredits };
}
