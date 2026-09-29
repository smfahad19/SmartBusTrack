const THEME_KEY = 'smartbus-theme';
export function readTheme() {
  try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}
export function saveTheme(mode) {
  try { localStorage.setItem(THEME_KEY, mode); }
  catch { /* Theme switching remains available when storage is blocked. */ }
}
