/** Locale time string, e.g. "10:42:07 PM" — used for message timestamps. */
export const nowTime = () => new Date().toLocaleTimeString();

/** HH:MM — used in the drive event log. */
export function logTime() {
  const now = new Date();
  return [now.getHours(), now.getMinutes()].map(n => String(n).padStart(2, '0')).join(':');
}
