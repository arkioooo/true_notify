import { CATBG, CATBG_DEFAULT, CATICON } from '../../constants/lookups.js';
import PriorityTag from './PriorityTag.jsx';

const BYPASS_TAG_STYLE = { fontSize: '9px' };

function StatusLine({ message, ts }) {
  if (message.status === 'delivered') {
    return <span className="std">{`✓ delivered @ ${message.deliveredAt || ts}`}</span>;
  }
  if (message.status === 'bypassed') {
    return <span className="stb">{`⚡ bypassed @ ${ts}`}</span>;
  }
  return <span className="stp">{`⏸ pending since ${ts}`}</span>;
}

/** A single notification row (".qi") used by the Dashboard and Inbox. */
export default function NotificationCard({ message, fallbackUserId }) {
  const m = message;
  const statusClass = m.status === 'delivered' ? 'delivered' : m.status === 'bypassed' ? 'bypassed' : 'pending';
  const ts  = m.ts || new Date().toLocaleTimeString();
  const cat = m.cat || m.category || 'social';
  const pri = m.pri || m.priority || 'normal';

  return (
    <div className={`qi ${statusClass}`}>
      <div className="qic" style={CATBG[cat] || CATBG_DEFAULT}>{CATICON[cat] || '📩'}</div>
      <div className="qb">
        <div className="qh">
          <PriorityTag priority={pri} />
          <span className="ctag">{cat}</span>
          {(m.bypass || m.should_bypass_deferral) && (
            <PriorityTag priority="critical" style={BYPASS_TAG_STYLE}>⚡</PriorityTag>
          )}
        </div>
        <div className="qc">{m.content}</div>
        {m.summary && <div className="qs">{`"${m.summary}"`}</div>}
        <div className="qm">
          <StatusLine message={m} ts={ts} />
          <span>{`user:${m.userId || fallbackUserId}`}</span>
        </div>
      </div>
    </div>
  );
}
