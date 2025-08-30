import AuthForm from '@/app/login/auth-form';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white py-8">
      <div className="w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="Nawatlahtol Logo" 
              width={60} 
              height={60} 
              className="mb-4 rounded-md"
            />
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Accede a tu cuenta</h1>
          <p className="text-neutral-600 mt-2 text-sm text-center">
            O crea una nueva para empezar tu aventura en el náhuatl.
          </p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-neutral-200">
          <AuthForm />
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-amber-600 hover:text-amber-700 transition-colors duration-200">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
