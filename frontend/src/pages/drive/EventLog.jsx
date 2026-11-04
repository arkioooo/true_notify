import { useLayoutEffect, useRef } from 'react';

export default function EventLog({ entries }) {
  const ref = useRef(null);

  // Keep the newest entry in view.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  return (
    <div className="log" id="logstream" ref={ref}>
      {entries.map(e => (
        <div className="le" key={e.id}>
          <span className="lt">{e.time}</span>
          <span className={`l${e.type}`}>{e.text}</span>
        </div>
      ))}
    </div>
  );
}
