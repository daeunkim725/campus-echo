import React from "react";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes slide-in-from-bottom {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in.slide-in-from-bottom { animation: slide-in-from-bottom 0.3s ease-out; }
        
        /* Pixel/Retro Design System */
        .pixel-border {
          border: 3px solid;
          border-image-slice: 1;
          box-shadow: 
            4px 4px 0px rgba(0, 0, 0, 0.1),
            8px 8px 0px rgba(0, 0, 0, 0.05);
        }
        
        .pixel-button {
          position: relative;
          border: 3px solid;
          font-weight: 700;
          letter-spacing: 0.05em;
          transition: all 0.1s ease;
          cursor: pointer;
          padding: 0.75rem 1.5rem;
          text-transform: uppercase;
          font-size: 0.875rem;
        }
        
        .pixel-button:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2) !important;
        }
        
        .pixel-button:hover:not(:active) {
          transform: translate(-2px, -2px);
        }
        
        .pixel-input {
          border: 2px solid;
          padding: 0.75rem 1rem;
          font-weight: 500;
          transition: all 0.1s ease;
        }
        
        .pixel-input:focus {
          outline: none;
          border-width: 3px;
          box-shadow: 0px 0px 0px 4px rgba(255, 255, 255, 0.5);
        }
        
        .pixel-card {
          border: 3px solid;
          box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.08);
        }
      `}</style>
      {children}
    </div>
  );
}