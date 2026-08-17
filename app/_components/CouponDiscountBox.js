'use client';

import { useState, useCallback } from 'react';
import { Copy, CheckCheck, Zap, Tag, Clock } from 'lucide-react';

export default function CouponDiscountBox({
  code    = 'GRID10',
  discount = '10% OFF',
  label    = 'EXCLUSIVE COUPON',
  expiry   = null,
  onCopy   = null,
}) {
  const [copied, setCopied] = useState(false);
  const [ripple, setRipple] = useState(false);

  const handleCopy = useCallback(async () => {
    if (copied) return; 
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setRipple(true);
      onCopy?.(code);
      setTimeout(() => setRipple(false), 600);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }, [code, copied, onCopy]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Copy coupon code ${code}`}
      onClick={handleCopy}
      onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
      className="relative cursor-pointer select-none w-full max-w-sm group focus:outline-none"
    >
      {}
      {ripple && (
        <span className="absolute inset-0 rounded-xl animate-ping bg-[#00D2C4]/20 pointer-events-none z-0" />
      )}

      {}
      <div
        className="relative z-10 rounded-xl overflow-hidden"
        style={{
          background: '#0F172A',
          border: '2px dashed #00D2C4',
          boxShadow: copied
            ? '0 0 0 3px #00D2C440, 0 0 32px #00D2C420'
            : '0 0 0 1px #00D2C420, 0 0 20px #00D2C410',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ background: 'linear-gradient(90deg, #00D2C415, #00D2C408)' }}
        >
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#00D2C4]" fill="#00D2C4" />
            <span className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#00D2C4]">
              {label}
            </span>
          </div>

          {expiry && (
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              <span className="text-[9px] font-medium">{expiry}</span>
            </div>
          )}
        </div>

        {}
        <div className="relative flex items-center px-0">
          <div
            className="absolute -left-3 h-6 w-6 rounded-full z-20"
            style={{ background: '#0B192C', border: '2px dashed #00D2C4' }}
          />
          <div
            className="flex-1 border-t mx-3"
            style={{ borderColor: '#00D2C430', borderStyle: 'dashed' }}
          />
          <div
            className="absolute -right-3 h-6 w-6 rounded-full z-20"
            style={{ background: '#0B192C', border: '2px dashed #00D2C4' }}
          />
        </div>

        {}
        <div className="px-5 pt-4 pb-5 space-y-4">

          {}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className="text-2xl font-black leading-none tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #00D2C4, #22d3ee, #00D2C4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 8px #00D2C460)',
                }}
              >
                🔥 EXTRA {discount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                ACTIVE · Use at checkout
              </p>
            </div>

            <div
              className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: '#00D2C415', border: '1px solid #00D2C430' }}
            >
              <Tag className="w-4 h-4 text-[#00D2C4]" />
            </div>
          </div>

          {}
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2.5 gap-3"
            style={{ background: '#1E293B', border: '1px solid #334155' }}
          >
            <span
              className="font-mono text-base font-extrabold tracking-[0.22em] text-white"
              style={{ textShadow: '0 0 12px #00D2C450' }}
            >
              {code}
            </span>

            <button
              type="button"
              aria-label={copied ? 'Copied!' : 'Copy code'}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-bold transition-all duration-300"
              style={
                copied
                  ? { background: '#00D2C420', border: '1px solid #00D2C4', color: '#00D2C4' }
                  : { background: '#0F172A', border: '1px solid #475569', color: '#94A3B8' }
              }
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 group-hover:text-[#00D2C4] transition-colors" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {}
          <p
            className="text-center text-[10px] font-bold tracking-wide uppercase transition-all duration-300"
            style={{ color: copied ? '#00D2C4' : '#475569' }}
          >
            {copied
              ? '✓ Copied & Activated! Use at checkout →'
              : 'Click anywhere to copy code'}
          </p>
        </div>
      </div>
    </div>
  );
}
