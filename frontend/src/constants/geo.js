// Hardcoded seed zones (shown on the map even without the API).
export const SEED_ZONES = [
  { label: 'home', lat: 13.0827, lng: 80.2707, radius_meters: 200, zone_type: 'always_deliver', deferral_times: [{ start: '06:00', end: '10:00', reason: 'morning quiet hours' }] },
  { label: 'gym',  lat: 13.0800, lng: 80.2600, radius_meters: 150, zone_type: 'critical_only' },
];

export const GEO_LOCAL_KEY = 'truenotify_geo_local_v1';

export const MAP_CENTER = [13.0827, 80.2707];
export const MAP_ZOOM = 14;
export const FLY_TO_ZOOM = 16;
export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
