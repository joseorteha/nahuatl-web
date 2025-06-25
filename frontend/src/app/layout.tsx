import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NahuatlApp - Aprende Náhuatl',
  description: 'Tu plataforma para aprender náhuatl con diccionario, lecciones y práctica interactiva.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-900`}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
