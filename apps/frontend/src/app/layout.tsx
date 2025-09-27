import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DIBEA - Sistema de Gestão de Bem-Estar Animal',
  description: 'Plataforma completa para gestão municipal de bem-estar animal',
  keywords: ['bem-estar animal', 'gestão municipal', 'adoção', 'pets'],
  authors: [{ name: 'Equipe Dibea' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'DIBEA - Sistema de Gestão de Bem-Estar Animal',
    description: 'Plataforma completa para gestão municipal de bem-estar animal',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
