const CARDS = [
  { id: 'dr-p', label: 'Queued',    icon: '⏸', iconBg: 'var(--amber-s)', tone: 'amber', key: 'p' },
  { id: 'dr-d', label: 'Delivered', icon: '✓', iconBg: 'var(--green-s)', tone: 'green', key: 'd' },
  { id: 'dr-b', label: 'Bypassed',  icon: '⚡', iconBg: 'var(--red-s)',   tone: 'red',   key: 'b' },
];

const ZONE_VALUE_STYLE = { fontSize: '15px', letterSpacing: 0 };

export default function DriveStats({ stats, zoneName }) {
  return (
    <div className="uber-dash">
      {CARDS.map(c => (
        <div className="uber-card" key={c.id}>
          <div className="uber-card-icon" style={{ background: c.iconBg }}>{c.icon}</div>
          <div>
            <div className={`uber-card-val ${c.tone}`} id={c.id}>{stats[c.key]}</div>
            <div className="uber-card-lbl">{c.label}</div>
          </div>
        </div>
      ))}
      <div className="uber-card">
        <div className="uber-card-icon" style={{ background: 'var(--s3)' }}>📍</div>
        <div>
          <div className="uber-card-val" id="dr-z" style={ZONE_VALUE_STYLE}>{zoneName}</div>
          <div className="uber-card-lbl">Current Zone</div>
        </div>
      </div>
    </div>
  );
}
