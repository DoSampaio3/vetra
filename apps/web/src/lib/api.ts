// Usa proxy relativo do Next.js para evitar CORS
const API_URL = typeof window !== 'undefined'
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vetra_token');
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, full_name: string) =>
      apiRequest<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST', body: JSON.stringify({ email, password, full_name }),
      }),
    me: () => apiRequest<{ user: User; subscription: any }>('/api/auth/me'),

    forgotPassword: (email: string) =>
      apiRequest<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST', body: JSON.stringify({ email }),
      }),

    resetPassword: (token: string, password: string) =>
      apiRequest<{ message: string; token: string; user: User }>('/api/auth/reset-password', {
        method: 'POST', body: JSON.stringify({ token, password }),
      }),

    validateResetToken: (token: string) =>
      apiRequest<{ valid: boolean }>(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`),
  },

  verify: {
    submit: (data: VerifyInput) =>
      apiRequest<VerifyResult>('/api/verify', { method: 'POST', body: JSON.stringify(data) }),
    analyze: (data: VerifyInput) =>
      apiRequest<any>('/api/verify/signals/analyze', { method: 'POST', body: JSON.stringify(data) }),
  },

  score: {
    byUser: (userId: string) => apiRequest<any>(`/api/score/user/${userId}`),
  },

  reports: {
    list: () => apiRequest<{ reports: Report[] }>('/api/reports'),
    get: (id: string) => apiRequest<{ report: Report; signals: Signal[] }>(`/api/reports/${id}`),
  },

  history: {
    list: (page = 1, limit = 10) =>
      apiRequest<any>(`/api/history?page=${page}&limit=${limit}`),
    delete: (id: string) =>
      apiRequest<any>(`/api/history/${id}`, { method: 'DELETE' }),
  },

  billing: {
    createCheckout: (plan_key: string, billing_type?: string, cpf?: string, card?: any) =>
      apiRequest<{ checkout_url: string; payment_id: string; pix_qr_code: string; pix_key: string }>('/api/billing/create-checkout', {
        method: 'POST', body: JSON.stringify({ plan_key, billing_type, cpf, card }),
      }),
    getSubscription: () => apiRequest<any>('/api/billing/subscription'),
    cancel: () => apiRequest<any>('/api/billing/cancel', { method: 'POST' }),
  },
};

export interface User {
  id: string; email: string; full_name: string;
  plan: string; credits: number; created_at?: string;
}
export interface VerifyInput {
  email?: string; phone?: string; username?: string; cpf?: string; birth_date?: string;
}
export interface VerifyResult {
  report_id: string; score: number; level: string; summary: string; signals: Signal[];
}
export interface Signal {
  id: string; source: string; label: string; value: string;
  status: 'verified' | 'warning' | 'not_found'; weight: number;
}
export interface Report {
  id: string; target_email: string; score: number; total_score: number; title: string; level: string; summary?: string; created_at: string;
}
