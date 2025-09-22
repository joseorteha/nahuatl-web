import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Nawatlahtol - Aprende Náhuatl',
  description: 'Tu plataforma para aprender náhuatl con diccionario, lecciones y práctica interactiva.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className="bg-neutral-50 dark:bg-gray-900 text-neutral-800 dark:text-gray-100 min-h-screen font-sans transition-colors duration-300">
        <ThemeProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
