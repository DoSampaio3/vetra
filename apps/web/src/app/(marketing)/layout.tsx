import type { Metadata } from 'next';
import MarketingNav from '@/components/marketing/layout/MarketingNav';
import MarketingFooter from '@/components/marketing/layout/MarketingFooter';
import '../globals.css';

export const metadata: Metadata = {
  title: 'VETRA — Confiança Digital Verificada por IA',
  description: 'Analise qualquer perfil digital e receba um relatório de confiança completo em segundos. Powered by Gemini AI.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </>
  );
}
