import { NAV_ITEMS } from './navItems.jsx';

export default function PillNav({ currentPage, onNavigate, apiBase }) {
  return (
    <nav id="pill-nav">
      <div className="pn-logo">True<span>Notify</span></div>
      {NAV_ITEMS.map(item => (
        <div
          key={item.id}
          className={`pn-item${item.id === currentPage ? ' active' : ''}`}
          data-label={item.label}
          onClick={() => onNavigate(item.id)}
        >
          {item.icon}
        </div>
      ))}
      <div className="pn-right">
        <div className="pn-dot"></div>
        <span id="api-disp">{apiBase.replace('http://', '')}</span>
      </div>
    </nav>
  );
}
