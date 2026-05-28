import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vetra — Score de Confiança Digital por IA',
  description: 'Verifique perfis, consulte registros públicos e receba um relatório de confiança completo em segundos. Powered by Gemini AI.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: '#020817', color: '#e2e8f0' }}>
        {children}
      </body>
    </html>
  );
}
