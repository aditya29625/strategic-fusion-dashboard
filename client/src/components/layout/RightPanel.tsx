import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Clock, AlertTriangle, Globe2, Users, Satellite,
  ChevronRight, Download, FileText, ZoomIn, Tag, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { useIntelStore, useUIStore } from '../../store';
import type { IntelligenceNode } from '../../types';

const typeIcon: Record<string, React.ElementType> = {
  OSINT: Globe2, HUMINT: Users, IMINT: Satellite,
};
const typeColor: Record<string, string> = {
  OSINT: '#00aaff', HUMINT: '#00e878', IMINT: '#ff3355',
};
const threatClass: Record<string, string> = {
  Critical: 'threat-critical', High: 'threat-high', Medium: 'threat-medium', Low: 'threat-low',
};

function NodeDetail({ node }: { node: IntelligenceNode }) {
  const color = typeColor[node.type] || '#00aaff';
  const TypeIcon = typeIcon[node.type] || Shield;
  const formattedTime = (() => {
    try { return format(new Date(node.timestamp), 'dd MMM yyyy · HH:mm UTC'); }
    catch { return node.timestamp; }
  })();

  function exportPdf() {
    // Simple text export (jsPDF would be imported for full PDF)
    const content = `
INTELLIGENCE REPORT
═══════════════════════════════════
Node ID: ${node.nodeId}
Type: ${node.type}
Threat: ${node.threatLevel}
Title: ${node.title}
Time: ${formattedTime}
Coordinates: ${node.latitude}, ${node.longitude}
Source: ${node.source}
Description: ${node.description}
Tags: ${node.tags?.join(', ') || 'N/A'}
═══════════════════════════════════
GENERATED: ${new Date().toISOString()}
    `.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${node.nodeId}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a2a40]" style={{ background: `${color}10` }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
            <TypeIcon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest" style={{ color }}>{node.type}</div>
            <div className="font-mono text-[10px] text-[#6b8aaa]">{node.nodeId}</div>
          </div>
          <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border ${threatClass[node.threatLevel]}`}>
            {node.threatLevel}
          </span>
        </div>
        <h2 className="text-sm font-semibold text-[#c8d8f0] leading-tight">{node.title}</h2>
      </div>

      {/* Image */}
      {node.imageUrl && (
        <div className="relative border-b border-[#1a2a40]">
          <img
            src={node.imageUrl.startsWith('/') ? `http://localhost:3001${node.imageUrl}` : node.imageUrl}
            alt={node.title}
            className="w-full h-44 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/60 to-transparent" />
        </div>
      )}

      {/* Meta grid */}
      <div className="px-4 py-3 space-y-2 border-b border-[#1a2a40]">
        <MetaRow icon={Clock} label="Timestamp" value={formattedTime} />
        <MetaRow icon={MapPin} label="Coordinates" value={`${node.latitude.toFixed(5)}, ${node.longitude.toFixed(5)}`} />
        <MetaRow icon={AlertTriangle} label="Source" value={node.source} />
      </div>

      {/* Description */}
      <div className="px-4 py-3 border-b border-[#1a2a40]">
        <p className="text-[10px] font-mono text-[#6b8aaa] tracking-widest mb-2">DESCRIPTION</p>
        <p className="text-xs text-[#c8d8f0] leading-relaxed">{node.description}</p>
      </div>

      {/* Tags */}
      {node.tags && node.tags.length > 0 && (
        <div className="px-4 py-3 border-b border-[#1a2a40]">
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="w-3 h-3 text-[#6b8aaa]" />
            <span className="text-[10px] font-mono text-[#6b8aaa] tracking-widest">TAGS</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {node.tags.map(t => (
              <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1a2a40] text-[#6b8aaa] border border-[#1e3050]">
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <div className="px-4 py-3">
        <button
          onClick={exportPdf}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest transition-all hover:opacity-80"
          style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}
        >
          <Download className="w-3.5 h-3.5" />
          EXPORT REPORT
        </button>
      </div>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3 h-3 text-[#6b8aaa] mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-[9px] font-mono text-[#6b8aaa] tracking-widest">{label.toUpperCase()}</div>
        <div className="text-xs font-mono text-[#c8d8f0]">{value}</div>
      </div>
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function Timeline() {
  const { nodes } = useIntelStore();
  const sorted = [...nodes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 12);

  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-mono text-[#6b8aaa] tracking-widest mb-3">RECENT EVENTS</p>
      <div className="relative pl-4 space-y-0">
        {sorted.map((node, i) => {
          const color = typeColor[node.type] || '#00aaff';
          const time = (() => {
            try { return format(new Date(node.timestamp), 'HH:mm'); } catch { return ''; }
          })();
          return (
            <div key={node.nodeId} className="relative flex gap-3 pb-3">
              {/* Line */}
              {i < sorted.length - 1 && (
                <div className="absolute left-0 top-3 bottom-0 w-px bg-[#1a2a40]" />
              )}
              {/* Dot */}
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 -ml-1 z-10" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#c8d8f0] truncate leading-tight">{node.title}</div>
                <div className="text-[10px] font-mono text-[#6b8aaa] mt-0.5">
                  <span style={{ color }}>{node.type}</span> · {time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main right panel ─────────────────────────────────────────────────────────
export default function RightPanel() {
  const { rightPanelOpen, setRightPanel } = useUIStore();
  const { selectedNode, setSelectedNode } = useIntelStore();

  return (
    <AnimatePresence>
      {rightPanelOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 w-72 flex flex-col border-l border-[#1a2a40] bg-[#080c14]/97 z-30 overflow-hidden"
          style={{ backdropFilter: 'blur(16px)' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a2a40] bg-[#0e1623]/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-[#00aaff]" />
              <span className="font-mono text-xs text-[#c8d8f0] tracking-widest">
                {selectedNode ? 'INTEL REPORT' : 'TIMELINE'}
              </span>
            </div>
            <button
              onClick={() => { setRightPanel(false); setSelectedNode(null); }}
              className="p-1.5 rounded-lg text-[#6b8aaa] hover:text-white hover:bg-[#1a2a40] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto sidebar-scroll">
            {selectedNode ? (
              <>
                <NodeDetail node={selectedNode} />
                <div className="px-4 pt-0 pb-3">
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="w-full text-center text-[10px] font-mono text-[#6b8aaa] hover:text-[#c8d8f0] py-2 border border-[#1a2a40] rounded-lg transition-colors"
                  >
                    ← BACK TO TIMELINE
                  </button>
                </div>
                <div className="border-t border-[#1a2a40]">
                  <Timeline />
                </div>
              </>
            ) : (
              <Timeline />
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
