import { useState } from 'react';
import Page from '../components/common/Page.jsx';
import { CONNECTIVITY_LABELS, ZONE_BADGE_CLS } from '../constants/lookups.js';
import { useSessionActions } from '../context/SessionContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { nowTime } from '../utils/time.js';

function ConnectivityBars({ level }) {
  return (
    <div className="cbar-wrap">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`cbar${i <= level ? ' c' + level : ''}`} id={`cb${i}`}></div>
      ))}
    </div>
  );
}

export default function BeaconPage({ active }) {
  const { api } = useSettings();
  const { beaconDelivered } = useSessionActions();
  const toast = useToast();

  const [userId, setUserId] = useState('user_123');
  const [lat, setLat] = useState('13.0827');
  const [lng, setLng] = useState('80.2707');
  const [conn, setConn] = useState(3);
  const [result, setResult] = useState('waiting...');
  const [zone, setZone] = useState(null);

  const sendBeacon = async () => {
    const user_id = userId;
    try {
      const res = await api.post('/api/beacon/', {
        user_id,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        connectivity_score: conn,
      });
      setResult(JSON.stringify(res, null, 2));

      if (res.messages && res.messages.length) {
        const ts = nowTime();
        beaconDelivered(res.messages.map(m => ({
          ...m, status: 'delivered', deliveredAt: ts, userId: user_id, cat: m.category, pri: m.priority,
        })));
        if (res.zone) setZone(res.zone);
        toast(`✓ ${res.messages.length} delivered`);
      } else {
        toast('Beacon — nothing deliverable');
      }
    } catch {
      toast('Beacon failed');
    }
  };

  const fillFromGps = () => {
    if (!navigator.geolocation) { toast('Geolocation unavailable'); return; }
    navigator.geolocation.getCurrentPosition(
      p => {
        setLat(p.coords.latitude.toFixed(4));
        setLng(p.coords.longitude.toFixed(4));
        toast('✓ GPS updated');
      },
      () => toast('Location denied')
    );
  };

  return (
    <Page id="beacon" active={active} title="Beacon Emitter" sub="POST /api/beacon — simulate client location ping">
      <div className="tc">
        <div className="panel">
          <div className="field">
            <label>User ID</label>
            <input type="text" id="b-uid" value={userId} onChange={e => setUserId(e.target.value)} />
          </div>
          <div className="field">
            <label>Latitude</label>
            <input type="number" id="b-lat" value={lat} step="0.0001" onChange={e => setLat(e.target.value)} />
          </div>
          <div className="field">
            <label>Longitude</label>
            <input type="number" id="b-lng" value={lng} step="0.0001" onChange={e => setLng(e.target.value)} />
          </div>
          <div className="field">
            <label>Connectivity — <span id="conn-lbl" style={{ color: 'var(--text)' }}>{CONNECTIVITY_LABELS[conn]}</span></label>
            <ConnectivityBars level={conn} />
            <input
              type="range" min="0" max="3" id="b-conn"
              value={conn}
              onChange={e => setConn(parseInt(e.target.value))}
              style={{ accentColor: 'var(--red)', width: '100%', marginTop: '6px' }}
            />
          </div>
          <div className="row" style={{ gap: '8px', marginTop: '4px' }}>
            <button className="btn btn-g" onClick={sendBeacon} style={{ flex: 1 }}>◎ Emit Beacon</button>
            <button className="btn btn-s" onClick={fillFromGps}>📍 GPS</button>
          </div>
        </div>
        <div className="panel">
          <div className="section-label">Response</div>
          <div id="b-result" className="rbox" style={{ marginBottom: '12px' }}>{result}</div>
          <div id="b-zone">
            {zone && (
              <span className={`zbadge ${ZONE_BADGE_CLS[zone.type] || 'za'}`}>{`◎ ${zone.label} — ${zone.type}`}</span>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
