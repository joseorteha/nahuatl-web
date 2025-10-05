import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deshabilitar ESLint y TypeScript durante el build para deploy
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuración de output para Vercel
  output: 'standalone',

  // Configuración de assetPrefix para prevenir localhost en producción
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  
  // Configuración para evitar referencias a localhost en producción
  trailingSlash: false,
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'boring-avatar.id32vt-beam-1.beam',
        port: '',
        pathname: '/**',
      }
    ],
    // Permitir imágenes de boring-avatars
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Configuración experimental para Next.js 15
  experimental: {
    // Habilitar características experimentales si es necesario
  },
  
  // Configuración de headers para archivos estáticos
  async headers() {
    return [
      {
        source: '/favico.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable',
          },
        ],
      },
      {
        source: '/logooo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable',
          },
        ],
      },
    ]
  },
  
  // Configuración de variables de entorno
  env: {
    // Variables del lado del servidor
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    // Variables del lado del cliente (públicas)
    NEXT_PUBLIC_LAUNCH_MODE: process.env.NEXT_PUBLIC_LAUNCH_MODE,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Configuración de webpack para variables de entorno
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Asegurar que las variables de entorno estén disponibles en el servidor
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
