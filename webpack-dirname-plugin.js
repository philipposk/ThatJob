// Custom webpack plugin to inject __dirname and __filename polyfill
// This runs before any module code executes

class DirnamePolyfillPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('DirnamePolyfillPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'DirnamePolyfillPlugin',
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          const polyfillCode = `
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
`;

          // Inject polyfill at the start of each server chunk
          Object.keys(assets).forEach((filename) => {
            if (filename.endsWith('.js') && filename.includes('server')) {
              const asset = assets[filename];
              const source = asset.source();
              assets[filename] = {
                source: () => polyfillCode + '\n' + source,
                size: () => polyfillCode.length + source.length,
              };
            }
          });
        }
      );
    });
  }
}

module.exports = DirnamePolyfillPlugin;
