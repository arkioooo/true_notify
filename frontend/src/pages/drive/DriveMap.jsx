import { getRoutePosition, routeSegmentPath, toPercent } from '../../utils/route.js';

const segClass = sig => (sig >= 2 ? 'seg-g' : sig === 1 ? 'seg-a' : 'seg-r');
const WAYPOINT_GLOW = 'wpGlow .6s ease-out';

/** Route canvas: coloured segments, waypoints, floating packets, zone pill and the car. */
export default function DriveMap({ track, sim, seg, packets }) {
  const { route, points } = track;
  const pos = getRoutePosition(route, points, sim.prog);

  return (
    <div className="drive-map" id="drive-map">
      <svg className="drive-map-svg" viewBox="0 0 900 320" preserveAspectRatio="none" aria-hidden="true">
        <g id="tsegs">
          {route.slice(0, -1).map((r, i) => {
            const d = routeSegmentPath(points[i], points[i + 1]);
            const active = sim.showActiveSeg && i === pos.idx;
            return [
              <path key={`bg${i}`} className="route-seg route-seg-bg" d={d} />,
              <path key={`s${i}`} className={`route-seg seg ${segClass(r.sig)}${active ? ' active' : ''}`} d={d} data-idx={i} />,
            ];
          })}
        </g>
      </svg>

      <div className="drive-waypoints" id="wps">
        {route.map((r, i) => {
          const passed = sim.hasTicked && sim.prog >= r.pct;
          return (
            <div
              key={`${sim.trackKey}-${i}`}
              className={`wp${passed ? ' wpa' : ''}`}
              id={`wp${i}`}
              style={{ ...toPercent(points[i]), animation: passed ? WAYPOINT_GLOW : undefined }}
            >
              <div className="wp-dot"></div>
              <div className="wp-name">{r.name}</div>
            </div>
          );
        })}
      </div>

      <div className="packet-layer" id="packet-layer">
        {packets.map(p => (
          <div key={p.id} className={`packet ${p.cls}`} style={{ left: p.left, top: p.top }}>{p.text}</div>
        ))}
      </div>

      <div className="drive-zone-pill" id="drive-zone-pill">{`${seg.name} · ${seg.zone}`}</div>

      <div className="drive-car" id="dr-car" style={toPercent(pos)}>
        <div className="car-ping"></div>
        <div className="car-core">🚗</div>
      </div>
    </div>
  );
}
