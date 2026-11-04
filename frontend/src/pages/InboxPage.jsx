import { useEffect, useState } from 'react';
import Page from '../components/common/Page.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import NotificationCard from '../components/common/NotificationCard.jsx';
import { useSession, useSessionActions } from '../context/SessionContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const TABS = [
  { key: 'p', label: 'Pending',   list: 'pending',   empty: 'Queue empty',           sub: 'Send a notification or run Drive Sim' },
  { key: 'd', label: 'Delivered', list: 'delivered', empty: 'No delivered messages', sub: 'Messages appear after delivery' },
  { key: 'b', label: 'Bypassed',  list: 'bypassed',  empty: 'No bypassed messages',  sub: 'OTP / critical messages appear here' },
];

/** `visit` changes every time the user navigates to this page (null when hidden). */
export default function InboxPage({ active, visit }) {
  const session = useSession();
  const { loadMessages, clearInbox } = useSessionActions();
  const { userId } = useSettings();
  const toast = useToast();
  const [tab, setTab] = useState('p');

  // Original behaviour: opening the Inbox pulls the latest messages from the backend.
  useEffect(() => {
    if (visit != null) loadMessages();
  }, [visit, loadMessages]);

  const current = TABS.find(t => t.key === tab);
  const list = session[current.list];

  const handleClear = () => {
    clearInbox();
    toast('Inbox cleared');
  };

  return (
    <Page id="inbox" active={active} title="Inbox" sub="All notifications routed through the pipeline">
      <div className="tab-row">
        {TABS.map(t => (
          <div
            key={t.key}
            className={`tab${t.key === tab ? ' active' : ''}`}
            id={`tab-${t.key}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span className="tc-n" id={`tcc-${t.key}`}>{session[t.list].length}</span>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginBottom: '16px' }}>
        <button className="btn btn-s" onClick={loadMessages}>↻ Refresh</button>
        <button className="btn btn-d" style={{ marginLeft: 'auto' }} onClick={handleClear}>⌫ Clear</button>
      </div>
      <div className="qlist" id="inbox-c">
        {list.length
          ? [...list].reverse().map(m => <NotificationCard key={m._uid} message={m} fallbackUserId={userId} />)
          : <EmptyState icon="◎" title={current.empty} sub={current.sub} />}
      </div>
    </Page>
  );
}
