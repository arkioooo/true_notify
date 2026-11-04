// Pure geometry / lookup helpers for the Drive Simulator.
// Positions are in the 900×320 SVG viewBox; divide by 9 / 3.2 for percentages.

/** The waypoint segment the car is currently in. */
export function getSeg(route, pct) {
  for (let i = route.length - 1; i >= 0; i--)
    if (pct >= route[i].pct) return route[i];
  return route[0];
}

function getRouteIndex(route, pct) {
  for (let i = route.length - 2; i >= 0; i--)
    if (pct >= route[i].pct) return i;
  return 0;
}

/** Smooth-stepped car position between the two surrounding waypoints. */
export function getRoutePosition(route, points, pct) {
  const idx = Math.min(getRouteIndex(route, pct), points.length - 2);
  const from = route[idx];
  const to = route[idx + 1];
  const a = points[idx];
  const b = points[idx + 1];
  const span = Math.max(1, to.pct - from.pct);
  const t = Math.max(0, Math.min(1, (pct - from.pct) / span));
  const eased = t * t * (3 - 2 * t);
  return {
    x: a.x + (b.x - a.x) * eased,
    y: a.y + (b.y - a.y) * eased,
    idx,
  };
}

export function routeSegmentPath(a, b) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const bend = (b.y >= a.y ? -1 : 1) * 22;
  return `M ${a.x} ${a.y} Q ${mx} ${my + bend} ${b.x} ${b.y}`;
}

/** Convert viewBox coordinates into CSS left/top percentages. */
export const toPercent = p => ({ left: (p.x / 9) + '%', top: (p.y / 3.2) + '%' });

/** Signal ≥ 3G and not in a defer zone. */
export const canDeliver = seg => seg.sig >= 2 && seg.zone !== 'defer';

const SIGNAL_MESSAGES = {
  0: 'No signal — all messages queued.',
  1: 'Weak 2G — deferring non-critical.',
  2: '3G — delivering messages now.',
  3: 'Strong 4G — real-time delivery.',
};

export function driveStatusMessage(seg) {
  const zl = seg.zone === 'defer'         ? ' ◉ defer zone'
           : seg.zone === 'critical_only' ? ' ◉ critical_only'
           :                                ' ◉ always_deliver';
  return (SIGNAL_MESSAGES[seg.sig] || '') + zl;
}
