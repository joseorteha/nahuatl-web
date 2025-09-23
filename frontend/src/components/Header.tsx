'use client';
import { useState, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react';
import { 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Menu as MenuIcon, 
  X, 
  BookOpen, 
  Users, 
  MessageCircle, 
  Plus, 
  Trophy,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronDown,
  Home,
  Shield
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuthBackend } from '@/hooks/useAuthBackend';

export default function Header() {
  const { user, loading, signOut } = useAuthBackend();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) {
      const displayName = user?.nombre_completo || user?.email;
      if (!displayName) return 'U';
      return displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    }
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderAvatar = (avatarString: string | undefined, size: number = 40) => {
    const avatarUrl = user?.url_avatar;
    
    if (!avatarString && !avatarUrl) {
      return getInitials(user?.nombre_completo);
    }

    const finalAvatarString = avatarString || avatarUrl;

    if (finalAvatarString?.startsWith('boring-avatar:')) {
      const parts = finalAvatarString.split(':');
      const name = parts[1] || 'Usuario';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      return (
        <div 
          className="rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-slate-500 flex items-center justify-center text-white font-bold shadow-lg"
          style={{ width: size, height: size }}
        >
          {initials}
        </div>
      );
    }

    if (!finalAvatarString) {
      return (
        <div 
          className="rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-slate-500 flex items-center justify-center text-white font-bold shadow-lg"
          style={{ width: size, height: size }}
        >
          U
        </div>
      );
    }
    
    return (
      <Image 
        src={finalAvatarString} 
        alt="Avatar" 
        width={size} 
        height={size} 
        className="rounded-full object-cover shadow-lg"
      />
    );
  };

  // Navegación principal organizada
  const mainNavLinks = [
    {
      name: 'Diccionario',
      href: '/diccionario',
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:text-blue-600 dark:hover:text-blue-400',
      bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
    }
  ];

  // Navegación de usuario (solo para logueados)
  const userNavLinks = [
    {
      name: 'Contribuir',
      href: '/contribuir',
      icon: Plus,
      color: 'text-orange-600 dark:text-orange-400',
      hoverColor: 'hover:text-orange-600 dark:hover:text-orange-400',
      bgColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
    },
    {
      name: 'Comunidad',
      href: '/feedback',
      icon: MessageCircle,
      color: 'text-cyan-600 dark:text-cyan-400',
      hoverColor: 'hover:text-cyan-600 dark:hover:text-cyan-400',
      bgColor: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
    }
  ];

  // Navegación de admin (solo para admins)
  const adminNavLinks = [
    {
      name: 'Admin',
      href: '/admin',
      icon: Settings,
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:text-red-600 dark:hover:text-red-400',
      bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/20'
    }
  ];

  // Lecciones (próximamente)
  const comingSoonLinks = [
    {
      name: 'Lecciones',
      icon: HelpCircle,
      comingSoon: true,
      color: 'text-slate-400 dark:text-slate-500',
      bgColor: 'cursor-not-allowed'
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo y brand - Rediseñado */}
          <Link href={user ? "/dashboard" : "/"} className="group flex items-center gap-3">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="Nawatlahtol Logo" 
                width={40} 
                height={40} 
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-slate-600 bg-clip-text text-transparent group-hover:from-cyan-500 group-hover:via-blue-500 group-hover:to-slate-500 transition-all duration-300">
                NAWATLAHTOL
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Lengua Náhuatl Digital
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Reorganizado */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Navegación principal */}
            {mainNavLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${link.color} ${link.hoverColor} ${link.bgColor} border border-transparent hover:border-cyan-200/50 dark:hover:border-cyan-700/50`}
              >
                <link.icon size={16} className="group-hover:scale-110 transition-transform duration-300" />
                <span>{link.name}</span>
              </Link>
            ))}

            {/* Separador visual */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {/* Navegación de usuario */}
            {user && userNavLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${link.color} ${link.hoverColor} ${link.bgColor} border border-transparent hover:border-cyan-200/50 dark:hover:border-cyan-700/50`}
              >
                <link.icon size={16} className="group-hover:scale-110 transition-transform duration-300" />
                <span>{link.name}</span>
              </Link>
            ))}

            {/* Navegación de admin */}
            {user?.rol === 'admin' && adminNavLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${link.color} ${link.hoverColor} ${link.bgColor} border border-transparent hover:border-cyan-200/50 dark:hover:border-cyan-700/50`}
              >
                <link.icon size={16} className="group-hover:scale-110 transition-transform duration-300" />
                <span>{link.name}</span>
              </Link>
            ))}

            {/* Lecciones (próximamente) */}
            {comingSoonLinks.map((link) => (
              <div 
                key={link.name}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${link.color} ${link.bgColor}`}
              >
                <link.icon size={16} />
                <div className="flex flex-col">
                  <span>{link.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">(Próximamente)</span>
                </div>
              </div>
            ))}
          </nav>

          {/* User menu / Auth - Rediseñado */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {loading ? (
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            ) : user ? (
              <>
                {/* Desktop user menu - Mejorado */}
                <div className="hidden lg:block">
                  <Menu as="div" className="relative">
                    <Menu.Button className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 border border-transparent hover:border-cyan-200/50 dark:hover:border-cyan-700/50">
                      {renderAvatar(user.url_avatar, 36)}
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                          {user.nombre_completo || 'Usuario'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          @{user.username || 'usuario'}
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95 translate-y-2"
                      enterTo="transform opacity-100 scale-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="transform opacity-100 scale-100 translate-y-0"
                      leaveTo="transform opacity-0 scale-95 translate-y-2"
                    >
                      <Menu.Items className="absolute right-0 mt-3 w-72 origin-top-right bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-1 py-2">
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              {renderAvatar(user.url_avatar, 48)}
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.nombre_completo || user.email || 'Usuario'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <Menu.Item>
                            {({ active }) => (
                              <Link href="/profile" className={`${active ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'} group flex rounded-xl items-center w-full px-4 py-3 text-sm transition-all duration-200`}>
                                <UserIcon className="mr-3 h-5 w-5" />
                                Mi Perfil
                              </Link>
                            )}
                          </Menu.Item>
                        </div>
                        <div className="px-1 py-2">
                          <Menu.Item>
                            {({ active }) => (
                              <button 
                                onClick={handleLogout} 
                                className={`${active ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'} group flex rounded-xl items-center w-full px-4 py-3 text-sm transition-all duration-200`}
                              >
                                <LogOut className="mr-3 h-5 w-5" />
                                Cerrar Sesión
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>

                {/* Mobile menu button - Mejorado */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-3 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
                >
                  {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu - Completamente rediseñado */}
        {mobileMenuOpen && user && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <div className="px-4 py-6">
              {/* User info - Mejorado */}
              <div className="flex items-center gap-4 px-4 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl mb-6">
                {renderAvatar(user.url_avatar, 48)}
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user.nombre_completo || user.email || 'Usuario'}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{user.email}</span>
                </div>
              </div>

              {/* Navigation links - Organizados por secciones */}
              <div className="space-y-6">
                {/* Sección Principal */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">PRINCIPAL</h3>
                  <div className="space-y-1">
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-300 rounded-xl"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon size={20} />
                      <span className="font-medium">Mi Perfil</span>
                    </Link>
                  </div>
                </div>

                {/* Sección Navegación */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">NAVEGACIÓN</h3>
                  <div className="space-y-1">
                    {mainNavLinks.map((link) => (
                      <Link 
                        key={link.name}
                        href={link.href} 
                        className={`flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon size={20} />
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Sección Usuario */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">USUARIO</h3>
                  <div className="space-y-1">
                    {userNavLinks.map((link) => (
                      <Link 
                        key={link.name}
                        href={link.href} 
                        className={`flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon size={20} />
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Sección Admin */}
                {user?.rol === 'admin' && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">ADMINISTRACIÓN</h3>
                    <div className="space-y-1">
                      {adminNavLinks.map((link) => (
                        <Link 
                          key={link.name}
                          href={link.href} 
                          className={`flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <link.icon size={20} />
                          <span className="font-medium">{link.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lecciones (próximamente) */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">PRÓXIMAMENTE</h3>
                  <div className="space-y-1">
                    {comingSoonLinks.map((link) => (
                      <div 
                        key={link.name}
                        className={`flex items-center gap-3 px-4 py-3 text-slate-400 dark:text-slate-500 cursor-not-allowed rounded-xl`}
                      >
                        <link.icon size={20} />
                        <div className="flex flex-col">
                          <span className="font-medium">{link.name}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">(Próximamente)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logout button - Mejorado */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 border-t border-slate-200 dark:border-slate-700 pt-4 mt-6 rounded-xl w-full"
              >
                <LogOut size={20} />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}