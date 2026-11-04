// Simulated routes for the Drive Simulator.
// `route[i].pct` is the progress % at which waypoint i is reached;
// `points[i]` is its position in the 900×320 SVG viewBox.

export const DRIVE_TRACKS = {
  commute: {
    label: 'Commute',
    route: [
      { name: 'Home',    sig: 3, zone: 'always_deliver', pct: 0 },
      { name: 'Ring Rd', sig: 3, zone: 'always_deliver', pct: 13 },
      { name: 'Tunnel',  sig: 0, zone: 'defer',          pct: 25 },
      { name: 'Suburb',  sig: 1, zone: 'defer',          pct: 38 },
      { name: 'Highway', sig: 3, zone: 'always_deliver', pct: 51 },
      { name: 'Metro',   sig: 2, zone: 'critical_only',  pct: 64 },
      { name: 'Mall',    sig: 3, zone: 'always_deliver', pct: 78 },
      { name: 'Office',  sig: 2, zone: 'critical_only',  pct: 100 },
    ],
    points: [
      { x: 70, y: 226 }, { x: 172, y: 178 }, { x: 266, y: 220 }, { x: 378, y: 150 },
      { x: 505, y: 110 }, { x: 622, y: 172 }, { x: 742, y: 118 }, { x: 835, y: 70 },
    ],
  },
  metro: {
    label: 'Metro Line',
    route: [
      { name: 'Station', sig: 3, zone: 'always_deliver', pct: 0 },
      { name: 'Cutting', sig: 1, zone: 'defer',          pct: 12 },
      { name: 'Tunnel',  sig: 0, zone: 'defer',          pct: 24 },
      { name: 'Subway',  sig: 0, zone: 'defer',          pct: 42 },
      { name: 'Hub',     sig: 2, zone: 'critical_only',  pct: 56 },
      { name: 'Market',  sig: 1, zone: 'defer',          pct: 70 },
      { name: 'Flyover', sig: 3, zone: 'always_deliver', pct: 84 },
      { name: 'Office',  sig: 3, zone: 'always_deliver', pct: 100 },
    ],
    points: [
      { x: 72, y: 90 }, { x: 178, y: 116 }, { x: 280, y: 172 }, { x: 382, y: 226 },
      { x: 512, y: 198 }, { x: 618, y: 138 }, { x: 730, y: 96 }, { x: 836, y: 150 },
    ],
  },
  airport: {
    label: 'Airport Run',
    route: [
      { name: 'Office',   sig: 2, zone: 'critical_only',  pct: 0 },
      { name: 'CBD',      sig: 3, zone: 'always_deliver', pct: 15 },
      { name: 'Flyover',  sig: 3, zone: 'always_deliver', pct: 29 },
      { name: 'Toll',     sig: 1, zone: 'defer',          pct: 43 },
      { name: 'Highway',  sig: 0, zone: 'defer',          pct: 58 },
      { name: 'Service',  sig: 2, zone: 'critical_only',  pct: 72 },
      { name: 'Terminal', sig: 3, zone: 'always_deliver', pct: 88 },
      { name: 'Gate',     sig: 1, zone: 'critical_only',  pct: 100 },
    ],
    points: [
      { x: 64, y: 244 }, { x: 182, y: 232 }, { x: 300, y: 188 }, { x: 420, y: 122 },
      { x: 548, y: 88 }, { x: 666, y: 112 }, { x: 768, y: 176 }, { x: 836, y: 246 },
    ],
  },
};

export const TRACK_OPTIONS = [
  { value: 'commute', label: '🚗 Commute' },
  { value: 'metro',   label: '🚇 Metro Line' },
  { value: 'airport', label: '✈️ Airport Run' },
];

export const DEFAULT_TRACK = 'commute';
