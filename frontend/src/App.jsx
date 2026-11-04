import { useCallback, useState } from 'react';
import PillNav from './components/layout/PillNav.jsx';
import { SessionProvider } from './context/SessionContext.jsx';
import { SettingsProvider, useSettings } from './context/SettingsContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import BeaconPage from './pages/BeaconPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DrivePage from './pages/drive/DrivePage.jsx';
import GeoPage from './pages/geo/GeoPage.jsx';
import InboxPage from './pages/InboxPage.jsx';
import LogicPage from './pages/LogicPage.jsx';
import NotifyPage from './pages/NotifyPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function Shell() {
  const { apiBase } = useSettings();
  // `seq` increments on every nav click so pages can react to being (re)opened,
  // matching the original showPage() which re-ran page setup on each click.
  const [nav, setNav] = useState({ page: 'dashboard', seq: 0 });
  const navigate = useCallback(page => setNav(n => ({ page, seq: n.seq + 1 })), []);

  const isActive = id => nav.page === id;
  const visitOf = id => (nav.page === id && nav.seq > 0 ? nav.seq : null);

  return (
    <>
      <PillNav currentPage={nav.page} onNavigate={navigate} apiBase={apiBase} />
      <div className="main">
        <DashboardPage active={isActive('dashboard')} />
        <InboxPage active={isActive('inbox')} visit={visitOf('inbox')} />
        <DrivePage active={isActive('drive')} />
        <NotifyPage active={isActive('notify')} />
        <BeaconPage active={isActive('beacon')} />
        <GeoPage active={isActive('geo')} visit={visitOf('geo')} />
        <LogicPage active={isActive('logic')} />
        <SettingsPage active={isActive('settings')} />
      </div>
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <SessionProvider>
          <Shell />
        </SessionProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}
