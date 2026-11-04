// Category / priority / geo lookups used across cards and tags.

export const CATICON = { otp: '🔐', transactional: '💳', social: '💬', marketing: '📢', alert: '⚠️' };

export const CATBG = {
  otp:           { background: 'var(--red-s)' },
  transactional: { background: 'var(--amber-s)' },
  social:        { background: 'var(--green-s)' },
  marketing:     { background: 'rgba(255,255,255,0.04)' },
  alert:         { background: 'var(--amber-s)' },
};
export const CATBG_DEFAULT = { background: 'var(--s2)' };

/** priority -> .ptag modifier class */
export const PCLS = { critical: 'p-c', high: 'p-h', normal: 'p-n', low: 'p-l' };

export const GEOIC = {
  home: '🏠', office: '🏢', subway: '🚇', gym: '🏋️', hospital: '🏥', airport: '✈️', default: '📍',
};

/** zone_type -> .zbadge modifier class */
export const ZONE_BADGE_CLS = { always_deliver: 'za', defer: 'zd', critical_only: 'zc' };

export const ZONE_COLORS = {
  always_deliver: '#27ae60',
  defer:          '#e67e22',
  critical_only:  '#c0392b',
};

export const CONNECTIVITY_LABELS = ['Offline (0)', '2G (1)', '3G (2)', '4G/WiFi (3)'];
export const SIGNAL_LABELS = ['Offline', '2G', '3G', '4G'];
