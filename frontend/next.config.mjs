/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://rent-spiracy.onrender.com/api/:path*'
          : 'http://127.0.0.1:8000/api/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Credentials', 
            value: 'true' 
          },
          { 
            key: 'Access-Control-Allow-Origin', 
            value: '*' 
          },
          { 
            key: 'Access-Control-Allow-Methods', 
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' 
          },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' 
          },
        ],
      },
    ]
  },
};

export default nextConfig; 