// Pill-nav entries, in display order. `id` matches the page id (#page-<id>).

const icon16 = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' };

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg {...icon16}>
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: (
      <svg {...icon16}>
        <path d="M2 4h12M2 8h12M2 12h8" />
      </svg>
    ),
  },
  {
    id: 'drive',
    label: 'Drive Simulator',
    icon: (
      <svg {...icon16}>
        <circle cx="4" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <path d="M2.5 12H1V7l3-4h7l2 4v1M5.5 12h5" />
      </svg>
    ),
  },
  {
    id: 'notify',
    label: 'Send Notification',
    icon: (
      <svg {...icon16}>
        <path d="M14 2L2 7l4 2 2 5 6-12z" />
      </svg>
    ),
  },
  {
    id: 'beacon',
    label: 'Beacon',
    icon: (
      <svg {...icon16}>
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2" />
      </svg>
    ),
  },
  {
    id: 'geo',
    label: 'Geo Zones',
    icon: (
      <svg {...icon16}>
        <path d="M8 2C5.8 2 4 3.8 4 6c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" />
        <circle cx="8" cy="6" r="1.5" />
      </svg>
    ),
  },
  {
    id: 'logic',
    label: 'Logic',
    icon: (
      <svg {...icon16}>
        <path d="M2 8h12M8 2v12" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M19.4 15a7.97 7.97 0 0 0 .1-2l2-1.5-2-3.5-2.3 1a8 8 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a8 8 0 0 0-1.7 1l-2.3-1-2 3.5 2 1.5a8 8 0 0 0 0 2l-2 1.5 2 3.5 2.3-1a8 8 0 0 0 1.7 1l.3 2.5h4l.3-2.5a8 8 0 0 0 1.7-1l2.3 1 2-3.5-2-1.5z" />
      </svg>
    ),
  },
];
