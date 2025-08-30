import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Nawatlajtol - Aprende Náhuatl',
  description: 'Tu plataforma para aprender náhuatl con diccionario, lecciones y práctica interactiva.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="bg-neutral-50 text-neutral-800 min-h-screen font-sans">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
