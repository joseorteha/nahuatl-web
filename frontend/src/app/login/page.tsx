import AuthForm from '@/app/login/auth-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg">
        <AuthForm />
      </div>
    </div>
  );
}
