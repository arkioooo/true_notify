import { useState } from 'react';
import Page from '../components/common/Page.jsx';
import PriorityTag from '../components/common/PriorityTag.jsx';
import { PRESETS, PRESET_BUTTONS } from '../constants/presets.js';
import { useSessionActions } from '../context/SessionContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { guessCategory, guessPriority } from '../utils/classify.js';
import { nowTime } from '../utils/time.js';

const SMALL_TAG = { fontSize: '9px' };
const MONO_DIM = { fontSize: '12px', color: 'var(--dim)', fontFamily: "'JetBrains Mono',monospace" };

function AnalysisPanel({ analysis }) {
  const { data, content } = analysis ?? {};
  const p   = analysis && (data.priority || guessPriority(content));
  const cat = analysis && (data.category || guessCategory(content));

  return (
    <>
      <div id="ana-empty" style={{ ...MONO_DIM, display: analysis ? 'none' : undefined }}>
        send a message to see analysis
      </div>
      <div id="ana-prev" style={{ display: analysis ? 'block' : 'none' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }} id="ana-tags">
          {analysis && (
            <>
              <PriorityTag priority={p} />
              <span className="ctag">{cat}</span>
              {data.should_bypass_deferral && <PriorityTag priority="critical" style={SMALL_TAG}>⚡ bypass</PriorityTag>}
              {data.is_spam && <PriorityTag priority="critical" style={SMALL_TAG}>🚫 spam</PriorityTag>}
            </>
          )}
        </div>
        <div className="rbox" id="ana-det">
          {analysis &&
`is_spam:      ${data.is_spam ?? false}
confidence:   ${data.confidence ?? '—'}
priority:     ${p}
category:     ${cat}
summary:      ${data.summary || '—'}
bypass:       ${data.should_bypass_deferral ?? false}`}
        </div>
      </div>
    </>
  );
}

export default function NotifyPage({ active }) {
  const { api } = useSettings();
  const actions = useSessionActions();
  const toast = useToast();

  const [recipient, setRecipient] = useState('user_123');
  const [sender, setSender] = useState('app_xyz');
  const [content, setContent] = useState('Hey, are we still on for dinner tonight?');
  const [result, setResult] = useState({ text: 'waiting...', cls: '' });
  const [analysis, setAnalysis] = useState(null);

  const applyPreset = key => {
    setContent(PRESETS[key].content);
    setSender(PRESETS[key].sender);
  };

  /** Route the backend's decision into session state (original `procResp`). */
  const processResponse = (data, text, rid) => {
    const ts  = nowTime();
    const cat = data.category || guessCategory(text);
    const pri = data.priority || guessPriority(text);
    let cls;

    if (data.status === 'dropped_spam') {
      cls = 'err';
      actions.spamDropped({ content: text, cat, pri: 'low', status: 'pending', ts, userId: rid, summary: 'spam blocked' });
      toast('🚫 Spam dropped');
    } else if (data.status === 'sent_immediately') {
      cls = 'ok';
      actions.bypassed({ content: text, cat, pri: 'critical', status: 'bypassed', bypass: true, ts, userId: rid, summary: data.summary });
      toast('⚡ Sent immediately');
    } else {
      cls = 'info';
      actions.queued({ content: text, cat, pri, status: 'pending', ts, userId: rid, summary: data.summary });
      toast('📥 Queued');
    }

    setResult({ text: JSON.stringify(data, null, 2), cls });
    setAnalysis({ data, content: text });
  };

  const send = async () => {
    const rid = recipient;
    const text = content;
    if (!text.trim()) { toast('Enter a message first'); return; }

    setResult({ text: 'Sending…', cls: '' });
    try {
      const res = await api.post('/api/notify/', { recipient_id: rid, content: text });
      setResult({ text: JSON.stringify(res, null, 2), cls: '' });
      processResponse(res, text, rid);
    } catch (e) {
      setResult({ text: 'Error: ' + e.message, cls: 'err' });
      toast('Backend error');
    }
  };

  return (
    <Page id="notify" active={active} title="Send Notification" sub="POST /api/notify — test the ingestion pipeline">
      <div className="tc">
        <div className="panel">
          <div className="section-label">Presets</div>
          <div className="presets" style={{ marginBottom: '18px' }}>
            {PRESET_BUTTONS.map(p => (
              <button key={p.key} className="pbtn" onClick={() => applyPreset(p.key)}>{p.label}</button>
            ))}
          </div>
          <div className="field">
            <label>Recipient ID</label>
            <input type="text" id="n-rcpt" value={recipient} onChange={e => setRecipient(e.target.value)} />
          </div>
          <div className="field">
            <label>Sender</label>
            <input type="text" id="n-sender" value={sender} onChange={e => setSender(e.target.value)} />
          </div>
          <div className="field">
            <label>Content</label>
            <textarea id="n-content" value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <button className="btn btn-p" onClick={send} style={{ width: '100%' }}>Send to Pipeline</button>
        </div>
        <div className="panel">
          <div className="section-label">Response</div>
          <div id="n-result" className={`rbox${result.cls ? ' ' + result.cls : ''}`} style={{ marginBottom: '18px' }}>
            {result.text}
          </div>
          <div className="section-label">AI Analysis</div>
          <AnalysisPanel analysis={analysis} />
        </div>
      </div>
    </Page>
  );
}
