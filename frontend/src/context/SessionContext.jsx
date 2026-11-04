import { createContext, useContext, useMemo, useReducer } from 'react';
import { initialSession, sessionReducer } from './sessionReducer.js';
import { useSettings } from './SettingsContext.jsx';

const SessionStateContext = createContext(null);
const SessionActionsContext = createContext(null);

// Stable React keys for list rendering (assigned outside the reducer to keep it pure).
let uid = 0;
const stamp = m => ({ ...m, _uid: ++uid });

const toLocalTime = (m, fallbackUser) => ({
  ts: m.created_at ? new Date(m.created_at).toLocaleTimeString() : (m.ts || '—'),
  userId: m.userId || fallbackUser,
  cat: m.cat || m.category,
  pri: m.pri || m.priority,
});

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(sessionReducer, initialSession);
  const { api, getUserId } = useSettings();

  const actions = useMemo(() => ({
    spamDropped:     message => dispatch({ type: 'spamDropped', message: stamp(message) }),
    bypassed:        message => dispatch({ type: 'bypassed', message: stamp(message) }),
    queued:          (message, { deferred = false } = {}) =>
                       dispatch({ type: 'queued', message: stamp(message), deferred }),
    deliveredNow:    message => dispatch({ type: 'deliveredNow', message: stamp(message) }),
    beaconDelivered: messages => dispatch({ type: 'beaconDelivered', messages: messages.map(stamp) }),
    flushed:         messages => dispatch({ type: 'flushed', messages: messages.map(stamp) }),
    clearInbox:      () => dispatch({ type: 'clearInbox' }),
    resetSession:    () => dispatch({ type: 'resetSession' }),

    async loadMessages() {
      try {
        const userId = getUserId();
        const res = await api.get(`/api/messages/${userId}`);
        const delivered = res.delivered || res.messages || [];
        const pending = res.pending || [];
        dispatch({
          type: 'messagesLoaded',
          delivered: delivered.map(m => stamp({ ...m, status: 'delivered', ...toLocalTime(m, getUserId()) })),
          pending:   pending.map(m => stamp({ ...m, status: 'pending',   ...toLocalTime(m, getUserId()) })),
        });
      } catch (e) {
        console.warn('loadMessages failed:', e.message);
      }
    },
  }), [api, getUserId]);

  return (
    <SessionActionsContext.Provider value={actions}>
      <SessionStateContext.Provider value={state}>{children}</SessionStateContext.Provider>
    </SessionActionsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const ctx = useContext(SessionStateContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSessionActions() {
  const ctx = useContext(SessionActionsContext);
  if (!ctx) throw new Error('useSessionActions must be used inside <SessionProvider>');
  return ctx;
}
