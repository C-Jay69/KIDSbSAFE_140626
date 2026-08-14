import { useEffect, useRef, useState } from "react";

type GpsLocation = {
  childId: string;
  childName: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  recordedAt: string;
};

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).L) return resolve();
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = LEAFLET_CSS;
    document.head.appendChild(css);

    const js = document.createElement("script");
    js.src = LEAFLET_JS;
    js.onload = () => resolve();
    js.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.body.appendChild(js);
  });
}

export default function GpsMap({ locations }: { locations: GpsLocation[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  // Init map once.
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then(() => {
        if (cancelled || !mapEl.current || mapRef.current) return;
        const L = (window as any).L;
        const center = locations[0]
          ? [locations[0].lat, locations[0].lng]
          : [40.7128, -74.006];
        mapRef.current = L.map(mapEl.current).setView(center, 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapRef.current);
        // If no live data, drop a demo pin so the map isn't empty.
        if (locations.length === 0) {
          L.marker(center)
            .addTo(mapRef.current)
            .bindPopup("Demo location — pair a child device to see live GPS.");
        }
      })
      .catch((e) => setError(String(e)));
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when locations change.
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current || locations.length === 0) return;
    const map = mapRef.current;
    let bounds: any[] = [];
    for (const loc of locations) {
      const pos = [loc.lat, loc.lng];
      bounds.push(pos);
      if (markersRef.current[loc.childId]) {
        markersRef.current[loc.childId].setLatLng(pos);
      } else {
        markersRef.current[loc.childId] = L.marker(pos)
          .addTo(map)
          .bindPopup(`<b>${loc.childName}</b><br/>Updated ${new Date(loc.recordedAt).toLocaleString()}`);
      }
    }
    if (bounds.length) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [locations]);

  if (error) {
    return (
      <div className="glass p-6 rounded-2xl text-sm text-[var(--text-muted)]">
        Map unavailable in this environment ({error}). Location data is still listed below.
        <div className="mt-3 space-y-2">
          {locations.map((l) => (
            <div key={l.childId} className="text-white/90">
              {l.childName}: {l.lat.toFixed(4)}, {l.lng.toFixed(4)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-4 rounded-2xl overflow-hidden">
      <div ref={mapEl} className="w-full rounded-xl" style={{ height: 420 }} />
      {locations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
          {locations.map((l) => (
            <div key={l.childId} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-white/90">{l.childName}</span>
              <span>· {new Date(l.recordedAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
