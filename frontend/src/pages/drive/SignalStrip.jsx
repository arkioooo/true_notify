import { SIGNAL_LABELS } from '../../constants/lookups.js';

const BAR_CLASSES = ['s0', 's1', 's2', 's3'];

export default function SignalStrip({ score }) {
  return (
    <div className="sig-strip">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`sigb${i <= score ? ' ' + BAR_CLASSES[score] : ''}`} id={`sb${i}`}></div>
      ))}
      <span className="sig-lbl" id="sig-lbl">{SIGNAL_LABELS[score] ?? '4G'}</span>
    </div>
  );
}
