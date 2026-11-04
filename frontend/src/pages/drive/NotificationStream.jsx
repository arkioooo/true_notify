/** The "notification stream" strip of chips that drop in and fade out. */
export default function NotificationStream({ items }) {
  return (
    <div className="nrain" id="nrain">
      <div className="nrl">notification stream</div>
      {items.map(r => (
        <div
          key={r.id}
          className={`nri ${r.cls}`}
          style={{ left: r.left, top: r.top ?? undefined, opacity: r.fading ? '0' : undefined }}
        >
          {r.text}
        </div>
      ))}
    </div>
  );
}
