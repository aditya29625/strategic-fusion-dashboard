import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, User, AlertTriangle, Fingerprint } from 'lucide-react';

const DEMO_CREDS = { username: 'analyst', password: 'fusion2026' };

export default function LoginPage() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<string[]>([]);

  const bootLines = [
    '> Initializing secure channel...',
    '> Loading geospatial engine...',
    '> Connecting to intelligence feeds...',
    '> Validating analyst credentials...',
    '> ACCESS GRANTED — WELCOME, ANALYST',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (creds.username !== DEMO_CREDS.username || creds.password !== DEMO_CREDS.password) {
      setError('AUTHENTICATION FAILED — INVALID CREDENTIALS');
      return;
    }

    setLoading(true);
    setLines([]);
    setProgress(0);

    for (let i = 0; i < bootLines.length; i++) {
      await new Promise((r) => setTimeout(r, 500));
      setLines((prev) => [...prev, bootLines[i]]);
      setProgress(((i + 1) / bootLines.length) * 100);
    }

    await new Promise((r) => setTimeout(r, 400));
    navigate('/dashboard');
  };

  return (
    <div className="w-full h-full bg-[#080c14] flex items-center justify-center relative overflow-hidden">
      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#00aaff 1px, transparent 1px), linear-gradient(90deg, #00aaff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Scan line effect */}
      {loading && (
        <div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00aaff]/60 to-transparent animate-scan pointer-events-none z-50"
          style={{ top: '0' }}
        />
      )}

      {/* Corner brackets */}
      {['top-4 left-4 border-t-2 border-l-2', 'top-4 right-4 border-t-2 border-r-2',
        'bottom-4 left-4 border-b-2 border-l-2', 'bottom-4 right-4 border-b-2 border-r-2'].map((cls, i) => (
        <div key={i} className={`absolute w-16 h-16 border-[#00aaff]/40 ${cls}`} />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="glass rounded-2xl border border-[#1a2a40] overflow-hidden">
          {/* Header bar */}
          <div className="px-6 py-3 bg-[#0a1828] border-b border-[#1a2a40] flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff3355]/60" />
              <div className="w-3 h-3 rounded-full bg-[#ffd700]/60" />
              <div className="w-3 h-3 rounded-full bg-[#00e878]/60" />
            </div>
            <span className="font-mono text-xs text-[#6b8aaa] ml-2 tracking-widest">
              SECURE AUTH TERMINAL v4.2.1
            </span>
          </div>

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#00aaff]/10 border-2 border-[#00aaff]/50 flex items-center justify-center mb-4 glow-blue">
                <Shield className="w-8 h-8 text-[#00aaff]" />
              </div>
              <div
                className="text-2xl font-black tracking-widest text-white"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                FUSION
              </div>
              <div className="text-xs font-mono text-[#6b8aaa] tracking-[0.3em] mt-1">
                ANALYST AUTHENTICATION
              </div>
            </div>

            {/* Boot terminal (only when logging in) */}
            {loading ? (
              <div className="font-mono text-xs space-y-1 mb-6">
                {lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={i === lines.length - 1 ? 'text-[#00e878]' : 'text-[#6b8aaa]'}
                  >
                    {line}
                  </motion.div>
                ))}
                <div className="mt-3 h-1 bg-[#1a2a40] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#00aaff] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#6b8aaa] tracking-widest uppercase">
                    Analyst ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8aaa]" />
                    <input
                      type="text"
                      value={creds.username}
                      onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                      placeholder="analyst"
                      className="w-full rounded-lg pl-10 pr-4 py-3 font-mono text-sm bg-[#0a1828] border border-[#1a2a40] text-[#c8d8f0]"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#6b8aaa] tracking-widest uppercase">
                    Access Code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8aaa]" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={creds.password}
                      onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full rounded-lg pl-10 pr-12 py-3 font-mono text-sm bg-[#0a1828] border border-[#1a2a40] text-[#c8d8f0]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8aaa] hover:text-[#c8d8f0] transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-[#ff3355]/10 border border-[#ff3355]/30"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#ff3355] flex-shrink-0" />
                    <span className="font-mono text-xs text-[#ff3355]">{error}</span>
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg font-mono font-bold text-sm tracking-widest text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #0055aa, #003377)', border: '1px solid rgba(0,170,255,0.4)' }}
                >
                  <Fingerprint className="w-5 h-5 text-[#00aaff]" />
                  AUTHENTICATE
                </motion.button>

                {/* Demo credentials */}
                <div className="p-3 rounded-lg bg-[#0a1828] border border-[#1a2a40] text-center">
                  <p className="font-mono text-xs text-[#6b8aaa] mb-1">DEMO CREDENTIALS</p>
                  <p className="font-mono text-xs text-[#c8d8f0]">
                    <span className="text-[#00aaff]">analyst</span> / <span className="text-[#00e878]">fusion2026</span>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="text-center font-mono text-[10px] text-[#1e3050] mt-4 tracking-widest">
          ALL ACTIVITY IS LOGGED AND MONITORED • RESTRICTED ACCESS
        </p>
      </motion.div>
    </div>
  );
}
