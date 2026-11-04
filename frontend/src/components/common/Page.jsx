/**
 * Every page stays mounted (as in the original markup) and is shown/hidden via
 * the `.page.active` class, so in-progress state such as a running drive
 * simulation or half-typed form input survives navigation.
 */
export default function Page({ id, active, title, sub, children }) {
  return (
    <div className={`page${active ? ' active' : ''}`} id={`page-${id}`}>
      <div className="page-title">{title}</div>
      <div className="page-sub">{sub}</div>
      {children}
    </div>
  );
}
