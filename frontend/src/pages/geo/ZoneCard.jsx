import { GEOIC, ZONE_BADGE_CLS } from '../../constants/lookups.js';
import { formatWindows } from '../../utils/geoZones.js';

const MONO = "'JetBrains Mono',monospace";
const S = {
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' },
  flyBtn:    {
    padding: '4px 8px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '4px',
    fontSize: '10px', color: 'var(--muted)', cursor: 'pointer',
  },
  meta:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' },
  radius:    { fontSize: '10px', color: 'var(--muted)', fontFamily: MONO },
  quietBox:  { marginTop: '6px', padding: '6px', background: 'var(--amber-s)', borderRadius: '5px' },
  noneBox:   { marginTop: '6px', padding: '6px', background: 'var(--s1)', borderRadius: '5px' },
  quietText: { fontSize: '9px', color: 'var(--amber)', fontFamily: MONO, marginBottom: '4px' },
  noneText:  { fontSize: '9px', color: 'var(--muted)', fontFamily: MONO, marginBottom: '4px' },
  editBtn:   {
    width: '100%', padding: '4px', fontSize: '9px', background: 'var(--s2)', border: '1px solid var(--border)',
    borderRadius: '4px', color: 'var(--muted)', cursor: 'pointer', transition: 'all .2s',
  },
};

export default function ZoneCard({ zone, onFlyTo, onEditQuietHours }) {
  const icon = GEOIC[zone.label] || GEOIC.default;
  const badgeCls = ZONE_BADGE_CLS[zone.zone_type] || 'za';
  const hasQuietHours = zone.deferral_times && zone.deferral_times.length > 0;

  // Clicking anywhere on the card (except its buttons) flies the map to the zone.
  const handleCardClick = e => {
    if (e.target.tagName !== 'BUTTON') onFlyTo(zone);
  };

  return (
    <div className="geo-card" onClick={handleCardClick}>
      <div style={S.header}>
        <div>
          <div className="geo-card-label">{`${icon} ${zone.label}`}</div>
          <div className="geo-card-coords">{`${parseFloat(zone.lat).toFixed(4)}, ${parseFloat(zone.lng).toFixed(4)}`}</div>
        </div>
        <button style={S.flyBtn} onClick={() => onFlyTo(zone)}>📍</button>
      </div>
      <div style={S.meta}>
        <span className={`zbadge ${badgeCls}`}>{zone.zone_type}</span>
        <span style={S.radius}>{`r=${zone.radius_meters}m`}</span>
      </div>
      {hasQuietHours ? (
        <div style={S.quietBox}>
          <div style={S.quietText}>{`⏸ Quiet Hours: ${formatWindows(zone.deferral_times)}`}</div>
          <button style={S.editBtn} onClick={() => onEditQuietHours(zone._key)}>✏️ Edit</button>
        </div>
      ) : (
        <div style={S.noneBox}>
          <div style={S.noneText}>Quiet Hours: Not set</div>
          <button style={S.editBtn} onClick={() => onEditQuietHours(zone._key)}>Set Quiet Hours</button>
        </div>
      )}
    </div>
  );
}
