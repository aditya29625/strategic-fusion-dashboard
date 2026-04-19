import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Globe2, Users, Satellite, ChevronRight, Radio } from 'lucide-react';

const features = [
  {
    icon: Globe2,
    color: '#00aaff',
    label: 'OSINT',
    title: 'Open Source Intelligence',
    desc: 'Automated ingestion from MongoDB and AWS S3. Real-time data polling with 30-second refresh cycles.',
  },
  {
    icon: Users,
    color: '#00e878',
    label: 'HUMINT',
    title: 'Human Intelligence',
    desc: 'Drag-and-drop CSV, Excel, and JSON uploads. Instant marker generation from field reports.',
  },
  {
    icon: Satellite,
    color: '#ff3355',
    label: 'IMINT',
    title: 'Imagery Intelligence',
    desc: 'Upload satellite and aerial imagery tied to precise geospatial coordinates on the terrain map.',
  },
];

const RadarSVG = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
    <div className="relative w-[600px] h-[600px] opacity-20">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[#00aaff]/30"
          style={{
            inset: `${(i - 1) * 25}%`,
          }}
        />
      ))}
      {/* Sweep arm */}
      <div
        className="absolute inset-0 rounded-full animate-radar"
        style={{
          background: 'conic-gradient(from 0deg, transparent 270deg, rgba(0,170,255,0.4) 360deg)',
        }}
      />
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00aaff]" />
    </div>
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const d = setInterval(() => setDots((p) => (p + 1) % 4), 400);
    return () => { clearInterval(t); clearInterval(d); };
  }, []);

  return (
    <div className="relative w-full h-full bg-[#080c14] overflow-auto">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#00aaff 1px, transparent 1px), linear-gradient(90deg, #00aaff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <RadarSVG />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#00aaff]/40" />
      <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#00aaff]/40" />
      <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#00aaff]/40" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#00aaff]/40" />

      {/* Top status bar */}
      <div className="relative z-10 flex items-center justify-between px-8 py-3 border-b border-[#1a2a40]/60">
        <div className="flex items-center gap-4">
          <Radio className="w-4 h-4 text-[#00e878]" />
          <span className="text-[#00e878] font-mono text-xs tracking-widest">
            SYSTEM ONLINE{'.'.repeat(dots)}
          </span>
        </div>
        <div className="font-mono text-xs text-[#6b8aaa] tracking-widest">
          {time.toUTCString().toUpperCase()}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00e878] animate-pulse" />
          <span className="font-mono text-xs text-[#00e878] tracking-widest">SECURE CHANNEL</span>
        </div>
      </div>

      {/* Hero section */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-16 pb-8 px-8">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-[#00aaff]/10 border-2 border-[#00aaff]/50 flex items-center justify-center glow-blue">
            <Shield className="w-12 h-12 text-[#00aaff]" />
          </div>
          <div className="absolute inset-0 rounded-full border border-[#00aaff]/20 animate-ping" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-4"
        >
          <div className="font-mono text-xs text-[#00aaff] tracking-[0.4em] mb-3 uppercase">
            ── CLASSIFIED SYSTEM ──
          </div>
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight mb-2"
            style={{
              fontFamily: 'Orbitron, monospace',
              background: 'linear-gradient(135deg, #ffffff 0%, #00aaff 60%, #00e878 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            STRATEGIC
          </h1>
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight"
            style={{
              fontFamily: 'Orbitron, monospace',
              background: 'linear-gradient(135deg, #00aaff 0%, #c8d8f0 60%, #00e878 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FUSION
          </h1>
          <div
            className="text-3xl md:text-4xl font-light tracking-[0.25em] mt-1"
            style={{ fontFamily: 'Orbitron, monospace', color: '#6b8aaa' }}
          >
            DASHBOARD
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[#6b8aaa] max-w-2xl text-base leading-relaxed mb-10"
        >
          Multi-source intelligence fusion platform integrating OSINT, HUMINT, and IMINT into a unified 
          geospatial operations view. Real-time threat analysis at your fingertips.
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/login')}
          className="group relative flex items-center gap-3 px-10 py-4 rounded-lg font-mono font-bold tracking-widest text-sm uppercase overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0066cc, #004499)', border: '1px solid rgba(0,170,255,0.5)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          <Shield className="w-5 h-5 text-[#00aaff]" />
          <span className="text-white">Authenticate & Enter</span>
          <ChevronRight className="w-4 h-4 text-[#00aaff] group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <p className="mt-4 text-[#1e3050] text-xs font-mono">
          UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE
        </p>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto px-8 pb-16">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="glass rounded-xl p-6 border border-[#1a2a40] hover:border-opacity-80 transition-all group cursor-default"
            style={{ ['--glow' as string]: f.color }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-all group-hover:scale-110"
              style={{ background: `${f.color}18`, border: `1px solid ${f.color}40` }}
            >
              <f.icon className="w-5 h-5" style={{ color: f.color }} />
            </div>
            <div
              className="text-xs font-mono tracking-widest mb-1"
              style={{ color: f.color }}
            >
              {f.label}
            </div>
            <h3 className="text-white font-semibold mb-2">{f.title}</h3>
            <p className="text-[#6b8aaa] text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
