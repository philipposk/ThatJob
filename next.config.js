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
      
      // Inject __dirname and __filename polyfill at the top of every server bundle
      // This ensures they're available before any module tries to use them
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: `
            (function() {
              if (typeof global !== 'undefined') {
                if (typeof global.__dirname === 'undefined') {
                  global.__dirname = process.cwd();
                }
                if (typeof global.__filename === 'undefined') {
                  global.__filename = '';
                }
              }
              if (typeof globalThis !== 'undefined') {
                if (typeof globalThis.__dirname === 'undefined') {
                  globalThis.__dirname = process.cwd();
                }
                if (typeof globalThis.__filename === 'undefined') {
                  globalThis.__filename = '';
                }
              }
            })();
          `,
          raw: true,
          entryOnly: false, // Apply to all chunks, not just entry points
        })
      );
    }
    return config;
  },
}

module.exports = nextConfig
