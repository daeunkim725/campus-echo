import React, { useState, useEffect } from "react";
import { X, MessageCircle, MapPin, Tag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ChatModal from "./ChatModal";
import { getCleanAlias, getAliasEmoji } from "@/components/utils/moodUtils";
import { formatDistanceToNow } from "date-fns";
import { useThemeTokens } from "@/components/utils/ThemeProvider";

export default function ListingDetailModal({ listing, currentUser, onClose, schoolConfig, onUpdate }) {
  const tokens = useThemeTokens(schoolConfig);
  const [showChat, setShowChat] = useState(false);
  const [thread, setThread] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [markingSold, setMarkingSold] = useState(false);

  const isSeller = currentUser?.email === listing?.created_by;

  const handleMessageClick = async () => {
    if (isSeller) {
      // Seller can't message themselves from here, they go to inbox
      window.location.href = "/MarketInbox"; // or handle differently
      return;
    }
    
    setLoadingChat(true);
    try {
      // Check if thread exists
      const threads = await base44.entities.MarketThread.filter({
        listing_id: listing.id,
        buyer_email: currentUser.email
      });
      
      let currentThread;
      if (threads.length > 0) {
        currentThread = threads[0];
      } else {
        currentThread = await base44.entities.MarketThread.create({
          listing_id: listing.id,
          buyer_email: currentUser.email,
          seller_email: listing.created_by,
          status: listing.status === 'sold' ? 'locked' : 'open'
        });
      }
      setThread(currentThread);
      setShowChat(true);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleMarkSold = async () => {
    setMarkingSold(true);
    await base44.entities.MarketListing.update(listing.id, { status: "sold" });
    
    // Lock all threads
    const threads = await base44.entities.MarketThread.filter({ listing_id: listing.id });
    for (const t of threads) {
      await base44.entities.MarketThread.update(t.id, { status: "locked" });
    }
    
    onUpdate?.();
    setMarkingSold(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in" onClick={onClose}>
        <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
            <h2 className="text-lg font-bold text-slate-900">Listing Details</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {listing.image_url ? (
              <div className="w-full aspect-square sm:aspect-video bg-slate-100">
                <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full aspect-video bg-slate-50 flex items-center justify-center border-b border-slate-100">
                <Tag className="w-12 h-12 text-slate-300" />
              </div>
            )}

            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-2xl font-black text-slate-900 leading-tight">{listing.title}</h1>
                  <span className="text-2xl font-black text-green-600">${listing.price?.toFixed(2)}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.status === 'sold' && (
                    <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sold
                    </span>
                  )}
                  {listing.condition && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      Condition: {listing.condition}
                    </span>
                  )}
                  {listing.pickup_location && (
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {listing.pickup_location}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm bg-white border border-slate-200">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      Verified Student Seller
                    </div>
                    <div className="text-xs text-slate-500">
                      Posted {formatDistanceToNow(new Date(listing.created_date))} ago
                    </div>
                  </div>
                </div>
              </div>

              {listing.description && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
                  <p className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-100 shrink-0 bg-white shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
            {isSeller ? (
              <div className="flex gap-3">
                <button onClick={() => window.location.href = "/MarketInbox"} className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-[15px] hover:bg-slate-200 transition-colors">
                  View Messages
                </button>
                {listing.status !== 'sold' && (
                  <button onClick={handleMarkSold} disabled={markingSold} className="flex-1 py-3.5 bg-red-50 text-red-600 font-bold rounded-xl text-[15px] hover:bg-red-100 transition-colors">
                    {markingSold ? "Marking..." : "Mark as Sold"}
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={handleMessageClick}
                disabled={loadingChat || listing.status === 'sold'}
                className="w-full py-3.5 text-white font-bold rounded-xl text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-colors disabled:opacity-50"
                style={{ backgroundColor: tokens.primary, color: tokens.surface }}
              >
                {loadingChat ? "Loading..." : listing.status === 'sold' ? "Item Sold" : <><MessageCircle className="w-5 h-5" /> Message Seller Anonymously</>}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {showChat && thread && (
        <ChatModal 
          thread={thread}
          listing={listing}
          currentUser={currentUser}
          onClose={() => setShowChat(false)}
          schoolConfig={schoolConfig}
        />
      )}
    </>
  );
}