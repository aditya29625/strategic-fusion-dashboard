import React from 'react';
import type { IntelligenceNode } from '../../types';
import { MapPin, Clock, AlertTriangle, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  node: IntelligenceNode;
  onViewDetails: () => void;
}

const typeColor: Record<string, string> = {
  OSINT: '#00aaff',
  HUMINT: '#00e878',
  IMINT: '#ff3355',
};

const threatClass: Record<string, string> = {
  Critical: 'threat-critical',
  High: 'threat-high',
  Medium: 'threat-medium',
  Low: 'threat-low',
};

export default function MarkerPopup({ node, onViewDetails }: Props) {
  const color = typeColor[node.type] || '#00aaff';
  const formattedTime = (() => {
    try { return format(new Date(node.timestamp), 'dd MMM yyyy, HH:mm'); }
    catch { return node.timestamp; }
  })();

  return (
    <div className="min-w-[280px] max-w-[320px] font-sans" style={{ background: '#080c14' }}>
      {/* Header ribbon */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: `${color}18`, borderBottom: `1px solid ${color}33` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
          <span
            className="text-xs font-mono font-bold tracking-widest uppercase"
            style={{ color }}
          >
            {node.type}
          </span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${threatClass[node.threatLevel]}`}
        >
          {node.threatLevel}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-[#c8d8f0] font-semibold text-sm leading-tight mb-3 pr-4">
          {node.title}
        </h3>

        {/* Image preview */}
        {node.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden border border-[#1a2a40]">
            <img
              src={node.imageUrl.startsWith('/') ? `http://localhost:3001${node.imageUrl}` : node.imageUrl}
              alt={node.title}
              className="w-full h-32 object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Meta */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-[#6b8aaa]">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="font-mono">{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b8aaa]">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="font-mono">
              {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b8aaa]">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            <span className="font-mono">{node.source}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#6b8aaa] leading-relaxed line-clamp-3 mb-3">
          {node.description}
        </p>

        {/* Tags */}
        {node.tags && node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {node.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1a2a40] text-[#6b8aaa]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* View details */}
        <button
          onClick={onViewDetails}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold tracking-widest transition-all hover:opacity-90"
          style={{
            background: `${color}22`,
            border: `1px solid ${color}44`,
            color,
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          VIEW FULL INTELLIGENCE REPORT
        </button>
      </div>

      {/* Node ID footer */}
      <div className="px-4 pb-3 flex justify-between items-center">
        <span className="font-mono text-[10px] text-[#1e3050]">{node.nodeId}</span>
      </div>
    </div>
  );
}
