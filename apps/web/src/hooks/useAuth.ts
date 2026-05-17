'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, User } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vetra_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.auth.me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('vetra_token'))
      .finally(() => setLoading(false));
  }, []);

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
    setUser(null);
  }, []);

  return { user, loading, login, register, logout };
}
