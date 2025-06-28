import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          NahuatlApp
        </Link>
        <div className="space-x-4">
          <Link href="/lecciones" className="hover:text-gray-300">
            Lecciones
          </Link>
          <Link href="/practica" className="hover:text-gray-300">
            Práctica
          </Link>
          <Link href="/diccionario" className="hover:text-gray-300">
            Diccionario
          </Link>
        </div>
      </div>
    </nav>
  );
}
