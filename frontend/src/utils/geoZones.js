import { GEO_LOCAL_KEY } from '../constants/geo.js';

export function zoneKey(z) {
  return [
    String(z.label || 'custom').trim().toLowerCase(),
    Number(z.lat).toFixed(6),
    Number(z.lng).toFixed(6),
  ].join('|');
}

export function normalizeGeoZone(z) {
  const zone = {
    ...z,
    label: String(z.label || 'custom').trim() || 'custom',
    lat: Number(z.lat),
    lng: Number(z.lng),
    radius_meters: Number(z.radius_meters) || 200,
    zone_type: z.zone_type || 'always_deliver',
    deferral_times: Array.isArray(z.deferral_times) ? z.deferral_times : [],
  };
  zone._key = zoneKey(zone);
  return zone;
}

const isValid = z => Number.isFinite(z.lat) && Number.isFinite(z.lng);

export function readLocalGeoZones() {
  try {
    const raw = localStorage.getItem(GEO_LOCAL_KEY);
    return raw ? JSON.parse(raw).map(normalizeGeoZone).filter(isValid) : [];
  } catch {
    return [];
  }
}

function writeLocalGeoZones(zones) {
  // eslint-disable-next-line no-unused-vars
  localStorage.setItem(GEO_LOCAL_KEY, JSON.stringify(zones.map(({ _key, ...z }) => z)));
}

export function upsertLocalGeoZone(zone) {
  const next = normalizeGeoZone(zone);
  const zones = readLocalGeoZones().filter(z => z._key !== next._key);
  zones.push(next);
  writeLocalGeoZones(zones);
}

/** Merge zone lists; later groups win on key collisions. */
export function mergeGeoZones(...groups) {
  const merged = new Map();
  groups.flat().forEach(z => {
    const zone = normalizeGeoZone(z);
    if (isValid(zone)) merged.set(zone._key, zone);
  });
  return [...merged.values()];
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

export const formatWindows = times => times.map(w => `${w.start}-${w.end}`).join(', ');
