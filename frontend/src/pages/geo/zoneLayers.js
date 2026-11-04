import L from 'leaflet';
import { GEOIC, ZONE_COLORS } from '../../constants/lookups.js';
import { escapeHtml, formatWindows } from '../../utils/geoZones.js';

/** Build the radius circle + emoji marker (with info popup) for one zone. */
export function createZoneLayers(z) {
  const color = ZONE_COLORS[z.zone_type] || '#888';
  const icon = GEOIC[z.label] || GEOIC.default;

  const circle = L.circle([z.lat, z.lng], {
    radius: z.radius_meters,
    color, fillColor: color,
    fillOpacity: 0.15, weight: 2,
  });

  const divIcon = L.divIcon({
    className: '',
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:2px solid #000;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.5);">${icon}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  let popupContent = `<strong>${icon} ${escapeHtml(z.label)}</strong><br/><span style="font-size:11px;color:#999;font-family:monospace;">${escapeHtml(z.zone_type)}</span><br/><span style="font-size:11px;color:#999;">r=${z.radius_meters}m</span>`;
  if (z.deferral_times && z.deferral_times.length > 0) {
    popupContent += `<br/><span style="font-size:10px;color:#f39c12;font-family:monospace;">⏸ Quiet: ${escapeHtml(formatWindows(z.deferral_times))}</span>`;
  }

  const marker = L.marker([z.lat, z.lng], { icon: divIcon }).bindPopup(popupContent);

  return [circle, marker];
}
