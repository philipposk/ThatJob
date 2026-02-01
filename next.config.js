/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    // Only apply polyfills in production/serverless environments
    // Local Node.js has __dirname natively
    if (isServer && process.env.NODE_ENV === 'production') {
      try {
        const DirnamePolyfillPlugin = require('./webpack-dirname-plugin');
        
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          path: false,
        };
        
        // Replace __dirname and __filename with actual values at build time
        config.plugins.push(
          new webpack.DefinePlugin({
            __dirname: JSON.stringify(process.cwd()),
            __filename: JSON.stringify(''),
          })
        );
        
        // Also inject polyfill at runtime as backup
        config.plugins.push(new DirnamePolyfillPlugin());
      } catch (e) {
        // If plugin fails to load, continue without it
        console.warn('Could not load DirnamePolyfillPlugin:', e.message);
      }
    }
    return config;
  },
}

module.exports = nextConfig
