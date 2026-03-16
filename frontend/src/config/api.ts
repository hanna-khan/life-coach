/**
 * API base URL: production pe site ke origin use karo, dev pe localhost:5000.
 * REACT_APP_API_URL set ho to use karo (build-time).
 */
let _debugLogged = false;
function debugLog(msg: string, data: Record<string, unknown>) {
  if (!_debugLogged) {
    _debugLogged = true;
    console.log('[API config]', msg, data);
  }
}

export function getApiBaseUrl(): string {
  const hasWindow = typeof window !== 'undefined';
  const hostname = hasWindow ? window.location.hostname : 'unknown';
  const origin = hasWindow ? window.location.origin : 'unknown';

  let base: string;
  if (hasWindow && hostname !== 'localhost') {
    base = origin;
    debugLog('Production: using window.location.origin', { hostname, origin, base, apiUrl: base + '/api' });
    return base;
  }
  const env = process.env.REACT_APP_API_URL;
  if (env) {
    base = env.replace(/\/$/, '');
    debugLog('Using REACT_APP_API_URL', { hostname, env, base, apiUrl: base + (base.endsWith('/api') ? '' : '/api') });
    return base;
  }
  base = 'http://localhost:5000';
  debugLog('Fallback: localhost:5000', { hostname, origin, base, apiUrl: base + '/api' });
  return base;
}

export function getApiUrl(): string {
  const base = getApiBaseUrl();
  return base + (base.endsWith('/api') ? '' : '/api');
}
