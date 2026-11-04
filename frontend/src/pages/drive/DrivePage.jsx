import Page from '../../components/common/Page.jsx';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import { DRIVE_TRACKS, TRACK_OPTIONS } from '../../constants/driveTracks.js';
import { useDriveSimulator } from '../../hooks/useDriveSimulator.js';
import { driveStatusMessage, getSeg } from '../../utils/route.js';
import DriveMap from './DriveMap.jsx';
import DriveStats from './DriveStats.jsx';
import EventLog from './EventLog.jsx';
import NotificationStream from './NotificationStream.jsx';
import QueuePanels from './QueuePanels.jsx';
import SignalStrip from './SignalStrip.jsx';

const TRACK_SELECT_STYLE = {
  height: '28px', background: 'var(--s2)', border: '1px solid var(--border2)', borderRadius: '6px',
  color: 'var(--text)', fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", padding: '0 8px',
  outline: 'none', cursor: 'pointer',
};

export default function DrivePage({ active }) {
  const { sim, logs, packets, rain, speed, toggle, reset, setTrack, setSpeed, clearLog } = useDriveSimulator();

  const track = DRIVE_TRACKS[sim.trackKey];
  const seg = getSeg(track.route, sim.prog);

  return (
    <Page id="drive" active={active} title="Drive Simulator" sub="Real-time geo-deferred notification demo along a simulated Bangalore route">
      <DriveStats stats={sim.stats} zoneName={seg.name} />

      <div className="uber-map-area">
        <div>
          <div className="route-panel">
            <div className="route-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <span id="route-label" style={{ fontSize: '13px', fontWeight: 600 }}>{`Route · ${track.label}`}</span>
                <select id="drive-track" value={sim.trackKey} onChange={e => setTrack(e.target.value)} style={TRACK_SELECT_STYLE}>
                  {TRACK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <SignalStrip score={sim.sig} />
            </div>
            <DriveMap track={track} sim={sim} seg={seg} packets={packets} />
          </div>

          <div className="drive-status mono" id="dr-msg">{sim.finishedMsg ?? driveStatusMessage(seg)}</div>

          <NotificationStream items={rain} />

          <div className="drive-controls">
            <button className="btn btn-p" id="dr-btn" onClick={toggle} style={{ minWidth: '130px' }}>
              {sim.buttonLabel}
            </button>
            <button className="btn btn-s" onClick={() => reset()}>↺ Reset</button>
            <div className="speed-wrap">
              Speed
              <input type="range" min="1" max="5" value={speed} id="dr-spd" onChange={e => setSpeed(e.target.value)} />
              <span id="spd-lbl">{`${speed}×`}</span>
            </div>
          </div>

          <SectionHeader title="Event Log">
            <button className="btn btn-s" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={clearLog}>clear</button>
          </SectionHeader>
          <EventLog entries={logs} />
        </div>

        <QueuePanels sim={sim} />
      </div>
    </Page>
  );
}
