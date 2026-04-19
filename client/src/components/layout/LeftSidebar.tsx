import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, Globe2, Users, Satellite, ChevronDown, ChevronUp,
  Upload, FileSpreadsheet, FileJson, Image, Layers, Calendar,
  BarChart2, AlertCircle, X, Loader2, CheckCircle2
} from 'lucide-react';
import { useIntelStore, useUIStore } from '../../store';
import { api } from '../../services/api';
import type { IntelType, ThreatLevel, IntelligenceNode } from '../../types';

const TYPE_CONFIG = [
  { type: 'OSINT' as IntelType, color: '#00aaff', icon: Globe2, label: 'OSINT' },
  { type: 'HUMINT' as IntelType, color: '#00e878', icon: Users, label: 'HUMINT' },
  { type: 'IMINT' as IntelType, color: '#ff3355', icon: Satellite, label: 'IMINT' },
];
const THREATS: ThreatLevel[] = ['Critical', 'High', 'Medium', 'Low'];
const THREAT_COLORS: Record<ThreatLevel, string> = {
  Critical: '#ff1744', High: '#ff6d00', Medium: '#ffd600', Low: '#00e676'
};

// ── Collapsible section helper ────────────────────────────────────────────────
function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#1a2a40]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-mono text-[#6b8aaa] hover:text-[#c8d8f0] transition-colors tracking-widest"
      >
        <span>{title}</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── HUMINT uploader ─────────────────────────────────────────────────────────
function HumintUploader() {
  const { addNode, setNodes, nodes } = useIntelStore();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setStatus('uploading');
    setMsg('');
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let res;
      if (ext === 'csv') res = await api.uploadCsv(file);
      else if (ext === 'json') res = await api.uploadJson(file);
      else res = await api.uploadXlsx(file);

      if (res.data.success) {
        res.data.data.forEach((n: IntelligenceNode) => addNode(n));
        setStatus('done');
        setMsg(`${res.data.count} nodes added`);
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (e: any) {
      setStatus('error');
      setMsg(e?.response?.data?.error || 'Upload failed');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }, [addNode]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/json': ['.json'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    maxFiles: 1,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
          isDragActive ? 'dropzone-active' : isDragReject ? 'dropzone-reject' : 'border-[#1a2a40] hover:border-[#00e878]/50'
        }`}
      >
        <input {...getInputProps()} />
        <FileSpreadsheet className="w-6 h-6 text-[#00e878] mx-auto mb-2" />
        <p className="text-xs text-[#6b8aaa]">Drop CSV / Excel / JSON</p>
        <p className="text-[10px] font-mono text-[#1e3050] mt-1">or click to select</p>
      </div>
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 flex items-center gap-2 p-2 rounded-lg text-xs font-mono ${
            status === 'done' ? 'bg-[#00e878]/10 text-[#00e878] border border-[#00e878]/30' :
            status === 'error' ? 'bg-[#ff3355]/10 text-[#ff3355] border border-[#ff3355]/30' :
            'bg-[#00aaff]/10 text-[#00aaff] border border-[#00aaff]/30'
          }`}
        >
          {status === 'uploading' && <Loader2 className="w-3 h-3 animate-spin" />}
          {status === 'done' && <CheckCircle2 className="w-3 h-3" />}
          {status === 'error' && <AlertCircle className="w-3 h-3" />}
          {status === 'uploading' ? 'Processing...' : msg}
        </motion.div>
      )}
    </div>
  );
}

// ── IMINT uploader ─────────────────────────────────────────────────────────
function ImintUploader() {
  const { addNode } = useIntelStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [coords, setCoords] = useState({ lat: '28.6139', lng: '77.2090', title: '', desc: '', threat: 'Medium' });
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const onDrop = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
  });

  async function handleSubmit() {
    if (!file) return;
    setStatus('uploading');
    try {
      const res = await api.uploadImage(file, {
        latitude: coords.lat,
        longitude: coords.lng,
        title: coords.title || 'IMINT Image',
        description: coords.desc || 'Uploaded imagery intelligence',
        threatLevel: coords.threat,
      });
      if (res.data.success) {
        addNode(res.data.data as IntelligenceNode);
        setStatus('done');
        setMsg('IMINT marker added to map');
        setTimeout(() => { setStatus('idle'); setPreview(null); setFile(null); }, 3000);
      }
    } catch {
      setStatus('error');
      setMsg('Upload failed');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <div className="space-y-2">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
            isDragActive ? 'dropzone-active' : 'border-[#1a2a40] hover:border-[#ff3355]/50'
          }`}
        >
          <input {...getInputProps()} />
          <Image className="w-6 h-6 text-[#ff3355] mx-auto mb-2" />
          <p className="text-xs text-[#6b8aaa]">Drop JPG/JPEG/PNG image</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden border border-[#1a2a40]">
            <img src={preview} alt="Preview" className="w-full h-24 object-cover" />
            <button
              onClick={() => { setPreview(null); setFile(null); }}
              className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <input value={coords.lat} onChange={e => setCoords({...coords, lat: e.target.value})}
              placeholder="Latitude" className="rounded px-2 py-1.5 text-xs font-mono border border-[#1a2a40] bg-[#0a1828] text-[#c8d8f0]" />
            <input value={coords.lng} onChange={e => setCoords({...coords, lng: e.target.value})}
              placeholder="Longitude" className="rounded px-2 py-1.5 text-xs font-mono border border-[#1a2a40] bg-[#0a1828] text-[#c8d8f0]" />
          </div>
          <input value={coords.title} onChange={e => setCoords({...coords, title: e.target.value})}
            placeholder="Title (optional)" className="w-full rounded px-2 py-1.5 text-xs border border-[#1a2a40] bg-[#0a1828] text-[#c8d8f0]" />
          <select
            value={coords.threat}
            onChange={e => setCoords({...coords, threat: e.target.value})}
            className="w-full rounded px-2 py-1.5 text-xs font-mono border border-[#1a2a40] bg-[#0a1828] text-[#c8d8f0]"
          >
            {THREATS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            onClick={handleSubmit}
            disabled={status === 'uploading'}
            className="w-full py-2 rounded-lg text-xs font-mono font-bold tracking-widest flex items-center justify-center gap-2 transition-all"
            style={{ background: 'rgba(255,51,85,0.2)', border: '1px solid rgba(255,51,85,0.4)', color: '#ff3355' }}
          >
            {status === 'uploading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {status === 'uploading' ? 'UPLOADING...' : 'ADD TO MAP'}
          </button>
          {(status === 'done' || status === 'error') && (
            <p className={`text-xs font-mono text-center ${status === 'done' ? 'text-[#00e878]' : 'text-[#ff3355]'}`}>{msg}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
export default function LeftSidebar() {
  const { filters, setFilters, nodes, filteredNodes } = useIntelStore();
  const { showHeatmap, toggleHeatmap, showClusters, toggleClusters } = useUIStore();

  function toggleType(t: IntelType) {
    const cur = filters.types;
    const next = cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t];
    setFilters({ types: next });
  }

  function toggleThreat(t: ThreatLevel) {
    const cur = filters.threatLevels;
    const next = cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t];
    setFilters({ threatLevels: next });
  }

  const counts = {
    OSINT: nodes.filter(n => n.type === 'OSINT').length,
    HUMINT: nodes.filter(n => n.type === 'HUMINT').length,
    IMINT: nodes.filter(n => n.type === 'IMINT').length,
  };

  return (
    <aside className="w-64 h-full flex flex-col border-r border-[#1a2a40] bg-[#080c14]/95 overflow-hidden">
      {/* Stats row */}
      <div className="px-4 py-3 border-b border-[#1a2a40] bg-[#0e1623]/50">
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart2 className="w-3.5 h-3.5 text-[#00aaff]" />
          <span className="font-mono text-xs text-[#6b8aaa] tracking-widest">INTEL SUMMARY</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {TYPE_CONFIG.map(({ type, color, label }) => (
            <div key={type} className="rounded-lg p-2 text-center" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
              <div className="font-mono font-bold text-base" style={{ color }}>{counts[type]}</div>
              <div className="text-[9px] font-mono tracking-widest" style={{ color: `${color}99` }}>{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-[10px] font-mono text-[#6b8aaa]">
          {filteredNodes.length} / {nodes.length} SHOWN
        </div>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">

        {/* Type filters */}
        <Section title="── SOURCE TYPE ──" defaultOpen>
          <div className="space-y-2">
            {TYPE_CONFIG.map(({ type, color, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                style={{
                  background: filters.types.includes(type) ? `${color}18` : 'transparent',
                  border: `1px solid ${filters.types.includes(type) ? `${color}50` : '#1a2a40'}`,
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: filters.types.includes(type) ? color : '#6b8aaa' }} />
                <span className="text-xs font-mono flex-1 text-left" style={{ color: filters.types.includes(type) ? color : '#6b8aaa' }}>
                  {label}
                </span>
                <span className="text-[10px] font-mono font-bold" style={{ color }}>
                  {counts[type]}
                </span>
              </button>
            ))}
            <button
              onClick={() => setFilters({ types: filters.types.length < 3 ? ['OSINT','HUMINT','IMINT'] : [] })}
              className="text-[10px] font-mono text-[#6b8aaa] hover:text-[#00aaff] transition-colors w-full text-center pt-1"
            >
              {filters.types.length < 3 ? 'Show All' : 'Hide All'}
            </button>
          </div>
        </Section>

        {/* Threat filters */}
        <Section title="── THREAT LEVEL ──" defaultOpen>
          <div className="space-y-1.5">
            {THREATS.map((t) => (
              <button
                key={t}
                onClick={() => toggleThreat(t)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left"
                style={{
                  background: filters.threatLevels.includes(t) ? `${THREAT_COLORS[t]}12` : 'transparent',
                  border: `1px solid ${filters.threatLevels.includes(t) ? `${THREAT_COLORS[t]}40` : '#1a2a40'}`,
                }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: THREAT_COLORS[t] }} />
                <span className="text-xs font-mono flex-1" style={{ color: filters.threatLevels.includes(t) ? THREAT_COLORS[t] : '#6b8aaa' }}>
                  {t}
                </span>
                <span className="text-[10px] font-mono" style={{ color: THREAT_COLORS[t] }}>
                  {nodes.filter(n => n.threatLevel === t).length}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* Date range */}
        <Section title="── DATE RANGE ──" defaultOpen={false}>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-mono text-[#6b8aaa] block mb-1">FROM</label>
              <input type="datetime-local" value={filters.dateFrom}
                onChange={e => setFilters({ dateFrom: e.target.value })}
                className="w-full rounded px-2 py-1.5 text-xs font-mono border border-[#1a2a40] bg-[#0a1828] text-[#c8d8f0]" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-[#6b8aaa] block mb-1">TO</label>
              <input type="datetime-local" value={filters.dateTo}
                onChange={e => setFilters({ dateTo: e.target.value })}
                className="w-full rounded px-2 py-1.5 text-xs font-mono border border-[#1a2a40] bg-[#0a1828] text-[#c8d8f0]" />
            </div>
            {(filters.dateFrom || filters.dateTo) && (
              <button onClick={() => setFilters({ dateFrom: '', dateTo: '' })}
                className="text-[10px] font-mono text-[#ff3355] hover:text-[#ff6680] w-full text-center">
                Clear dates
              </button>
            )}
          </div>
        </Section>

        {/* Map layers */}
        <Section title="── MAP LAYERS ──" defaultOpen={false}>
          <div className="space-y-2">
            <button
              onClick={toggleHeatmap}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all"
              style={{
                background: showHeatmap ? 'rgba(255,214,0,0.1)' : 'transparent',
                border: `1px solid ${showHeatmap ? 'rgba(255,214,0,0.4)' : '#1a2a40'}`,
                color: showHeatmap ? '#ffd600' : '#6b8aaa',
              }}
            >
              <Layers className="w-3.5 h-3.5" />
              Heatmap Layer
            </button>
            <button
              onClick={toggleClusters}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all"
              style={{
                background: showClusters ? 'rgba(0,170,255,0.1)' : 'transparent',
                border: `1px solid ${showClusters ? 'rgba(0,170,255,0.4)' : '#1a2a40'}`,
                color: showClusters ? '#00aaff' : '#6b8aaa',
              }}
            >
              <Filter className="w-3.5 h-3.5" />
              Cluster Markers
            </button>
          </div>
        </Section>

        {/* HUMINT upload */}
        <Section title="── HUMINT UPLOAD ──" defaultOpen={false}>
          <HumintUploader />
        </Section>

        {/* IMINT upload */}
        <Section title="── IMINT UPLOAD ──" defaultOpen={false}>
          <ImintUploader />
        </Section>
      </div>
    </aside>
  );
}
