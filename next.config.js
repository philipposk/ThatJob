/** @type {import('next').NextConfig} */
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
      
      // Provide __dirname for CommonJS modules that need it
      config.plugins.push(
        new webpack.DefinePlugin({
          __dirname: JSON.stringify(process.cwd()),
        })
      );
    }
    return config;
  },
}

module.exports = nextConfig
