import { useState } from 'react';
import Page from '../components/common/Page.jsx';
import PriorityTag from '../components/common/PriorityTag.jsx';
import { useSessionActions } from '../context/SessionContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const TTL_MAP = [
  { cat: 'otp',           ttl: '300s',   color: 'var(--red)' },
  { cat: 'transactional', ttl: '3600s',  color: 'var(--amber)' },
  { cat: 'alert',         ttl: '1800s',  color: 'var(--blue)' },
  { cat: 'social',        ttl: '86400s', color: 'var(--green)' },
  { cat: 'marketing',     ttl: '43200s', color: 'var(--dim)' },
];

const PRIORITY_WEIGHTS = [
  { pri: 'critical', w: 4, color: 'var(--red)' },
  { pri: 'high',     w: 3, color: 'var(--amber)' },
  { pri: 'normal',   w: 2, color: 'var(--blue)' },
  { pri: 'low',      w: 1, color: 'var(--dim)' },
];

export default function SettingsPage({ active }) {
  const settings = useSettings();
  const { resetSession } = useSessionActions();
  const toast = useToast();

  const [url, setUrl] = useState(settings.apiBase);
  const [uid, setUid] = useState(settings.userId);

  const save = () => {
    settings.saveSettings(url, uid);
    toast('Settings saved');
  };

  const reset = () => {
    resetSession();
    toast('Session reset');
  };

  return (
    <Page id="settings" active={active} title="Settings" sub="API configuration and session management">
      <div className="tc">
        <div className="panel">
          <div className="section-label">API Config</div>
          <div className="field">
            <label>Backend URL</label>
            <input type="text" id="set-url" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div className="field">
            <label>User ID</label>
            <input type="text" id="set-uid" value={uid} onChange={e => setUid(e.target.value)} />
          </div>
          <button className="btn btn-p" onClick={save} style={{ width: '100%', marginBottom: '16px' }}>Save</button>
          <div className="divider"></div>
          <div className="section-label">TTL Map</div>
          <div className="mono" style={{ fontSize: '12px', lineHeight: 2.4, color: 'var(--muted)' }}>
            {TTL_MAP.map(r => (
              <div key={r.cat} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{r.cat}</span><span style={{ color: r.color }}>{r.ttl}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="section-label">Priority Weights</div>
          <div className="mono" style={{ fontSize: '12px', lineHeight: 2.8, color: 'var(--muted)' }}>
            {PRIORITY_WEIGHTS.map(r => (
              <div key={r.pri} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PriorityTag priority={r.pri} />
                <span style={{ flex: 1, height: '1px', background: 'var(--border)' }}></span>
                <span style={{ color: r.color }}>{`w=${r.w}`}</span>
              </div>
            ))}
          </div>
          <div className="divider"></div>
          <button className="btn btn-d" style={{ width: '100%' }} onClick={reset}>↺ Reset Session</button>
        </div>
      </div>
    </Page>
  );
}
