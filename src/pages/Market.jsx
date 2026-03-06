import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Image as ImageIcon, X, Loader2, DollarSign, Bookmark, ShieldCheck, MapPin, Clock, Tag, ChevronRight, ChevronLeft, Radar, Radio } from "lucide-react";
import { createPageUrl } from "@/utils";
import TopBar from "@/components/feed/TopBar";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import { getMoodLabel } from "@/components/profile/ProfilePanel";
import SchoolTopBar from "@/components/feed/SchoolTopBar";
import { getCleanAlias, getAliasEmoji } from "@/components/utils/moodUtils";
import { formatDistanceToNow } from "date-fns";
import { useThemeTokens } from "@/components/utils/ThemeProvider";

const CATEGORIES = ["Textbooks", "Electronics", "Furniture", "Clothing", "Housing", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

function CreateListingModal({ onClose, onCreated, currentUser, schoolConfig }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Other");
  const [condition, setCondition] = useState("Good");
  const [pickup, setPickup] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const tokens = useThemeTokens(schoolConfig);

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price) return;
    setLoading(true);
    try {
      let image_url = null;
      if (image) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: image });
        image_url = file_url;
      }

      const alias = getMoodLabel(currentUser?.mood) || "Anonymous";
      const colors = ["#6C63FF", "#FF6584", "#43B89C", "#F4A261", "#E76F51", "#2A9D8F", "#8338EC", "#FF006E", "#3A86FF", "#06D6A0"];
      const color = colors[Math.abs((currentUser?.id || "").split("").reduce((h, c) => (h << 5) - h + c.charCodeAt(0) | 0, 0)) % colors.length] || "#6C63FF";

      await base44.entities.MarketListing.create({
        title,
        description,
        price: parseFloat(price),
        image_url,
        school: currentUser?.school || "all",
        author_alias: alias,
        author_color: color,
        condition,
        category,
        pickup_location: pickup,
        saved_by: []
      });
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-lg font-bold text-slate-900">List an Item (Step {step}/3)</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Title</label>
              <input type="text" placeholder="e.g. Intro to Physics Textbook" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-base font-medium text-slate-900 bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Price</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full text-base font-medium text-slate-900 bg-slate-50 border-0 rounded-xl pl-9 pr-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none" min="0" step="0.01" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-base font-medium text-slate-900 bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!title.trim() || !price} className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50" style={{ backgroundColor: tokens.primary }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Condition</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full text-base font-medium text-slate-900 bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Pickup Area</label>
                <input type="text" placeholder="e.g. Main Library" value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full text-base font-medium text-slate-900 bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Description (Optional)</label>
              <textarea placeholder="More details about your item..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-24 text-sm text-slate-700 bg-slate-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-slate-200 outline-none resize-none" />
            </div>
            <button onClick={() => setStep(3)} className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50" style={{ backgroundColor: tokens.primary }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 block">Add a Photo (Optional)</label>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {image ? (
                <>
                  <img src={URL.createObjectURL(image)} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button onClick={() => setImage(null)} className="bg-white text-slate-900 px-3 py-1.5 rounded-lg font-medium text-sm">Remove</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 mb-3 shadow-sm border border-slate-100">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Upload an image</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Clear photos help sell faster!</p>
                  <label className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer hover:bg-slate-50 transition-colors">
                    Choose File
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                </>
              )}
            </div>
            
            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <p>For your safety, only meet on campus during daylight hours. Never transfer money before seeing the item.</p>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50 hover:opacity-90" style={{ backgroundColor: tokens.primary }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Listing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing, currentUser, onUpdate, schoolConfig }) {
  const [saving, setSaving] = useState(false);
  const userId = currentUser?.id || "anon";
  const isSaved = listing.saved_by?.includes(userId);
  const tokens = useThemeTokens(schoolConfig);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saving || !currentUser) return;
    setSaving(true);
    let newSaved = [...(listing.saved_by || [])];
    if (isSaved) {
      newSaved = newSaved.filter(id => id !== userId);
    } else {
      newSaved.push(userId);
    }
    await base44.entities.MarketListing.update(listing.id, { saved_by: newSaved });
    onUpdate?.();
    setSaving(false);
  };

  const timeAgo = listing.created_date ? formatDistanceToNow(new Date(listing.created_date), { addSuffix: true }) : "";

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer relative group">
      {listing.image_url ? (
        <div className="w-full h-40 sm:h-48 bg-slate-100 relative">
          <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs sm:text-sm font-bold text-slate-900 shadow-sm">
            ${listing.price.toFixed(2)}
          </div>
          <button 
            onClick={handleSave}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${isSaved ? 'bg-indigo-50 text-indigo-600' : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-slate-600'}`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      ) : (
        <div className="w-full h-32 sm:h-40 bg-slate-50 flex items-center justify-center relative">
          <Tag className="w-8 h-8 text-slate-300" />
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs sm:text-sm font-bold text-slate-900 shadow-sm border border-slate-100">
            ${listing.price.toFixed(2)}
          </div>
          <button 
            onClick={handleSave}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${isSaved ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-400 hover:text-slate-600'}`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 line-clamp-1">{listing.title}</h3>
        <p className="text-slate-500 text-xs line-clamp-2 mb-2 sm:mb-3 flex-1">{listing.description}</p>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {listing.condition && (
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              {listing.condition}
            </span>
          )}
          {listing.category && (
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              {listing.category}
            </span>
          )}
          {listing.pickup_location && (
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {listing.pickup_location}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: tokens.primaryLight }}>
              {getAliasEmoji(listing.author_alias)}
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              {getCleanAlias(listing.author_alias)}
              {listing.school && <ShieldCheck className="w-3 h-3 text-green-500" />}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400">
            <Clock className="w-3 h-3" /> {timeAgo}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Market() {
  const params = new URLSearchParams(window.location.search);
  const schoolCode = params.get("school");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSort, setFilterSort] = useState("newest");

  const configSchoolCode = schoolCode || currentUser?.school || (currentUser?.role === 'admin' ? 'ETH' : null);
  const schoolConfig = getSchoolConfig(configSchoolCode);
  const tokens = useThemeTokens(schoolConfig);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setCurrentUser(u);
      if (!u?.school_verified && u?.role !== 'admin') {
        window.location.href = createPageUrl("Onboarding");
        return;
      }
      if (u?.role !== "admin" && u?.school !== schoolCode && schoolCode) {
        window.location.href = createPageUrl("Market") + `?school=${u.school}`;
      }
    }).catch(() => base44.auth.redirectToLogin(createPageUrl("Market") + (schoolCode ? `?school=${schoolCode}` : "")));
  }, [schoolCode]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let data = await base44.entities.MarketListing.list("-created_date", 100);

      if (configSchoolCode) {
        data = data.filter((l) => !l.school || l.school === "all" || l.school === configSchoolCode);
      }
      
      if (filterCategory !== "all") {
        data = data.filter(l => l.category === filterCategory);
      }
      
      if (filterSort === "price_low") {
        data = data.sort((a, b) => a.price - b.price);
      } else if (filterSort === "price_high") {
        data = data.sort((a, b) => b.price - a.price);
      }

      setListings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {fetchListings();}, [configSchoolCode, filterCategory, filterSort]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: tokens.bg }}>
      {schoolCode ? (
        <SchoolTopBar
          currentUser={currentUser}
          onUserUpdate={(u) => setCurrentUser(u)}
          onPost={() => setShowCreate(true)}
          activePage="market"
          schoolConfig={schoolConfig}
          schoolCode={schoolCode} />
      ) : (
        <TopBar
          currentUser={currentUser}
          onUserUpdate={(u) => setCurrentUser(u)}
          onPost={() => setShowCreate(true)}
          postLabel="Sell"
          activePage="market"
          schoolConfig={schoolConfig} />
      )}

      {/* Filters Bar */}
      <div className="sticky z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 top-[65px]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
            className="flex-shrink-0 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select 
            value={filterSort} 
            onChange={e => setFilterSort(e.target.value)}
            className="flex-shrink-0 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="h-32 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 px-6 max-w-md mx-auto shadow-sm my-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Tag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Your Campus Market</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Buy and sell safely with verified students. Got textbooks, a bike, or an old monitor? Turn it into cash today.
            </p>
            <button
              onClick={() => setShowCreate(true)} 
              className="text-white w-full py-3.5 text-sm font-semibold rounded-xl transition-all hover:opacity-90 shadow-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: tokens.primary }}>
              <Plus className="w-4 h-4" /> Start Selling
            </button>
            <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 100% verified student community
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} currentUser={currentUser} onUpdate={fetchListings} schoolConfig={schoolConfig} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateListingModal onClose={() => setShowCreate(false)} onCreated={fetchListings} currentUser={currentUser} schoolConfig={schoolConfig} />
      )}
    </div>
  );
}