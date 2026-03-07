'use client';

import { useEffect, useRef, useState } from 'react';
import { TYPE_COLORS, PROVIDERS } from '@/lib/data';

interface OrbitMapProps {
  coords: { lat: number; lon: number; region: string };
  compProviders: string[];
}

// Loaded lazily to avoid SSR issues with Leaflet
export default function OrbitMap({ coords, compProviders }: OrbitMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const circleLayerRef = useRef<unknown>(null);
  const markerLayerRef = useRef<unknown>(null);
  const [circlesVisible, setCirclesVisible] = useState(true);
  const [markersVisible, setMarkersVisible] = useState(true);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR
    import('leaflet').then((L) => {
      if (!mapRef.current) return;
      // Clean up previous instance
      if (leafletMapRef.current) {
        (leafletMapRef.current as { remove: () => void }).remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapRef.current, { zoomControl: true }).setView([coords.lat, coords.lon], 10);
      leafletMapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Home marker
      const homeIcon = L.divIcon({
        className: '',
        html: '<div class="map-home-pin"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([coords.lat, coords.lon], { icon: homeIcon })
        .addTo(map)
        .bindPopup(`<div class="map-popup"><strong>Your Location</strong><span class="map-popup-type">${coords.region}</span></div>`);

      const markerLayer = L.layerGroup();
      const circleLayer = L.layerGroup();
      markerLayerRef.current = markerLayer;
      circleLayerRef.current = circleLayer;

      const bounds: [number, number][] = [[coords.lat, coords.lon]];
      const typeRadiusKm: Record<string, number> = { fiber: 20, cable: 15, '5g': 8, dsl: 40, geo: 500, satellite: 0 };

      compProviders.forEach((key, i) => {
        const p = PROVIDERS[key];
        const color = TYPE_COLORS[p.type] || '#fff';
        const angle = (i / compProviders.length) * 2 * Math.PI;
        const lat = coords.lat + Math.sin(angle) * 0.04;
        const lon = coords.lon + Math.cos(angle) * 0.06;

        const icon = L.divIcon({
          className: '',
          html: `<div class="map-pin" style="--pin-color:${color}"><span class="map-pin-abbr">${p.abbr}</span></div>`,
          iconSize: [36, 44],
          iconAnchor: [18, 44],
        });

        L.marker([lat, lon], { icon })
          .bindPopup(`
            <div class="map-popup">
              <strong>${p.name}</strong>
              <span class="map-popup-type" style="color:${color}">${p.type.toUpperCase()}</span>
              <hr>
              ${p.speedLabel}<br>
              ${p.latencyLabel} latency<br>
              $${p.price}/mo &nbsp;·&nbsp; ${p.reliability}% reliability
            </div>
          `)
          .addTo(markerLayer);

        bounds.push([lat, lon]);

        const r = typeRadiusKm[p.type] ?? 15;
        if (r > 0 && r < 200) {
          L.circle([lat, lon], {
            radius: r * 1000,
            color, fillColor: color,
            fillOpacity: 0.04, opacity: 0.25,
            weight: 1.5, dashArray: '4 4',
          }).addTo(circleLayer);
        }
      });

      markerLayer.addTo(map);
      circleLayer.addTo(map);
      map.fitBounds(bounds, { padding: [40, 40] });
    });

    return () => {
      if (leafletMapRef.current) {
        (leafletMapRef.current as { remove: () => void }).remove();
        leafletMapRef.current = null;
      }
    };
  }, [coords, compProviders]);

  function toggleLayer(type: 'circles' | 'markers') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = leafletMapRef.current as any;
    if (!map) return;
    if (type === 'circles') {
      const layer = circleLayerRef.current as any;
      if (circlesVisible) map.removeLayer(layer); else map.addLayer(layer);
      setCirclesVisible(v => !v);
    } else {
      const layer = markerLayerRef.current as any;
      if (markersVisible) map.removeLayer(layer); else map.addLayer(layer);
      setMarkersVisible(v => !v);
    }
  }

  return (
    <>
      <div className="map-controls">
        <button
          className={`map-toggle${circlesVisible ? ' active' : ''}`}
          onClick={() => toggleLayer('circles')}
        >
          Coverage Circles
        </button>
        <button
          className={`map-toggle${markersVisible ? ' active' : ''}`}
          onClick={() => toggleLayer('markers')}
        >
          Markers
        </button>
      </div>
      <div id="map" ref={mapRef} />
      <p className="map-hint">Drag to pan &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Pinch to zoom on mobile</p>
    </>
  );
}
