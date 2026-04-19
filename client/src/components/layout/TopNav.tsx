import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, RefreshCw, Bell, Sun, Moon, X, Wifi, WifiOff } from 'lucide-react';
import { useIntelStore, useUIStore } from '../../store';
import { api } from '../../services/api';
import type { IntelligenceNode } from '../../types';

interface Props {
  connected: boolean;
}

export default function TopNav({ connected }: Props) {
  const { setFilters, filters, setNodes, setLoading } = useIntelStore();
  const { isDark, toggleTheme, notificationCount, setNotifications } = useUIStore();
  const [showNotif, setShowNotif] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { liveFeed } = useIntelStore();

  async function handleRefresh() {
    setRefreshing(true);
    setLoading(true);
    try {
      const res = await api.getAll();
      setNodes(res.data.data);
    } catch {/* silent */}
    setRefreshing(false);
    setLoading(false);
    setNotifications(0);
  }

  return (
    <header
      className="relative z-50 flex items-center gap-3 px-4 py-2.5 border-b border-[#1a2a40]"
      style={{ background: 'rgba(8,12,20,0.95)', backdropFilter: 'blur(16px)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2 flex-shrink-0">
        <div className="w-8 h-8 rounded bg-[#00aaff]/10 border border-[#00aaff]/40 flex items-center justify-center">
          <Shield className="w-4 h-4 text-[#00aaff]" />
        </div>
        <div>
          <div
            className="text-sm font-black tracking-widest leading-none text-white"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            FUSION
          </div>
          <div className="text-[9px] font-mono tracking-[0.2em] text-[#6b8aaa] leading-none">
            STRATEGIC DASHBOARD
          </div>
        </div>
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-[#1a2a40] bg-[#0e1623]">
        {connected ? (
          <><Wifi className="w-3 h-3 text-[#00e878]" /><span className="text-[10px] font-mono text-[#00e878]">LIVE</span></>
        ) : (
          <><WifiOff className="w-3 h-3 text-[#ff3355]" /><span className="text-[10px] font-mono text-[#ff3355]">OFFLINE</span></>
        )}
      </div>

      {/* Search bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b8aaa]" />
        <input
          type="text"
          placeholder="Search intelligence nodes, IDs, coordinates..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="w-full rounded-lg pl-9 pr-4 py-1.5 text-xs font-mono bg-[#0e1623] border border-[#1a2a40] text-[#c8d8f0] placeholder-[#6b8aaa]"
        />
        {filters.search && (
          <button
            onClick={() => setFilters({ search: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b8aaa] hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          title="Refresh intelligence feed"
          className="p-2 rounded-lg text-[#6b8aaa] hover:text-[#00aaff] hover:bg-[#00aaff]/10 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className="p-2 rounded-lg text-[#6b8aaa] hover:text-[#ffd700] hover:bg-[#ffd700]/10 transition-all"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setNotifications(0); }}
            className="relative p-2 rounded-lg text-[#6b8aaa] hover:text-[#c8d8f0] hover:bg-[#1a2a40] transition-all"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#ff3355] text-white text-[9px] font-bold flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-72 glass rounded-xl border border-[#1a2a40] shadow-2xl z-50 overflow-hidden"
              >
                <div className="px-4 py-2.5 border-b border-[#1a2a40] flex items-center justify-between">
                  <span className="font-mono text-xs text-[#00aaff] tracking-widest">LIVE FEED</span>
                  <button onClick={() => setShowNotif(false)}>
                    <X className="w-3 h-3 text-[#6b8aaa]" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {liveFeed.length === 0 ? (
                    <p className="p-4 text-xs text-[#6b8aaa] font-mono text-center">No recent activity</p>
                  ) : (
                    liveFeed.slice(0, 10).map((entry, i) => (
                      <div key={i} className="px-4 py-2.5 border-b border-[#1a2a40]/50 hover:bg-[#0e1623]">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{
                            background: entry.type === 'OSINT' ? '#00aaff' : entry.type === 'HUMINT' ? '#00e878' : '#ff3355'
                          }} />
                          <span className="text-xs text-[#c8d8f0] font-medium truncate">{entry.title}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#6b8aaa]">
                          {entry.type} · {entry.threatLevel}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Analyst badge */}
        <div className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1623] border border-[#1a2a40]">
          <div className="w-6 h-6 rounded-full bg-[#00aaff]/20 border border-[#00aaff]/50 flex items-center justify-center">
            <Shield className="w-3 h-3 text-[#00aaff]" />
          </div>
          <span className="text-xs font-mono text-[#c8d8f0] hidden md:block">ANALYST</span>
        </div>
      </div>
    </header>
  );
}
