import { lazy, Suspense, useLayoutEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { readTheme, saveTheme } from './themePreference';
const SharedApp = lazy(() => import('./SharedApp'));
export default function App() {
  const [mode, setMode] = useState(readTheme);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#0a0a0a' : '#2865e8');
    saveTheme(mode);
  }, [mode]);
  return <>
    <Suspense fallback={<div className="theme-loading" role="status">Loading SmartBus...</div>}>
      <SharedApp mode={mode} />
    </Suspense>
    <div className="theme-switcher">
      <button type="button" onClick={() => setMode(current => current === 'light' ? 'dark' : 'light')} aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
        {mode === 'light' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}<span>{mode === 'light' ? 'Dark mode' : 'Light mode'}</span>
      </button>
    </div>
  </>;
}
