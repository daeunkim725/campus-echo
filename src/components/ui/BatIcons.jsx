import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Minimalist, cute bat silhouette
export function BatSilhouette({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 18.5C10 18.5 8 16 5.5 13.5C3 11 2 10 2 8.5C2 7 3.5 6 5 6C6.5 6 8.5 7.5 10 9C10.5 7.5 11.5 6 12 6C12.5 6 13.5 7.5 14 9C15.5 7.5 17.5 6 19 6C20.5 6 22 7 22 8.5C22 10 21 11 18.5 13.5C16 16 14 18.5 12 18.5Z" />
      <path d="M9 10C9.5 10 9.8 9.5 9.8 9C9.8 8.5 9.5 8 9 8C8.5 8 8.2 8.5 8.2 9C8.2 9.5 8.5 10 9 10Z" fill="white" />
      <path d="M15 10C15.5 10 15.8 9.5 15.8 9C15.8 8.5 15.5 8 15 8C14.5 8 14.2 8.5 14.2 9C14.2 9.5 14.5 10 15 10Z" fill="white" />
      <path d="M12 11C12 11 12.5 11.5 12 12C11.5 11.5 12 11 12 11Z" fill="white" />
      <path d="M4 11C3 9 4.5 7 5.5 7.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M20 11C21 9 19.5 7 18.5 7.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// 2-frame flapping bat
export function BatFlap({ className = "w-6 h-6", color = "currentColor" }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f === 0 ? 1 : 0));
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={className}>
      {frame === 0 ? (
        <BatSilhouette className="w-full h-full" color={color} />
      ) : (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16.5C10.5 16.5 9 15 7.5 14C6 13 4 15 3 14.5C2 14 2 12 3.5 11C5 10 7.5 10.5 10 9.5C10.5 8 11.5 6.5 12 6.5C12.5 6.5 13.5 8 14 9.5C16.5 10.5 19 10 20.5 11C22 12 22 14 21 14.5C20 15 18 13 16.5 14C15 15 13.5 16.5 12 16.5Z" />
          <path d="M9 10C9.5 10 9.8 9.5 9.8 9C9.8 8.5 9.5 8 9 8C8.5 8 8.2 8.5 8.2 9C8.2 9.5 8.5 10 9 10Z" fill="white" />
          <path d="M15 10C15.5 10 15.8 9.5 15.8 9C15.8 8.5 15.5 8 15 8C14.5 8 14.2 8.5 14.2 9C14.2 9.5 14.5 10 15 10Z" fill="white" />
        </svg>
      )}
    </div>
  );
}

// Tiny stamp icon for verified badge
export function BatStamp({ className = "w-3 h-3 text-slate-800" }) {
  return (
    <div className={`rounded-full bg-slate-100 flex items-center justify-center ${className}`}>
      <BatSilhouette className="w-3/4 h-3/4" color="currentColor" />
    </div>
  );
}

// Global loading: subtle sonar pulse
export function SonarPulse({ text = "Listening..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="relative flex items-center justify-center w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full border border-slate-300"
          initial={{ opacity: 0.8, scale: 0.8 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-slate-200"
          initial={{ opacity: 0.8, scale: 0.5 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
        />
        <BatFlap className="w-8 h-8 text-slate-800 z-10" />
      </div>
      <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">{text}</p>
    </div>
  );
}

// Subtle sonar ripple for buttons
export function RippleButton({ children, onClick, className = "", style = {} }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev, newRipple]);
    
    if (onClick) onClick(e);
  };

  const handleAnimationComplete = (id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <button 
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.4 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => handleAnimationComplete(ripple.id)}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}