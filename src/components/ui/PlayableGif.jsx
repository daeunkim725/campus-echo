import React, { useEffect, useRef, useState } from 'react';

const gifs = new Set();
let checkInterval = null;

const checkCenter = () => {
  let closest = null;
  let minDistance = Infinity;
  const centerY = window.innerHeight / 2;

  gifs.forEach(gif => {
    if (!gif.el) return;
    const rect = gif.el.getBoundingClientRect();
    // Check if visible on screen
    if (rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0) {
      const dist = Math.abs(rect.top + rect.height / 2 - centerY);
      if (dist < minDistance) {
        minDistance = dist;
        closest = gif;
      }
    }
  });

  gifs.forEach(gif => {
    const shouldPlay = (gif === closest);
    if (gif.isPlaying !== shouldPlay) {
      gif.isPlaying = shouldPlay;
      gif.onPlayStateChange(shouldPlay);
    }
  });
};

export function PlayableGif({ gifUrl, stillUrl, alt = "gif", className = "" }) {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const gifEntry = {
      el: containerRef.current,
      isPlaying: false,
      onPlayStateChange: setIsPlaying
    };
    
    gifs.add(gifEntry);
    
    if (!checkInterval) {
      checkInterval = setInterval(checkCenter, 150);
    }
    
    // Trigger check immediately
    checkCenter();
    
    return () => {
      gifs.delete(gifEntry);
      if (gifs.size === 0 && checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* If it's not playing, show the still image, else show the animated one */}
      <img
        src={isPlaying ? gifUrl : (stillUrl || gifUrl)}
        alt={alt}
        className="w-full h-full object-cover"
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded">GIF</div>
        </div>
      )}
    </div>
  );
}