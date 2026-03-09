import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/feed/TopBar";
import SchoolTopBar from "@/components/feed/SchoolTopBar";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import { createPageUrl } from "@/utils";
import { MessageCircle, ArrowLeft, Tag } from "lucide-react";
import ChatModal from "@/components/market/ChatModal";
import { getShortTimeAgo } from "@/components/utils/timeUtils";
import { useThemeTokens } from "@/components/utils/ThemeProvider";

export default function MarketInbox() {
  const [threads, setThreads] = useState([]);
  const [listingsCache, setListingsCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);

  const effectiveSchool = currentUser?.school || (currentUser?.role === 'admin' ? 'ETHZ' : null);
  const schoolConfig = getSchoolConfig(effectiveSchool);
  const tokens = useThemeTokens(schoolConfig);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
    }).catch(() => {
      base44.auth.redirectToLogin(createPageUrl("MarketInbox"));
    });
  }, []);

  const fetchThreads = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const allThreads = await base44.entities.MarketThread.list("-created_date", 100);
      const myThreads = allThreads.filter(t => t.buyer_email === currentUser.email || t.seller_email === currentUser.email);

      // Fetch listings for these threads
      const listingIds = [...new Set(myThreads.map(t => t.listing_id))];
      const listings = {};
      for (const id of listingIds) {
        if (!listingsCache[id]) {
          try {
            const l = await base44.entities.MarketListing.get(id);
            listings[id] = l;
          } catch (e) {
            // listing deleted
          }
        } else {
          listings[id] = listingsCache[id];
        }
      }

      setListingsCache(prev => ({ ...prev, ...listings }));
      setThreads(myThreads);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [currentUser]);

  const handleBackToMarket = () => {
    const school = currentUser?.school || (currentUser?.role === 'admin' ? 'ETHZ' : null);
    window.location.href = createPageUrl("Market") + (school ? `?school=${school}` : "");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: tokens.bg }}>
      {effectiveSchool ? (
        <SchoolTopBar
          currentUser={currentUser}
          onUserUpdate={(u) => setCurrentUser(u)}
          onPost={handleBackToMarket}
          activePage="market"
          schoolConfig={schoolConfig}
          schoolCode={effectiveSchool}
          hideFABs={true} />
      ) : (
        <TopBar
          currentUser={currentUser}
          onUserUpdate={(u) => setCurrentUser(u)}
          onPost={handleBackToMarket}
          postLabel="Sell"
          activePage="market"
          schoolConfig={schoolConfig}
          hideFABs={true} />
      )}

      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={handleBackToMarket} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">My Item Threads</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-slate-100"></div>)}
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 px-5 max-w-sm mx-auto shadow-sm my-6">
            <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1.5">No messages yet</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">When you message a seller or receive an inquiry on your items, it will appear here.</p>
            <div className="space-y-2">
              <button onClick={handleBackToMarket} className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 shadow-sm flex items-center justify-center gap-2" style={{ backgroundColor: tokens.primary, color: tokens.surface }}>
                Browse Market
              </button>
              <button onClick={handleBackToMarket} className="w-full py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
                Post an item
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map(thread => {
              const listing = listingsCache[thread.listing_id];
              if (!listing) return null;

              const isSeller = thread.seller_email === currentUser.email;

              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-center"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {listing.image_url ? (
                      <img src={listing.image_url} className="w-full h-full object-cover" alt="item" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tag className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-slate-900 truncate pr-2">{listing.title}</h4>
                      <span className="text-xs font-medium text-slate-500 shrink-0">
                        {getShortTimeAgo(thread.updated_date || thread.created_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded font-bold" style={isSeller ? { backgroundColor: tokens.primaryLight, color: tokens.primary } : { backgroundColor: '#d1fae5', color: '#047857' }}>
                        {isSeller ? "Selling" : "Buying"}
                      </span>
                      {thread.status === 'locked' && (
                        <span className="px-2 py-0.5 rounded font-bold bg-red-50 text-red-700">Sold/Locked</span>
                      )}
                      <span className="text-slate-500 font-medium">${listing.price?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedThread && listingsCache[selectedThread.listing_id] && (
        <ChatModal
          thread={selectedThread}
          listing={listingsCache[selectedThread.listing_id]}
          currentUser={currentUser}
          onClose={() => setSelectedThread(null)}
          schoolConfig={schoolConfig}
        />
      )}
    </div>
  );
}