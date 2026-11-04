import Page from '../components/common/Page.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SectionHeader from '../components/common/SectionHeader.jsx';
import NotificationCard from '../components/common/NotificationCard.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

const STAT_CARDS = [
  { id: 's-p',  label: 'Pending',   icon: '⏸', tone: 'amber', key: 'pending',   sub: 'queued in Redis' },
  { id: 's-d',  label: 'Delivered', icon: '✓', tone: 'green', key: 'delivered', sub: 'this session' },
  { id: 's-df', label: 'Deferred',  icon: '◌', tone: 'blue',  key: 'deferred',  sub: 'held for zone' },
  { id: 's-b',  label: 'Bypassed',  icon: '⚡', tone: 'red',   key: 'bypass',    sub: 'OTP / critical' },
];

const EMPTY_COPY = {
  initial: { title: 'No activity yet', sub: 'Send a notification or run the Drive Simulator' },
  reset:   { title: 'No activity',     sub: 'Send a notification to begin' },
};

export default function DashboardPage({ active }) {
  const { stats, activity, activityEmpty } = useSession();
  const { userId } = useSettings();
  const empty = EMPTY_COPY[activityEmpty];

  return (
    <Page id="dashboard" active={active} title="Dashboard" sub="Session overview — geo-deferred notification pipeline">
      <div className="sgrid">
        {STAT_CARDS.map(c => (
          <div className="sc" key={c.id}>
            <div className="sc-top">
              <span className="sc-lbl">{c.label}</span>
              <div className={`sc-icon ${c.tone}`}>{c.icon}</div>
            </div>
            <div className="sc-val" id={c.id}>{stats[c.key]}</div>
            <div className="sc-sub">{c.sub}</div>
          </div>
        ))}
      </div>
      <SectionHeader title="Recent Activity" />
      <div className="qlist" id="dash-act">
        {activity.length
          ? activity.map(m => <NotificationCard key={m._uid} message={m} fallbackUserId={userId} />)
          : <EmptyState icon="◎" title={empty.title} sub={empty.sub} />}
      </div>
    </Page>
  );
}
