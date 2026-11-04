import Page from '../components/common/Page.jsx';

const RULE_PANELS = [
  { title: '⚡ Bypass',   color: 'var(--red)',   rules: ['category = otp', 'category = alert', 'security / breach', 'skip queue entirely'] },
  { title: '⏸ Deferral', color: 'var(--amber)', rules: ['connectivity < 2', 'zone = "defer"', 'critical_only + low-pri', 'TTL expired → drop'] },
  { title: '✓ Delivery', color: 'var(--green)', rules: ['connectivity ≥ 2 (3G+)', 'zone = always_deliver', 'critical_only + critical', 'digest if >3 msgs'] },
];

/** Static flowchart of the defer / deliver pipeline. */
function DecisionDiagram() {
  return (
    <svg viewBox="0 0 740 620" width="100%" style={{ maxWidth: '740px', fontFamily: "'JetBrains Mono',monospace" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="ar"   markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#666" /></marker>
        <marker id="ar-g" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#27ae60" /></marker>
        <marker id="ar-r" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#c0392b" /></marker>
        <marker id="ar-a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#e67e22" /></marker>
      </defs>
      <rect x="270" y="10" width="200" height="44" rx="22" fill="#141414" stroke="#444" strokeWidth="1.5" />
      <text x="370" y="28" textAnchor="middle" fill="#f5f5f5" fontSize="10" fontWeight="500">INCOMING MESSAGE</text>
      <text x="370" y="44" textAnchor="middle" fill="#666" fontSize="9">POST /api/notify</text>
      <line x1="370" y1="54" x2="370" y2="86" stroke="#444" strokeWidth="1" markerEnd="url(#ar)" />
      <polygon points="370,86 458,118 370,150 282,118" fill="#141414" stroke="#e67e22" strokeWidth="1.5" />
      <text x="370" y="113" textAnchor="middle" fill="#e67e22" fontSize="10">Spam?</text>
      <text x="370" y="128" textAnchor="middle" fill="#666" fontSize="9">conf &gt; 0.85</text>
      <line x1="458" y1="118" x2="572" y2="118" stroke="#c0392b" strokeWidth="1" markerEnd="url(#ar-r)" />
      <text x="511" y="110" textAnchor="middle" fill="#c0392b" fontSize="9">YES</text>
      <rect x="572" y="98" width="118" height="40" rx="8" fill="#1a0505" stroke="#c0392b" strokeWidth="1.5" />
      <text x="631" y="115" textAnchor="middle" fill="#c0392b" fontSize="10">🚫 DROPPED</text>
      <text x="631" y="130" textAnchor="middle" fill="#666" fontSize="9">logged · discarded</text>
      <line x1="370" y1="150" x2="370" y2="182" stroke="#444" strokeWidth="1" markerEnd="url(#ar)" />
      <text x="378" y="170" fill="#666" fontSize="9">NO</text>
      <rect x="255" y="182" width="230" height="44" rx="8" fill="#141414" stroke="#444" strokeWidth="1.5" />
      <text x="370" y="200" textAnchor="middle" fill="#f5f5f5" fontSize="10">AI Analysis</text>
      <text x="370" y="216" textAnchor="middle" fill="#666" fontSize="9">priority · category · bypass flag</text>
      <line x1="370" y1="226" x2="370" y2="258" stroke="#444" strokeWidth="1" markerEnd="url(#ar)" />
      <polygon points="370,258 458,290 370,322 282,290" fill="#141414" stroke="#c0392b" strokeWidth="1.5" />
      <text x="370" y="285" textAnchor="middle" fill="#c0392b" fontSize="10">Bypass?</text>
      <text x="370" y="300" textAnchor="middle" fill="#666" fontSize="9">otp / alert / security</text>
      <line x1="458" y1="290" x2="572" y2="290" stroke="#c0392b" strokeWidth="1" markerEnd="url(#ar-r)" />
      <text x="511" y="282" textAnchor="middle" fill="#c0392b" fontSize="9">YES</text>
      <rect x="572" y="270" width="118" height="40" rx="8" fill="#1a0505" stroke="#c0392b" strokeWidth="1.5" />
      <text x="631" y="287" textAnchor="middle" fill="#c0392b" fontSize="10">⚡ SEND NOW</text>
      <text x="631" y="302" textAnchor="middle" fill="#666" fontSize="9">skip queue entirely</text>
      <line x1="370" y1="322" x2="370" y2="354" stroke="#444" strokeWidth="1" markerEnd="url(#ar)" />
      <text x="378" y="342" fill="#666" fontSize="9">NO</text>
      <rect x="255" y="354" width="230" height="44" rx="8" fill="#141414" stroke="#444" strokeWidth="1.5" />
      <text x="370" y="372" textAnchor="middle" fill="#f5f5f5" fontSize="10">Enqueue + TTL</text>
      <text x="370" y="388" textAnchor="middle" fill="#666" fontSize="9">Redis sorted set · weight×1B+ts</text>
      <line x1="370" y1="398" x2="370" y2="430" stroke="#444" strokeWidth="1" markerEnd="url(#ar)" />
      <polygon points="370,430 458,462 370,494 282,462" fill="#141414" stroke="#27ae60" strokeWidth="1.5" />
      <text x="370" y="457" textAnchor="middle" fill="#27ae60" fontSize="10">Beacon?</text>
      <text x="370" y="472" textAnchor="middle" fill="#666" fontSize="9">conn≥2 &amp; zone≠defer</text>
      <line x1="282" y1="462" x2="162" y2="462" stroke="#e67e22" strokeWidth="1" markerEnd="url(#ar-a)" />
      <text x="224" y="454" textAnchor="middle" fill="#e67e22" fontSize="9">NO</text>
      <rect x="52" y="442" width="110" height="40" rx="8" fill="#1a0d00" stroke="#e67e22" strokeWidth="1.5" />
      <text x="107" y="459" textAnchor="middle" fill="#e67e22" fontSize="10">⏸ DEFERRED</text>
      <text x="107" y="474" textAnchor="middle" fill="#666" fontSize="9">wait for beacon</text>
      <path d="M107,442 Q107,390 255,385" fill="none" stroke="#e67e22" strokeWidth="1" strokeDasharray="4,3" markerEnd="url(#ar-a)" />
      <line x1="370" y1="494" x2="370" y2="528" stroke="#27ae60" strokeWidth="1" markerEnd="url(#ar-g)" />
      <text x="378" y="515" fill="#27ae60" fontSize="9">YES</text>
      <rect x="255" y="528" width="230" height="44" rx="8" fill="#031008" stroke="#27ae60" strokeWidth="1.5" />
      <text x="370" y="546" textAnchor="middle" fill="#27ae60" fontSize="10">✓ FLUSH QUEUE</text>
      <text x="370" y="562" textAnchor="middle" fill="#666" fontSize="9">TTL check · zone filter · deliver</text>
      <line x1="458" y1="462" x2="560" y2="462" stroke="#666" strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#ar)" />
      <text x="506" y="454" textAnchor="middle" fill="#666" fontSize="9">critical_only</text>
      <rect x="560" y="442" width="128" height="40" rx="8" fill="#141414" stroke="#c0392b" strokeWidth="1" />
      <text x="624" y="459" textAnchor="middle" fill="#c0392b" fontSize="10">Filter: critical only</text>
      <text x="624" y="474" textAnchor="middle" fill="#666" fontSize="9">others stay queued</text>
    </svg>
  );
}

export default function LogicPage({ active }) {
  return (
    <Page id="logic" active={active} title="Decision Logic" sub="Defer / deliver pipeline — end to end">
      <div className="diag-wrap">
        <DecisionDiagram />
      </div>
      <div className="tc3" style={{ marginTop: '20px' }}>
        {RULE_PANELS.map(p => (
          <div className="panel" key={p.title}>
            <div className="section-label" style={{ color: p.color }}>{p.title}</div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 2.1 }}>
              {p.rules.map(r => <div key={r}>{r}</div>)}
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}
