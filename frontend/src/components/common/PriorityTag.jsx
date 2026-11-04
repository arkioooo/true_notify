import { PCLS } from '../../constants/lookups.js';

/** `.ptag` coloured by priority; pass `children` to override the label. */
export default function PriorityTag({ priority, style, children }) {
  return (
    <span className={`ptag ${PCLS[priority] || 'p-l'}`} style={style}>
      {children ?? priority}
    </span>
  );
}
