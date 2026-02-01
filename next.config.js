/** @type {import('next').NextConfig} */
const DirnamePolyfillPlugin = require('./webpack-dirname-plugin');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    // Fix for __dirname in ES modules and CommonJS modules
    if (isServer) {
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
    }
    return config;
  },
}

module.exports = nextConfig
