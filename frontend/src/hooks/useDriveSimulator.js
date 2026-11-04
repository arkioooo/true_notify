import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_TRACK, DRIVE_TRACKS } from '../constants/driveTracks.js';
import { useSessionActions } from '../context/SessionContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { guessCategory, guessPriority } from '../utils/classify.js';
import { canDeliver, getRoutePosition, getSeg, toPercent } from '../utils/route.js';
import { logTime, nowTime } from '../utils/time.js';

const TICK_MS = 100;
const INJECT_MS = 1100;
const PACKET_MS = 2200;
const RAIN_MS = 3000;
const RAIN_FADE_MS = 500;
const MAX_FX = 12;
const DEFAULT_SPEED = 3;

const createSimState = trackKey => ({
  trackKey,
  running: false,
  prog: 0,
  pQ: [], dQ: [], bQ: [],
  stats: { p: 0, d: 0, b: 0 },
  notifCount: 0,
  notifTarget: 7,
  /** Current signal shown in the strip (reset shows 4G until the first tick). */
  sig: 3,
  /** Waypoints light up only once the car has actually moved since the last reset. */
  hasTicked: false,
  /** Highlight the current route segment (the original clears it on reset until the next tick). */
  showActiveSeg: true,
  finishedMsg: null,
  buttonLabel: '▶ Start Drive',
});

const INITIAL_LOG = [{ id: 0, time: '--:--', text: 'Drive Simulator ready', type: 'info' }];

/**
 * Drive Simulator engine. Mutable simulation state lives in a ref (it is read
 * by interval callbacks and by async requests that resolve later), and every
 * change is mirrored into React state via `commit` for rendering.
 */
export function useDriveSimulator() {
  const { api, getUserId } = useSettings();
  const session = useSessionActions();
  const toast = useToast();

  const simRef = useRef(null);
  if (simRef.current === null) simRef.current = createSimState(DEFAULT_TRACK);

  const [sim, setSim] = useState(simRef.current);
  const [logs, setLogs] = useState(INITIAL_LOG);
  const [packets, setPackets] = useState([]);
  const [rain, setRain] = useState([]);
  const [speed, setSpeedState] = useState(DEFAULT_SPEED);

  const speedRef = useRef(DEFAULT_SPEED);
  const timersRef = useRef({ tick: null, inject: null, timeouts: new Set() });
  const fxOrderRef = useRef([]);
  const seqRef = useRef(0);

  const controls = useMemo(() => {
    const nextId = () => ++seqRef.current;
    const timers = timersRef.current;
    const track = () => DRIVE_TRACKS[simRef.current.trackKey];

    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.timeouts.delete(id); fn(); }, ms);
      timers.timeouts.add(id);
    };

    const commit = patch => {
      simRef.current = { ...simRef.current, ...patch };
      setSim(simRef.current);
    };

    const addLog = (text, type = 'info') =>
      setLogs(l => [...l, { id: nextId(), time: logTime(), text, type }]);

    const clearLog = () => setLogs([]);

    const removeFx = id => {
      setPackets(list => list.filter(p => p.id !== id));
      setRain(list => list.filter(r => r.id !== id));
    };

    /** Floating packet over the car + a chip in the notification stream. */
    const addFx = (m, cls, blocked) => {
      const s = simRef.current;
      const { route, points } = track();
      const pos = getRoutePosition(route, points, s.prog);
      const content = m.content || '';

      const packetId = nextId();
      setPackets(list => [...list, {
        id: packetId,
        cls: cls === 'nri-b' ? 'packet-b' : blocked ? 'packet-p' : 'packet-d',
        text: (blocked ? 'hold · ' : cls === 'nri-b' ? 'bypass · ' : 'send · ') + content.slice(0, 34),
        ...toPercent(pos),
      }]);
      fxOrderRef.current.push(packetId);
      later(() => removeFx(packetId), PACKET_MS);

      const rainId = nextId();
      const left = (Math.random() * 60 + 5) + '%';
      setRain(list => [...list, {
        id: rainId, cls, left, top: null, fading: false,
        text: (blocked ? '⏸ ' : '') + content.slice(0, 36) + '…',
      }]);
      fxOrderRef.current.push(rainId);
      // Drop to a random height on the next frame (animates via the CSS `top` transition).
      requestAnimationFrame(() => {
        const top = (15 + Math.random() * 55) + '%';
        setRain(list => list.map(r => (r.id === rainId ? { ...r, top } : r)));
      });
      later(() => {
        setRain(list => list.map(r => (r.id === rainId ? { ...r, fading: true } : r)));
        later(() => removeFx(rainId), RAIN_FADE_MS);
      }, RAIN_MS);

      if (fxOrderRef.current.length > MAX_FX) removeFx(fxOrderRef.current.shift());
    };

    /** Deliver queued messages once the current segment allows it. */
    const flushQueue = seg => {
      const s = simRef.current;
      if (!canDeliver(seg) || !s.pQ.length) return;

      const isCritical = m => (m.pri || m.priority) === 'critical';
      const criticalOnly = seg.zone === 'critical_only';
      const toFlush = criticalOnly ? s.pQ.filter(isCritical) : [...s.pQ];
      const keep = criticalOnly ? s.pQ.filter(m => !isCritical(m)) : [];
      if (!toFlush.length) return;

      const ts = nowTime();
      const delivered = toFlush.map(m => ({ ...m, status: 'delivered', deliveredAt: ts }));
      commit({
        dQ: [...s.dQ, ...delivered],
        pQ: keep,
        stats: { ...s.stats, d: s.stats.d + delivered.length, p: keep.length },
      });
      session.flushed(delivered);
      addLog(`✓ Flushed ${toFlush.length} at ${seg.name}`, 'ok');
      toast(`✓ ${toFlush.length} delivered at ${seg.name}`);
    };

    const stop = () => {
      clearInterval(timers.tick);
      clearInterval(timers.inject);
      commit({ running: false, buttonLabel: '▶ Resume' });
    };

    const finish = () => {
      const { d, b, p } = simRef.current.stats;
      commit({
        buttonLabel: '▶ Start Drive',
        finishedMsg: `Complete — Delivered:${d}  Bypassed:${b}  Pending:${p}`,
      });
      addLog(`Done · D:${d} B:${b} P:${p}`, 'ok');
      toast('🏁 Drive complete!');
    };

    const tick = () => {
      const s = simRef.current;
      const prog = Math.min(100, s.prog + speedRef.current * 0.35);
      const seg = getSeg(track().route, prog);
      commit({ prog, sig: seg.sig, hasTicked: true, showActiveSeg: true });
      flushQueue(seg);
      if (prog >= 100) { stop(); finish(); }
    };

    /** Generate a message server-side, classify it, and route it by the current segment. */
    const inject = async () => {
      const s = simRef.current;
      if (!s.running) return;
      if (s.notifCount >= s.notifTarget) { clearInterval(timers.inject); return; }
      commit({ notifCount: s.notifCount + 1 });
      const seg = getSeg(track().route, s.prog);

      try {
        const gen = await api.get('/api/generate/');
        const res = await api.post('/api/notify/', { recipient_id: getUserId(), content: gen.content });

        const ts  = nowTime();
        const cat = res.category || guessCategory(gen.content);
        const pri = res.priority || guessPriority(gen.content);
        const msg = {
          content: gen.content, cat, pri,
          priority: pri, category: cat,
          summary: res.summary || '',
          status: 'pending', ts, userId: getUserId(),
          should_bypass_deferral: res.should_bypass_deferral,
        };
        const preview = gen.content.slice(0, 30);

        if (res.status === 'dropped_spam') {
          addLog(`🚫 spam: ${preview}…`, 'warn');
          return;
        }

        const cur = simRef.current; // may have changed while awaiting
        if (res.status === 'sent_immediately') {
          const bMsg = { ...msg, status: 'bypassed', bypass: true, deliveredAt: ts };
          commit({ bQ: [...cur.bQ, bMsg], stats: { ...cur.stats, b: cur.stats.b + 1 } });
          session.bypassed(bMsg);
          addLog(`⚡ bypass: ${preview}…`, 'ok');
          addFx(bMsg, 'nri-b', false);
        } else if (canDeliver(seg)) {
          const dMsg = { ...msg, status: 'delivered', deliveredAt: ts };
          commit({ dQ: [...cur.dQ, dMsg], stats: { ...cur.stats, d: cur.stats.d + 1 } });
          session.deliveredNow(dMsg);
          addLog(`✓ delivered: ${preview}…`, 'ok');
          addFx(dMsg, 'nri-d', false);
        } else {
          const pQ = [...cur.pQ, msg];
          commit({ pQ, stats: { ...cur.stats, p: pQ.length } });
          session.queued({ ...msg }, { deferred: true });
          addLog(`⏸ deferred: ${preview}…`, 'warn');
          addFx(msg, 'nri-p', true);
        }

        // Sync the server queue (non-blocking, errors ignored).
        api.post('/api/beacon/', {
          user_id: getUserId(),
          lat: 13.0827 + Math.random() * 0.01,
          lng: 80.2707 + Math.random() * 0.01,
          connectivity_score: seg.sig,
        }).catch(() => {});
      } catch (e) {
        addLog('❌ ' + e.message, 'err');
      }
    };

    const reset = (announce = true) => {
      stop();
      const { trackKey } = simRef.current;
      commit({ ...createSimState(trackKey), showActiveSeg: false });
      fxOrderRef.current = [];
      setPackets([]);
      setRain([]);
      if (announce) addLog('Drive reset', 'warn');
    };

    const start = () => {
      const s = simRef.current;
      if (s.prog >= 100) { reset(); return; }
      let { notifCount, notifTarget } = s;
      if (s.prog === 0 || notifCount >= notifTarget) {
        notifCount = 0;
        notifTarget = 5 + Math.floor(Math.random() * 5);
      }
      commit({ running: true, notifCount, notifTarget, finishedMsg: null, buttonLabel: '⏸ Pause' });
      addLog(`Drive started · ${track().label} · ${notifTarget} events`, 'ok');

      timers.tick = setInterval(tick, TICK_MS);
      inject();
      timers.inject = setInterval(inject, INJECT_MS);
    };

    const toggle = () => (simRef.current.running ? stop() : start());

    const setTrack = key => {
      if (!DRIVE_TRACKS[key]) return;
      if (simRef.current.running) stop();
      commit({ trackKey: key });
      reset(false);
      commit({ showActiveSeg: true });
      addLog(`Track: ${DRIVE_TRACKS[key].label}`, 'info');
    };

    const setSpeed = value => {
      speedRef.current = parseInt(value) || DEFAULT_SPEED;
      setSpeedState(value);
    };

    return { toggle, reset, setTrack, setSpeed, clearLog };
  }, [api, getUserId, session, toast]);

  // Stop all timers if the component using the simulator unmounts.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      clearInterval(timers.tick);
      clearInterval(timers.inject);
      timers.timeouts.forEach(clearTimeout);
    };
  }, []);

  return { sim, logs, packets, rain, speed, ...controls };
}
