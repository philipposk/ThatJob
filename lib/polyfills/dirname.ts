// Polyfill for __dirname and __filename in serverless environments
// This file should be imported early in server-side code

if (typeof global !== 'undefined') {
  if (typeof (global as any).__dirname === 'undefined') {
    (global as any).__dirname = process.cwd();
  }
  if (typeof (global as any).__filename === 'undefined') {
    (global as any).__filename = '';
  }
}

export {};
