/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fix for __dirname in ES modules and CommonJS modules
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
      
      // Provide __dirname and __filename for CommonJS modules
      config.plugins.push(
        new config.webpack.DefinePlugin({
          __dirname: JSON.stringify(process.cwd()),
          __filename: JSON.stringify(__filename || ''),
        })
      );
    }
    return config;
  },
}

module.exports = nextConfig
