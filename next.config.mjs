/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['portal.abs.xyz'],
  },
  async rewrites() {
    return [
      {
        source: '/games/bounce/:path*',
        destination: '/public/games/turtlebouncybounce/:path*',
      },
      {
        source: '/games/roguelike/:path*',
        destination: '/public/games/turtlegamebob/:path*',
      },
    ];
  },
};

export default nextConfig;
