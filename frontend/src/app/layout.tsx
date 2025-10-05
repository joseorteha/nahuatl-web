import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Footer from '@/components/navigation/Footer';
import { ThemeProvider } from '@/components/shared/theme-provider';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import ServerStatusProvider from '@/components/providers/ServerStatusProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Nawatlahtol - Diccionario Náhuatl Digital',
  description: 'Plataforma moderna para aprender y preservar el idioma Náhuatl con herramientas interactivas.',
  icons: {
    icon: [
      { url: '/favico.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/logooo.png', sizes: '192x192', type: 'image/png' }
    ],
    shortcut: '/favico.ico',
    apple: '/logooo.png',
  },
  manifest: '/manifest.json',
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
        <link rel="icon" href="/favico.ico" sizes="any" />
        <link rel="icon" href="/logooo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logooo.png" />
      </head>
      <body className="bg-neutral-50 dark:bg-gray-900 text-neutral-800 dark:text-gray-100 min-h-screen font-sans transition-colors duration-300">
        <ErrorBoundary>
          <ThemeProvider>
            <ServerStatusProvider>
              <div className="flex-1 flex flex-col">
                {children}
              </div>
              <Footer />
            </ServerStatusProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
