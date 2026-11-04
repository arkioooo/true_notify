import PriorityTag from '../../components/common/PriorityTag.jsx';

const MAX_ITEMS = 8;
const EMPTY_STYLE = {
  textAlign: 'center', padding: '8px', fontSize: '10px', color: 'var(--dim)', fontFamily: "'JetBrains Mono',monospace",
};
const ITEM_TAG_STYLE = { fontSize: '9px', padding: '1px 4px' };

const icon12 = { width: '12', height: '12', viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' };

const PANELS = [
  {
    key: 'pQ', label: 'Pending', color: 'var(--amber)', countId: 'dqpc', listId: 'dqpl',
    icon: <svg {...icon12}><path d="M8 3v5l3 3" /><circle cx="8" cy="8" r="6" /></svg>,
  },
  {
    key: 'dQ', label: 'Delivered', color: 'var(--green)', countId: 'dqdc', listId: 'dqdl',
    icon: <svg {...icon12}><path d="M2 8l4 4 8-8" /></svg>,
  },
  {
    key: 'bQ', label: 'Bypass', color: 'var(--red)', countId: 'dqbc', listId: 'dqbl',
    icon: <svg {...icon12}><path d="M8 3v5M8 12v1" /><circle cx="8" cy="8" r="6" /></svg>,
  },
];

function QueueItem({ message, color }) {
  const content = message.content || '';
  const pri = message.pri || message.priority || 'normal';
  return (
    <div className="dqitem">
      <div className="dqdot" style={{ background: color }}></div>
      <div className="dqmsg">{content.slice(0, 42) + (content.length > 42 ? '…' : '')}</div>
      <div className="dqinfo">
        <PriorityTag priority={pri} style={ITEM_TAG_STYLE} />
        {message.deliveredAt && <span style={{ color: 'var(--green)' }}>✓</span>}
      </div>
    </div>
  );
}

/** Pending / Delivered / Bypass columns beside the route map. */
export default function QueuePanels({ sim }) {
  return (
    <div className="queue-side">
      {PANELS.map(p => {
        const items = sim[p.key];
        return (
          <div className="dqs" key={p.key}>
            <div className="dqh" style={{ color: p.color }}>
              {p.icon}
              {p.label}
              <span className="dqcnt" id={p.countId} style={{ color: p.color }}>{items.length}</span>
            </div>
            <div className="dql" id={p.listId}>
              {items.length
                ? [...items].reverse().slice(0, MAX_ITEMS).map((m, i) => (
                    <QueueItem key={`${items.length - i}`} message={m} color={p.color} />
                  ))
                : <div style={EMPTY_STYLE}>empty</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
