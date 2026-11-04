// Session state: the notifications routed through the pipeline this session.
// Each action mirrors one mutation of the original global `S` object, keeping
// the same counter semantics (including the original's quirks, e.g. spam drops
// bump `stats.pending` without adding to the pending list).

const MAX_ACTIVITY = 20;

const emptyStats = () => ({ pending: 0, delivered: 0, deferred: 0, bypass: 0 });

export const initialSession = {
  pending: [],
  delivered: [],
  bypassed: [],
  stats: emptyStats(),
  activity: [],
  /** Which empty-state copy the dashboard shows: 'initial' | 'reset'. */
  activityEmpty: 'initial',
};

/** Prepend items one at a time (newest first), capped like the original DOM list. */
const pushActivity = (activity, ...items) =>
  items.reduce((list, m) => [m, ...list], activity).slice(0, MAX_ACTIVITY);

/** Remove the first pending message whose content matches each delivered one. */
function removeByContent(pending, delivered) {
  const next = [...pending];
  delivered.forEach(m => {
    const idx = next.findIndex(p => p.content === m.content);
    if (idx !== -1) next.splice(idx, 1);
  });
  return next;
}

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'spamDropped':
      return {
        ...state,
        activity: pushActivity(state.activity, action.message),
        stats: { ...state.stats, pending: state.stats.pending + 1 },
      };

    case 'bypassed':
      return {
        ...state,
        bypassed: [...state.bypassed, action.message],
        activity: pushActivity(state.activity, action.message),
        stats: { ...state.stats, bypass: state.stats.bypass + 1, delivered: state.stats.delivered + 1 },
      };

    case 'queued':
      return {
        ...state,
        pending: [...state.pending, action.message],
        activity: pushActivity(state.activity, action.message),
        stats: {
          ...state.stats,
          pending: state.stats.pending + 1,
          deferred: state.stats.deferred + (action.deferred ? 1 : 0),
        },
      };

    case 'deliveredNow':
      return {
        ...state,
        delivered: [...state.delivered, action.message],
        activity: pushActivity(state.activity, action.message),
        stats: { ...state.stats, delivered: state.stats.delivered + 1 },
      };

    // Beacon response delivered queued messages (shown in activity).
    // Drive-sim flush does the same but without activity entries.
    case 'beaconDelivered':
    case 'flushed': {
      const pending = removeByContent(state.pending, action.messages);
      return {
        ...state,
        pending,
        delivered: [...state.delivered, ...action.messages],
        activity: action.type === 'beaconDelivered'
          ? pushActivity(state.activity, ...action.messages)
          : state.activity,
        stats: {
          ...state.stats,
          delivered: state.stats.delivered + action.messages.length,
          pending: pending.length,
        },
      };
    }

    case 'messagesLoaded':
      return {
        ...state,
        delivered: action.delivered,
        pending: action.pending,
        stats: { ...state.stats, pending: action.pending.length, delivered: action.delivered.length },
      };

    case 'clearInbox':
      return { ...state, pending: [], delivered: [], bypassed: [], stats: emptyStats() };

    case 'resetSession':
      return {
        ...state,
        pending: [], delivered: [], bypassed: [],
        stats: emptyStats(),
        activity: [],
        activityEmpty: 'reset',
      };

    default:
      throw new Error(`Unknown session action: ${action.type}`);
  }
}
