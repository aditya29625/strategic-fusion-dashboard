import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import TopNav from '../components/layout/TopNav';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightPanel from '../components/layout/RightPanel';
import MapView from '../components/map/MapView';
import MapControls from '../components/map/MapControls';
import { useIntelStore, useUIStore } from '../store';
import { api } from '../services/api';
import type { IntelligenceNode } from '../types';

// ── Live-feed notification toast ─────────────────────────────────────────────
function LiveToast({ node, onDismiss }: { node: IntelligenceNode; onDismiss: () => void }) {
  const color = node.type === 'OSINT' ? '#00aaff' : node.type === 'HUMINT' ? '#00e878' : '#ff3355';
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      className="glass rounded-xl border overflow-hidden cursor-pointer hover:opacity-90 shadow-xl max-w-xs"
      style={{ borderColor: `${color}40` }}
      onClick={onDismiss}
    >
      <div className="h-0.5 w-full" style={{ background: color }} />
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
          <span className="text-[10px] font-mono tracking-widest" style={{ color }}>
            LIVE FEED · {node.type}
          </span>
        </div>
        <p className="text-xs text-[#c8d8f0] font-medium leading-tight">{node.title}</p>
        <p className="text-[10px] font-mono text-[#6b8aaa] mt-0.5">{node.threatLevel} Threat · {node.nodeId}</p>
      </div>
    </motion.div>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#080c14]">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-[#00aaff]/20 animate-radar" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[#00aaff] animate-spin" />
        </div>
      </div>
      <div className="font-mono text-xs text-[#6b8aaa] tracking-widest animate-pulse">
        LOADING INTELLIGENCE FEEDS...
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { setNodes, setLoading, isLoading, addToLiveFeed, addNode } = useIntelStore();
  const { leftSidebarOpen, notificationCount: notifCount, setNotifications: setNotifs } = useUIStore();

  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState<IntelligenceNode | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // ── Fetch intelligence on mount, then every 30s ───────────────────────────
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await api.getAll();
        setNodes(res.data.data);
      } catch {
        // Server offline — use mock data that the store already has from the server seed
        // The store starts empty so we show a warning but still render
        console.warn('API unavailable — try running the server');
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, []);

  // ── Socket.IO for real-time events ────────────────────────────────────────
  useEffect(() => {
    const socket: Socket = io('http://localhost:3001', { transports: ['websocket', 'polling'] });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on('intelligence:new', (node: IntelligenceNode) => {
      addNode(node);
      addToLiveFeed({ nodeId: node.nodeId, type: node.type, title: node.title, timestamp: node.timestamp, threatLevel: node.threatLevel });
      setToast(node);
      setNotifs(notifCount + 1);
    });

    return () => { socket.disconnect(); };
  }, []);

  if (initialLoad) return <LoadingScreen />;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#080c14]">
      {/* Top navigation */}
      <TopNav connected={connected} />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left sidebar */}
        <LeftSidebar />

        {/* Map area with overlays */}
        <div className="flex-1 relative overflow-hidden">
          <MapView />
          <MapControls />

          {/* Live toast notification */}
          {toast && (
            <div className="absolute top-4 right-4 z-40">
              <LiveToast node={toast} onDismiss={() => setToast(null)} />
            </div>
          )}

          {/* Loading overlay for refreshes */}
          {isLoading && !initialLoad && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 glass rounded-full px-4 py-1.5 border border-[#1a2a40] flex items-center gap-2">
              <Loader2 className="w-3 h-3 text-[#00aaff] animate-spin" />
              <span className="text-[10px] font-mono text-[#6b8aaa]">REFRESHING...</span>
            </div>
          )}

          {/* Scan line animation (aesthetic) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute left-0 right-0 h-px opacity-20"
              style={{
                background: 'linear-gradient(90deg, transparent, #00aaff, transparent)',
                animation: 'scan-line 8s linear infinite',
              }}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="relative">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
