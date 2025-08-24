// src/components/RouteMap.jsx
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// SJO (Juan Santamaría Intl) — adjust if needed
const ORIGIN = { lat: 9.998, lng: -84.204, label: "SJO — Juan Santamaría Intl" };
// Casa de las Brisas (approx; replace with exact coords if you have them)
const DEST   = { lat: 9.414, lng: -84.158, label: "Casa de las Brisas" };

export default function RouteMap({ height = 340 }) {
  const el = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map(el.current, { scrollWheelZoom: false, zoomControl: true });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Use circle markers so we don't need Leaflet image assets
    const a = L.circleMarker([ORIGIN.lat, ORIGIN.lng], {
      radius: 6, weight: 2, color: "#12b886", fillColor: "#12b886", fillOpacity: 1
    }).addTo(map).bindTooltip(ORIGIN.label, { permanent: true, offset: [10, -2] });

    const b = L.circleMarker([DEST.lat, DEST.lng], {
      radius: 6, weight: 2, color: "#ff6b6b", fillColor: "#ff6b6b", fillOpacity: 1
    }).addTo(map).bindTooltip(DEST.label, { permanent: true, offset: [10, -2] });

    // Fetch a driving route via public OSRM (no API key)
    fetch(`https://router.project-osrm.org/route/v1/driving/${ORIGIN.lng},${ORIGIN.lat};${DEST.lng},${DEST.lat}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(json => {
        const geom = json?.routes?.[0]?.geometry;
        if (geom) {
          const route = L.geoJSON(geom, { style: { color: "#8b5cf6", weight: 5, opacity: 0.8 } }).addTo(map);
          const group = L.featureGroup([a, b, route]);
          map.fitBounds(group.getBounds().pad(0.2));
        } else {
          const group = L.featureGroup([a, b]);
          map.fitBounds(group.getBounds().pad(0.2));
        }
      })
      .catch(() => {
        const group = L.featureGroup([a, b]);
        map.fitBounds(group.getBounds().pad(0.2));
      });

    return () => map.remove();
  }, []);

  return <div className="route-map" ref={el} style={{ height }} />;
}
