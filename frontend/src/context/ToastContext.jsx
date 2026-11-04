import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Toast from '../components/layout/Toast.jsx';

const TOAST_MS = 2600;

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [state, setState] = useState({ message: '', visible: false });
  const timers = useRef(new Set());

  // Same semantics as the original: each call shows the message and schedules
  // its own hide; the text is kept while the toast fades out.
  const toast = useCallback(message => {
    setState({ message, visible: true });
    const id = setTimeout(() => {
      timers.current.delete(id);
      setState(s => ({ ...s, visible: false }));
    }, TOAST_MS);
    timers.current.add(id);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toast message={state.message} visible={state.visible} />
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
