import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import L from 'leaflet';
import Page from '../../components/common/Page.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import { FLY_TO_ZOOM, MAP_CENTER, MAP_ZOOM, SEED_ZONES, TILE_URL } from '../../constants/geo.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { mergeGeoZones, normalizeGeoZone, readLocalGeoZones, upsertLocalGeoZone } from '../../utils/geoZones.js';
import QuietHoursModal from './QuietHoursModal.jsx';
import ZoneCard from './ZoneCard.jsx';
import ZonePicker from './ZonePicker.jsx';
import { createZoneLayers } from './zoneLayers.js';

const POPUP_FADE_MS = 300; // > Leaflet's 200ms popup fade-out

const LEGEND_BOX = {
  marginTop: '14px', padding: '14px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
};

function ZoneTypeLegend() {
  return (
    <div style={LEGEND_BOX}>
      <div className="section-label">Zone Types</div>
      <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
        <div style={{ marginBottom: '8px' }}><span className="zbadge za">always_deliver</span><div style={{ marginTop: '4px' }}>Flush queue immediately on entry.</div></div>
        <div style={{ marginBottom: '8px' }}><span className="zbadge zd">defer</span><div style={{ marginTop: '4px' }}>Hold all messages until zone exits.</div></div>
        <div><span className="zbadge zc">critical_only</span><div style={{ marginTop: '4px' }}>OTP / security messages only.</div></div>
      </div>
    </div>
  );
}

/** `visit` changes every time the user navigates to this page (null when hidden). */
export default function GeoPage({ active, visit }) {
  const { api, getUserId } = useSettings();
  const toast = useToast();

  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const loadSeqRef = useRef(0);

  const [zones, setZones] = useState(null); // null = still loading
  // "Add Zone" forms rendered (via portals) into Leaflet popups: { id, lat, lng, popup, container }.
  const [pickers, setPickers] = useState([]);
  const [editingKey, setEditingKey] = useState(null);

  /** Merge seed + API + locally saved zones (latest request wins). */
  const loadZones = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    let apiZones = [];
    try {
      const res = await api.get(`/api/geo/${getUserId()}`);
      apiZones = res.profiles || [];
    } catch {
      console.warn('loadGeoToMap API failed; using local zones');
    }
    if (seq !== loadSeqRef.current) return;
    setZones(mergeGeoZones(SEED_ZONES, apiZones, readLocalGeoZones()));
  }, [api, getUserId]);

  const openZonePicker = useCallback((lat, lng) => {
    const map = mapRef.current;
    const container = document.createElement('div');
    const popup = L.popup({ maxWidth: 280, className: 'geo-popup' });
    // Render the form synchronously so Leaflet can measure it when the popup opens.
    flushSync(() => setPickers(list => [...list, { id: L.stamp(popup), lat, lng, popup, container }]));
    popup.setLatLng([lat, lng]).setContent(container).openOn(map);
  }, []);

  // Keep a closed popup's form mounted until Leaflet has finished fading the popup
  // out (it removes the DOM after 200ms). Unmounting immediately would (a) blank
  // the popup mid-fade and (b) detach the clicked button while the click is still
  // bubbling, so Leaflet would treat it as a map click and open a new picker.
  const handlePopupClose = useCallback(e => {
    const { popup } = e;
    setTimeout(() => setPickers(list => list.filter(p => p.popup !== popup)), POPUP_FADE_MS);
  }, []);

  // Create the map lazily the first time the page is shown (it needs a visible
  // container to size itself); afterwards just re-measure and reload zones.
  useEffect(() => {
    if (visit == null) return;
    if (!mapRef.current) {
      const map = L.map(mapElRef.current, {
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
        zoomControl: true,
        attributionControl: false,
      });
      L.tileLayer(TILE_URL, { maxZoom: 19 }).addTo(map);
      map.on('click', e => openZonePicker(e.latlng.lat, e.latlng.lng));
      map.on('popupclose', handlePopupClose);
      mapRef.current = map;
    } else {
      mapRef.current.invalidateSize();
    }
    loadZones();
  }, [visit, loadZones, openZonePicker, handlePopupClose]);

  // Redraw circles + markers whenever the zone list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !zones) return;
    const layers = zones.flatMap(createZoneLayers);
    layers.forEach(l => l.addTo(map));
    return () => layers.forEach(l => map.removeLayer(l));
  }, [zones]);

  // Tear the map down on unmount. Declared after the layer effect so its
  // cleanup runs last (React runs unmount cleanups in declaration order).
  useEffect(() => () => {
    mapRef.current?.remove();
    mapRef.current = null;
  }, []);

  const flyTo = useCallback(z => {
    mapRef.current?.flyTo([z.lat, z.lng], FLY_TO_ZOOM);
  }, []);

  const submitZone = async (lat, lng, zone_type, form) => {
    const label = form.label.trim() || 'custom';
    const radius = parseInt(form.radius) || 200;
    const { start, end } = form;

    mapRef.current.closePopup();

    const payload = { user_id: getUserId(), label, lat, lng, radius_meters: radius, zone_type };
    if (start && end) {
      payload.deferral_times = [{ start, end, reason: `${label} quiet hours` }];
    }

    try {
      await api.post('/api/geo/create', payload);
      toast(`Zone "${label}" added${start ? ' with quiet hours' : ''}`);
    } catch {
      toast('Could not save zone (check backend)');
    }

    // Keep the UI stable even when the backend is slow/offline.
    upsertLocalGeoZone({ label, lat, lng, radius_meters: radius, zone_type, deferral_times: payload.deferral_times });
    await loadZones();
  };

  const editQuietHours = key => {
    if (!zones?.some(z => z._key === key)) { toast('Zone not found'); return; }
    setEditingKey(key);
  };

  const saveQuietHours = async (start, end) => {
    if (!start || !end) { toast('Please set both start and end times'); return; }

    const selected = zones?.find(z => z._key === editingKey);
    if (!selected) {
      toast('Zone not found');
      setEditingKey(null);
      return;
    }

    const updated = { ...selected, deferral_times: [{ start, end, reason: `${selected.label} quiet hours` }] };
    upsertLocalGeoZone(updated);
    try {
      await api.post('/api/geo/quiet-hours', {
        user_id: getUserId(),
        label: updated.label,
        lat: updated.lat,
        lng: updated.lng,
        radius_meters: updated.radius_meters,
        zone_type: updated.zone_type,
        deferral_times: updated.deferral_times,
      });
    } catch {
      console.warn('quiet hours saved locally only');
    }

    toast(`Quiet hours updated for ${selected.label || 'zone'}`);
    setEditingKey(null);
    setZones(list => list.map(z => (z._key === updated._key ? normalizeGeoZone(updated) : z)));
  };

  const editingZone = editingKey && zones?.find(z => z._key === editingKey);

  return (
    <Page id="geo" active={active} title="Geo Zones" sub="Click anywhere on the map to pin a location and assign a zone type">
      <div className="geo-layout">
        <div id="geo-map" ref={mapElRef}></div>
        <div>
          <SectionHeader title="Active Zones" style={{ marginBottom: '12px' }} />
          <div className="geo-zone-list" id="geo-cards">
            {zones === null && <EmptyState icon="📍" title="Loading zones..." />}
            {zones !== null && zones.length === 0 && (
              <EmptyState icon="📍" title="No zones yet" sub="Click on the map to add one" />
            )}
            {zones?.map(z => (
              <ZoneCard key={z._key} zone={z} onFlyTo={flyTo} onEditQuietHours={editQuietHours} />
            ))}
          </div>
          <ZoneTypeLegend />
        </div>
      </div>

      {pickers.map(p => createPortal(
        <ZonePicker
          lat={p.lat}
          lng={p.lng}
          onSubmit={(type, form) => submitZone(p.lat, p.lng, type, form)}
        />,
        p.container,
        p.id
      ))}

      {editingZone && (
        <QuietHoursModal
          key={editingZone._key}
          zone={editingZone}
          onCancel={() => setEditingKey(null)}
          onSave={saveQuietHours}
        />
      )}
    </Page>
  );
}
