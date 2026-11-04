// Local fallback classifiers (used only if the backend returns nothing).

export function guessCategory(content) {
  const t = content.toLowerCase();
  if (/otp|\b\d{4,6}\b/.test(t))                       return 'otp';
  if (/debit|credit|payment|transaction/.test(t))       return 'transactional';
  if (/offer|sale|discount|win|free|click/.test(t))     return 'marketing';
  if (/login|security|alert|breach|server|cpu/.test(t)) return 'alert';
  return 'social';
}

export function guessPriority(content) {
  const t = content.toLowerCase();
  if (/otp|\b\d{4,6}\b|security|breach|emergency|server/.test(t)) return 'critical';
  if (/debit|credit|payment|meeting|taxi/.test(t))                  return 'high';
  if (/offer|sale|discount|free|win/.test(t))                       return 'low';
  return 'normal';
}
