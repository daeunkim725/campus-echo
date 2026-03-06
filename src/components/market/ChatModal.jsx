import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, AlertTriangle, MapPin, Tag, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useThemeTokens } from "@/components/utils/ThemeProvider";

const detectOffPlatform = (text) => {
  const phone = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;
  const email = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const link = /https?:\/\/[^\s]+|www\.[^\s]+/;
  return phone.test(text) || email.test(text) || link.test(text);
};

export default function ChatModal({ thread, listing, currentUser, onClose, schoolConfig }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState(listing?.price || "");
  const [showMeetupForm, setShowMeetupForm] = useState(false);
  const [meetupLocation, setMeetupLocation] = useState(listing?.pickup_location || "");
  const [meetupTime, setMeetupTime] = useState("");
  
  const tokens = useThemeTokens(schoolConfig);
  const messagesEndRef = useRef(null);
  
  const isSeller = currentUser?.email === listing?.created_by;
  const myRole = isSeller ? "seller" : "buyer";
  const otherRoleName = isSeller ? "Buyer" : "Seller";

  const fetchMessages = async () => {
    try {
      const msgs = await base44.entities.MarketMessage.list("+created_date", 100);
      const threadMsgs = msgs.filter(m => m.thread_id === thread.id);
      
      // Mark unread messages from other user as read
      const unreadMsgs = threadMsgs.filter(m => m.sender_role !== myRole && m.sender_role !== "system" && !m.read);
      for (const m of unreadMsgs) {
        await base44.entities.MarketMessage.update(m.id, { read: true });
      }
      if (unreadMsgs.length > 0) {
        // Update local state without re-fetching
        threadMsgs.forEach(m => {
          if (unreadMsgs.find(u => u.id === m.id)) m.read = true;
        });
      }

      setMessages(threadMsgs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // simple polling
    return () => clearInterval(interval);
  }, [thread.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    setErrorMsg("");
    if (!inputText.trim()) return;

    if (detectOffPlatform(inputText)) {
      setErrorMsg("For safety, keep contact in-app. Phone numbers, emails, and links are not allowed.");
      return;
    }

    const text = inputText;
    setInputText("");

    await base44.entities.MarketMessage.create({
      thread_id: thread.id,
      sender_role: myRole,
      type: "text",
      content: text
    });
    fetchMessages();
  };

  const handleSendOffer = async () => {
    if (!offerPrice) return;
    await base44.entities.MarketMessage.create({
      thread_id: thread.id,
      sender_role: myRole,
      type: "offer",
      content: "Sent an offer",
      offer_price: parseFloat(offerPrice),
      offer_status: "pending"
    });
    setShowOfferForm(false);
    fetchMessages();
  };

  const handleUpdateOffer = async (msgId, status) => {
    await base44.entities.MarketMessage.update(msgId, { offer_status: status });
    
    // Add system message
    await base44.entities.MarketMessage.create({
      thread_id: thread.id,
      sender_role: "system",
      type: "system",
      content: `Offer ${status} by ${isSeller ? "Seller" : "Buyer"}.`
    });
    
    if (status === "accepted") {
      setShowMeetupForm(isSeller); // if accepted, someone should propose meetup. Let's say seller.
    }
    
    fetchMessages();
  };

  const handleSendMeetup = async () => {
    if (!meetupLocation || !meetupTime) return;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await base44.entities.MarketMessage.create({
      thread_id: thread.id,
      sender_role: myRole,
      type: "meetup",
      content: "Proposed a meetup",
      meetup_location: meetupLocation,
      meetup_time: meetupTime,
      meetup_code: code
    });
    setShowMeetupForm(false);
    fetchMessages();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white sm:p-4 sm:bg-slate-100/80 sm:backdrop-blur-sm sm:items-center sm:justify-center animate-in fade-in slide-in-from-bottom-4">
      <div className="flex-1 w-full sm:max-w-md bg-white sm:rounded-3xl shadow-xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <ShieldCheck className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">{otherRoleName}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{listing?.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          <div className="text-center pb-4">
            <div className="inline-block bg-blue-50 text-blue-700 text-[11px] font-medium px-3 py-1.5 rounded-full mb-2">
              Stay safe: Keep conversations in-app
            </div>
            <p className="text-xs text-slate-400 px-6">
              You are chatting anonymously about "{listing?.title}". Never send money before seeing the item.
            </p>
          </div>

          {messages.map((msg) => {
            const isMine = msg.sender_role === myRole;
            const isSystem = msg.type === "system" || msg.sender_role === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <div className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full font-medium">
                    {msg.content}
                  </div>
                </div>
              );
            }

            if (msg.type === "offer") {
              return (
                <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`rounded-2xl p-4 border ${isMine ? 'border-transparent' : 'bg-white border-slate-200'} shadow-sm`} style={isMine ? { backgroundColor: tokens.primaryLight } : {}}>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className={`w-4 h-4 ${isMine ? '' : 'text-slate-400'}`} style={isMine ? { color: tokens.primary } : {}} />
                      <span className="font-bold text-slate-900">${msg.offer_price?.toFixed(2)} Offer</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${msg.offer_status === 'pending' ? 'bg-amber-100 text-amber-700' : msg.offer_status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg.offer_status}
                      </span>
                    </div>
                    {msg.offer_status === 'pending' && !isMine && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button onClick={() => handleUpdateOffer(msg.id, 'declined')} className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                          Decline
                        </button>
                        <button onClick={() => handleUpdateOffer(msg.id, 'accepted')} className="flex-1 py-1.5 hover:opacity-90 text-white text-xs font-bold rounded-lg transition-colors" style={{ backgroundColor: tokens.primary, color: tokens.surface }}>
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (msg.type === "meetup") {
              return (
                <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`rounded-2xl p-4 border ${isMine ? 'border-transparent' : 'bg-white border-slate-200'} shadow-sm`} style={isMine ? { backgroundColor: tokens.primaryLight } : {}}>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" style={{ color: tokens.primary }} /> Meetup Plan
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      <p className="flex items-center gap-2"><span className="text-slate-500 font-medium w-16">Where:</span> <span className="font-semibold text-slate-900">{msg.meetup_location}</span></p>
                      <p className="flex items-center gap-2"><span className="text-slate-500 font-medium w-16">When:</span> <span className="font-semibold text-slate-900">{msg.meetup_time}</span></p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Meetup Code to verify in person:</p>
                      <div className="text-lg font-black tracking-widest text-center bg-slate-100 py-2 rounded-lg">{msg.meetup_code}</div>
                    </div>
                  </div>
                </div>
              );
            }

            // text message
            return (
              <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl ${isMine ? 'text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`} style={isMine ? { backgroundColor: tokens.primary, color: tokens.surface } : {}}>
                  <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {formatDistanceToNow(new Date(msg.created_date))} ago
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          {errorMsg && (
            <div className="mb-2 p-2 bg-red-50 text-red-600 text-xs rounded-lg flex items-start gap-1.5 border border-red-100">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {showOfferForm ? (
            <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Send an Offer</h4>
              <div className="flex gap-2 mb-2">
                <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder="Price" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": tokens.primaryLight }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowOfferForm(false)} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold">Cancel</button>
                <button onClick={handleSendOffer} className="flex-1 py-2 rounded-lg text-sm font-semibold hover:opacity-90" style={{ backgroundColor: tokens.primary, color: tokens.surface }}>Send Offer</button>
              </div>
            </div>
          ) : showMeetupForm ? (
            <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Plan Meetup</h4>
              <div className="space-y-2 mb-3">
                <input type="text" value={meetupLocation} onChange={(e) => setMeetupLocation(e.target.value)} placeholder="Where? e.g. Library Cafe" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": tokens.primaryLight }} />
                <input type="text" value={meetupTime} onChange={(e) => setMeetupTime(e.target.value)} placeholder="When? e.g. Today 3pm" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": tokens.primaryLight }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowMeetupForm(false)} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold">Cancel</button>
                <button onClick={handleSendMeetup} className="flex-1 py-2 rounded-lg text-sm font-semibold hover:opacity-90" style={{ backgroundColor: tokens.primary, color: tokens.surface }}>Send Plan</button>
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1 shrink-0">
                {!isSeller && (
                  <button onClick={() => setShowOfferForm(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" style={{ ":hover": { color: tokens.primary } }} title="Send Offer">
                    <Tag className="w-4 h-4" />
                  </button>
                )}
                {isSeller && (
                  <button onClick={() => setShowMeetupForm(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" style={{ ":hover": { color: tokens.primary } }} title="Plan Meetup">
                    <MapPin className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSend} className="flex-1 relative flex items-center bg-slate-100 rounded-2xl border border-slate-200 focus-within:ring-2 transition-all overflow-hidden" style={{ "--tw-ring-color": tokens.primaryLight }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={thread.status === 'locked' ? "Listing is sold" : "Type a message..."}
                  disabled={thread.status === 'locked'}
                  className="w-full bg-transparent border-none px-4 py-3 text-[15px] focus:outline-none disabled:opacity-50"
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || thread.status === 'locked'} 
                  className="shrink-0 p-2 mr-1 text-white rounded-xl disabled:opacity-50 disabled:bg-slate-300 transition-colors"
                  style={{ backgroundColor: tokens.primary }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}