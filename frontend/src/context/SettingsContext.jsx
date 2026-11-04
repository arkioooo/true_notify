import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createApiClient } from '../api/client.js';

const DEFAULT_SETTINGS = { apiBase: 'http://localhost:8000', userId: 'user_123' };

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Long-running async work (drive simulator, in-flight requests) reads the
  // *current* settings through this ref instead of a captured closure value.
  const ref = useRef(settings);

  const saveSettings = useCallback((apiBase, userId) => {
    ref.current = { apiBase, userId };
    setSettings(ref.current);
  }, []);

  const getUserId = useCallback(() => ref.current.userId, []);
  const api = useMemo(() => createApiClient(() => ref.current.apiBase), []);

  const value = useMemo(
    () => ({ ...settings, saveSettings, getUserId, api }),
    [settings, saveSettings, getUserId, api]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
