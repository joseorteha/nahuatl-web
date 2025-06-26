import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
} 