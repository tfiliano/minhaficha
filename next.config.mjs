/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // AVISO: Isso permite que a produção seja buildada mesmo com erros de TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // AVISO: Isso permite que a produção seja buildada mesmo com erros de ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
