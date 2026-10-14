import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const KARACHI = [24.8607, 67.0011];

const pinIcon = L.divIcon({
  className: "",
  html: '<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#95271d;border:3px solid #fff8f3;box-shadow:0 4px 10px rgba(96,36,30,.4)"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

/** Free OpenStreetMap map. Click anywhere to drop the pin. Loaded lazily, only when someone opens it. */
export default function MapPin({ value, onPick }) {
  const el = useRef(null);
  const state = useRef({ map: null, marker: null });

  useEffect(() => {
    const hasPin = value && (value.lat || value.lng);
    const center = hasPin ? [value.lat, value.lng] : KARACHI;
    const map = L.map(el.current, { scrollWheelZoom: false }).setView(center, hasPin ? 16 : 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    if (hasPin) state.current.marker = L.marker(center, { icon: pinIcon }).addTo(map);
    map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      if (state.current.marker) state.current.marker.setLatLng(event.latlng);
      else state.current.marker = L.marker(event.latlng, { icon: pinIcon }).addTo(map);
      onPick({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
    });
    state.current.map = map;
    return () => {
      map.remove();
      state.current = { map: null, marker: null };
    };
    // The map is created once; later clicks report through onPick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={el} className="h-64 w-full overflow-hidden rounded-2xl border border-line" role="application" aria-label="Map. Click to drop a pin on the place." />;
}
