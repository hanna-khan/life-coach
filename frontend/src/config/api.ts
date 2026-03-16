/**
 * API base URL: production pe site ke origin use karo, dev pe localhost:5000.
 * REACT_APP_API_URL set ho to use karo (build-time).
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  const env = process.env.REACT_APP_API_URL;
  if (env) return env.replace(/\/$/, '');
  return 'http://localhost:5000';
}

export function getApiUrl(): string {
  const base = getApiBaseUrl();
  return base + (base.endsWith('/api') ? '' : '/api');
}
