const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vetra_token');
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (email: string, password: string, full_name: string) =>
      apiRequest<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name }),
      }),

    me: () => apiRequest<{ user: User }>('/api/auth/me'),
  },

  verify: {
    submit: (data: VerifyInput) =>
      apiRequest<VerifyResult>('/api/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    analyze: (data: VerifyInput) =>
      apiRequest<any>('/api/verify/signals/analyze', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  score: {
    byUser: (userId: string) =>
      apiRequest<any>(`/api/score/user/${userId}`),
  },

  reports: {
    list: () => apiRequest<{ reports: Report[] }>('/api/reports'),
    get: (id: string) => apiRequest<{ report: Report; signals: Signal[] }>(`/api/reports/${id}`),
  },
};

export interface User {
  id: string;
  email: string;
  full_name: string;
  plan: string;
  created_at?: string;
}

export interface VerifyInput {
  email?: string;
  phone?: string;
  username?: string;
  cpf?: string;
  birth_date?: string;
}

export interface VerifyResult {
  verification_id: string;
  report_id: string;
  trust_score: {
    total: number;
    level: string;
    identity: number;
    social: number;
    behavioral: number;
    consistency: number;
  };
  explanation: {
    summary: string;
    factors: any[];
    breakdown: any;
  };
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  summary: string;
  total_score: number;
  level: string;
  is_premium: boolean;
  created_at: string;
  subject_email?: string;
  subject_phone?: string;
  subject_username?: string;
  explanation?: any;
  identity_score?: number;
  social_score?: number;
  behavioral_score?: number;
  consistency_score?: number;
}

export interface Signal {
  signal_type: string;
  signal_name: string;
  value: any;
  weight: number;
  score_contribution: number;
  source: string;
  verified_at: string;
}
