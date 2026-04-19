import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import type { IntelligenceNode, ThreatLevel } from '../../types';
import { useIntelStore, useUIStore } from '../../store';
import { createRoot } from 'react-dom/client';
import MarkerPopup from './MarkerPopup';

// ── Marker SVG builder ────────────────────────────────────────────────────────
const typeColor: Record<string, string> = {
  OSINT: '#00aaff',
  HUMINT: '#00e878',
  IMINT: '#ff3355',
};

const threatPulse: Record<ThreatLevel, boolean> = {
  Low: false,
  Medium: false,
  High: true,
  Critical: true,
};

function buildMarkerIcon(node: IntelligenceNode): L.DivIcon {
  const color = typeColor[node.type] || '#00aaff';
  const pulse = threatPulse[node.threatLevel];
  const size = node.threatLevel === 'Critical' ? 16 : 12;

  const pulseHtml = pulse
    ? `<div style="
        position:absolute;
        inset:-6px;
        border-radius:50%;
        border:2px solid ${color};
        animation:pulse-ring 1.8s ease-out infinite;
        opacity:0.7;
      "></div>`
    : '';

  return L.divIcon({
    className: '',
    iconSize: [size + 12, size + 12],
    iconAnchor: [(size + 12) / 2, (size + 12) / 2],
    popupAnchor: [0, -(size + 12) / 2 - 4],
    html: `
      <div style="position:relative;width:${size + 12}px;height:${size + 12}px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
        ${pulseHtml}
        <div style="
          width:${size}px;height:${size}px;
          border-radius:50%;
          background:${color};
          box-shadow:0 0 10px ${color}, 0 0 20px ${color}55;
          border:2px solid ${color}cc;
          transition:transform 0.2s;
        "></div>
      </div>
    `,
  });
}

// ── Map View ──────────────────────────────────────────────────────────────────
export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  const { filteredNodes, setSelectedNode } = useIntelStore();
  const { showClusters, setRightPanel } = useUIStore();

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [28.6139, 77.209],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark terrain tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Custom zoom control (top-right)
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render markers whenever filteredNodes or cluster toggle changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers/cluster
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
      clusterRef.current = null;
    }
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const cluster = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (c: any) => {
        const count = c.getChildCount();
        return L.divIcon({
          html: `<div style="
            background:rgba(0,170,255,0.15);
            border:1px solid rgba(0,170,255,0.5);
            border-radius:50%;
            width:40px;height:40px;
            display:flex;align-items:center;justify-content:center;
            color:#00aaff;font-family:'JetBrains Mono',monospace;
            font-weight:600;font-size:12px;
          ">${count}</div>`,
          className: '',
          iconSize: [40, 40],
        });
      },
    });

    filteredNodes.forEach((node) => {
      const icon = buildMarkerIcon(node);
      const marker = L.marker([node.latitude, node.longitude], { icon });

      // Popup content div
      const popupDiv = document.createElement('div');
      const popupRoot = createRoot(popupDiv);
      popupRoot.render(
        <MarkerPopup
          node={node}
          onViewDetails={() => {
            setSelectedNode(node);
            setRightPanel(true);
          }}
        />
      );

      const popup = L.popup({
        maxWidth: 320,
        minWidth: 280,
        className: 'intel-popup',
        autoPan: true,
        closeButton: true,
      }).setContent(popupDiv);

      // Open popup on click
      marker.on('click', () => marker.bindPopup(popup).openPopup());

      // Hover to open popup (no click needed)
      marker.on('mouseover', function (this: L.Marker) {
        this.bindPopup(popup).openPopup();
      });

      markersRef.current[node.nodeId] = marker;

      if (showClusters) {
        cluster.addLayer(marker);
      } else {
        marker.addTo(map);
      }
    });

    if (showClusters) {
      map.addLayer(cluster);
      clusterRef.current = cluster;
    }
  }, [filteredNodes, showClusters, setSelectedNode, setRightPanel]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* Map renders into this div */}
    </div>
  );
}
