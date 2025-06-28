import AuthForm from '@/app/login/auth-form';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#5DADE2]/20 via-white to-[#2ECC71]/10 py-8">
      <Image src="/logo.png" alt="Logo Code Master tik" width={90} height={90} className="mb-8 rounded-lg shadow-lg" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accede a tu cuenta</h1>
          <p className="text-gray-600 mt-2">O crea una nueva para empezar tu aventura en el náhuatl.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <AuthForm />
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
