export const PRESETS = {
  otp:     { sender: 'bankapp',  content: 'Your OTP is 7394. Valid for 5 minutes. Do not share.' },
  payment: { sender: 'paytm',    content: 'INR 2,500 debited from account ending 4821. Ref: TXN20260418.' },
  social:  { sender: 'twitter',  content: '@devguy liked your post: "Shipped the MVP!"' },
  spam:    { sender: 'promo',    content: 'CONGRATULATIONS! You WON a FREE iPhone! Click here now!' },
  alert:   { sender: 'security', content: 'New login from Chrome on Windows in Mumbai. Secure your account.' },
};

export const PRESET_BUTTONS = [
  { key: 'otp',     label: 'OTP' },
  { key: 'payment', label: 'Payment' },
  { key: 'social',  label: 'Social' },
  { key: 'spam',    label: 'Spam' },
  { key: 'alert',   label: 'Alert' },
];

/** Quiet-hours shortcuts shared by the zone picker popup and the edit modal. */
export const QUIET_PRESETS = [
  { label: '🌅 Morning', start: '06:00', end: '10:00' },
  { label: '🌙 Night',   start: '21:00', end: '08:00' },
  { label: '💼 Work',    start: '09:00', end: '17:00' },
];
