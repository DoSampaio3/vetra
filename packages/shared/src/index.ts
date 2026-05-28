// Shared types between web and api

export type TrustLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type UserPlan = 'free' | 'premium' | 'enterprise';
export type VerificationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface TrustScoreBreakdown {
  identity: { score: number; weight: number; signals: string[] };
  social: { score: number; weight: number; signals: string[] };
  behavioral: { score: number; weight: number; signals: string[] };
  consistency: { score: number; weight: number; signals: string[] };
}

export interface TrustExplanation {
  summary: string;
  factors: Array<{
    name: string;
    contribution: number;
    description: string;
    positive: boolean;
  }>;
  breakdown: TrustScoreBreakdown;
}

export const LEVEL_LABELS: Record<TrustLevel, string> = {
  very_high: 'Excelente',
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
  very_low: 'Muito Baixo',
};

export const LEVEL_THRESHOLDS: Record<TrustLevel, [number, number]> = {
  very_low: [0, 19],
  low: [20, 39],
  medium: [40, 59],
  high: [60, 79],
  very_high: [80, 100],
};
