/**
 * API base URL: sirf frontend .env se — REACT_APP_API_URL.
 * Fallback: localhost:5000 (dev).
 */

// Minimal declaration so TypeScript knows about process.env in the browser build
declare const process: {
  env: Record<string, string | undefined>;
};

let _debugLogged = false;
function debugLog(msg: string, data: Record<string, unknown>) {
  if (!_debugLogged) {
    _debugLogged = true;
    console.log('[API config]', msg, data);
  }
}

export function getApiBaseUrl(): string {
  return 'https://api.lukewestbrookmanhattan.com';
  // const env = process.env.REACT_APP_API_URL;
  // if (env) {
  //   const base = env.replace(/\/$/, '');
  //   debugLog('Using REACT_APP_API_URL', { env, base, apiUrl: base + (base.endsWith('/api') ? '' : '/api') });
  //   return base;
  // }
  // const base = 'http://localhost:5000';
  // debugLog('Fallback: localhost:5000 (REACT_APP_API_URL not set)', { base, apiUrl: base + '/api' });
  // return base;
}

export function getApiUrl(): string {
  const base = getApiBaseUrl();
  return base + (base.endsWith('/api') ? '' : '/api');
}
