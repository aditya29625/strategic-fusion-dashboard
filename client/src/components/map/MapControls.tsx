import React from 'react';
import { Layers, Grid3x3, Satellite, Map as MapIcon, ChevronRight } from 'lucide-react';
import { useUIStore, useIntelStore } from '../../store';

export default function MapControls() {
  const { showHeatmap, toggleHeatmap, showClusters, toggleClusters, setRightPanel, rightPanelOpen } = useUIStore();
  const { filteredNodes } = useIntelStore();

  const btns = [
    { label: 'CLUSTERS', active: showClusters, onClick: toggleClusters, icon: Grid3x3.name },
    { label: 'HEATMAP', active: showHeatmap, onClick: toggleHeatmap, icon: Layers.name },
  ];

  return (
    <>
      {/* Bottom-center controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-3 border border-[#1a2a40]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00e878] animate-pulse" />
            <span className="font-mono text-xs text-[#6b8aaa]">
              {filteredNodes.length} NODES ACTIVE
            </span>
          </div>
          <div className="w-px h-4 bg-[#1a2a40]" />
          <button
            onClick={() => toggleHeatmap()}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              showHeatmap ? 'bg-[#ffd600]/15 text-[#ffd600] border border-[#ffd600]/30' : 'text-[#6b8aaa] hover:text-[#c8d8f0]'
            }`}
          >
            <Layers className="w-3 h-3" />HEATMAP
          </button>
          <button
            onClick={() => toggleClusters()}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              showClusters ? 'bg-[#00aaff]/15 text-[#00aaff] border border-[#00aaff]/30' : 'text-[#6b8aaa] hover:text-[#c8d8f0]'
            }`}
          >
            <Grid3x3 className="w-3 h-3" />CLUSTER
          </button>
        </div>
      </div>

      {/* Right panel toggle (floating button when panel is closed) */}
      {!rightPanelOpen && (
        <button
          onClick={() => setRightPanel(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 glass border border-[#1a2a40] rounded-l-xl p-2 flex items-center gap-1 text-[#6b8aaa] hover:text-[#00aaff] hover:border-[#00aaff]/40 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-20 glass rounded-xl px-3 py-2.5 border border-[#1a2a40]">
        <div className="text-[9px] font-mono text-[#6b8aaa] tracking-widest mb-2">LEGEND</div>
        {[
          { color: '#00aaff', label: 'OSINT' },
          { color: '#00e878', label: 'HUMINT' },
          { color: '#ff3355', label: 'IMINT' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            <span className="text-[10px] font-mono" style={{ color }}>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
