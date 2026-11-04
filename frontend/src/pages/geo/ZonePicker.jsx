import { useState } from 'react';
import { QUIET_PRESETS } from '../../constants/presets.js';

const S = {
  coords:     { fontSize: '9px', color: 'var(--dim)', marginBottom: '8px' },
  group:      { marginBottom: '8px' },
  label:      { fontSize: '9px', color: 'var(--muted)', display: 'block', marginBottom: '2px' },
  labelWide:  { fontSize: '9px', color: 'var(--muted)', display: 'block', marginBottom: '3px' },
  input:      { margin: 0 },
  timeRow:    { display: 'flex', gap: '3px', marginBottom: '4px' },
  timeInput:  { flex: 1, margin: 0, fontSize: '10px' },
  to:         { color: 'var(--dim)', padding: '4px 0' },
  presetRow:  { display: 'flex', gap: '2px' },
  presetBtn:  {
    flex: 1, padding: '3px', fontSize: '8px', background: 'var(--s2)', border: '1px solid var(--border)',
    borderRadius: '4px', color: 'var(--muted)', cursor: 'pointer',
  },
  typeGroup:  { marginBottom: '6px' },
  typeRow:    { display: 'flex', gap: '4px' },
  typeBtn:    { flex: 1, padding: '6px', fontSize: '10px', margin: 0 },
};

const ZONE_TYPES = [
  { type: 'always_deliver', cls: 'za-btn', label: '✓ Deliver' },
  { type: 'defer',          cls: 'zd-btn', label: '⏸ Defer' },
  { type: 'critical_only',  cls: 'zc-btn', label: '⚡ Critical' },
];

/** "Add Zone" form shown inside the Leaflet popup after clicking the map. */
export default function ZonePicker({ lat, lng, onSubmit }) {
  const [label, setLabel] = useState('');
  const [radius, setRadius] = useState('200');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  return (
    <>
      <div className="popup-label">📍 Add Zone</div>
      <div style={S.coords}>{`${lat.toFixed(5)}, ${lng.toFixed(5)}`}</div>

      <div style={S.group}>
        <label style={S.label}>Zone Name</label>
        <input className="popup-input" id="pp-label" placeholder="e.g. home, office, gym" style={S.input}
          value={label} onChange={e => setLabel(e.target.value)} />
      </div>

      <div style={S.group}>
        <label style={S.label}>Radius (meters)</label>
        <input className="popup-input" id="pp-radius" type="number" style={S.input}
          value={radius} onChange={e => setRadius(e.target.value)} />
      </div>

      <div style={S.group}>
        <label style={S.labelWide}>⏰ Quiet Hours (optional)</label>
        <div style={S.timeRow}>
          <input className="popup-input" id="pp-defer-start" type="time" style={S.timeInput}
            value={start} onChange={e => setStart(e.target.value)} />
          <span style={S.to}>to</span>
          <input className="popup-input" id="pp-defer-end" type="time" style={S.timeInput}
            value={end} onChange={e => setEnd(e.target.value)} />
        </div>
        <div style={S.presetRow}>
          {QUIET_PRESETS.map(p => (
            <button key={p.label} style={S.presetBtn} onClick={() => { setStart(p.start); setEnd(p.end); }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={S.typeGroup}>
        <label style={S.labelWide}>Zone Type</label>
        <div style={S.typeRow}>
          {ZONE_TYPES.map(z => (
            <button key={z.type} className={`zone-btn ${z.cls}`} style={S.typeBtn}
              onClick={() => onSubmit(z.type, { label, radius, start, end })}>
              {z.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
