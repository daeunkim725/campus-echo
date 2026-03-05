import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Image as ImageIcon, X, Loader2, DollarSign } from "lucide-react";
import { createPageUrl } from "@/utils";
import TopBar from "@/components/feed/TopBar";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import { getMoodLabel } from "@/components/profile/ProfilePanel";
import SchoolTopBar from "@/components/feed/SchoolTopBar";
import { getCleanAlias, getAliasEmoji } from "@/components/utils/moodUtils";

function CreateListingModal({ onClose, onCreated, currentUser }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !price) return;
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
        author_color: color
      });
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Sell something</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="What are you selling?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent" />

          </div>
          <div>
            <div className="flex items-center border-b border-slate-200 pb-2">
              <DollarSign className="w-5 h-5 text-slate-400" />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent ml-2"
                min="0"
                step="0.01" />

            </div>
          </div>
          <div>
            <textarea
              placeholder="Describe your item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent border border-slate-200 rounded-xl p-3" />

          </div>

          {image &&
          <div className="relative inline-block mt-2">
              <img src={URL.createObjectURL(image)} alt="Preview" className="h-32 rounded-xl object-cover" />
              <button
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-slate-800 text-white p-1 rounded-full shadow-md">

                <X className="w-3 h-3" />
              </button>
            </div>
          }

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <label className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-50">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <ImageIcon className="w-5 h-5" />
            </label>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !description.trim() || !price || loading}
              className="px-6 py-2.5 rounded-full text-white font-semibold text-sm disabled:opacity-40 flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: getSchoolConfig(currentUser?.school)?.primary || "#7C3AED" }}>

              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              List Item
            </button>
          </div>
        </div>
      </div>
    </div>);

}

function ListingCard({ listing }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[16px]" style={{ backgroundColor: getSchoolConfig(listing.school)?.primaryLight || "#EDE9FE" }}>
            {getAliasEmoji(listing.author_alias)}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 capitalize">{getCleanAlias(listing.author_alias)}</div>
            <div className="text-xs text-slate-500">{new Date(listing.created_date).toLocaleDateString()}</div>
          </div>
        </div>
        <div className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-lg">
          ${listing.price.toFixed(2)}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2">{listing.title}</h3>
      <p className="text-slate-600 text-sm whitespace-pre-wrap mb-4">{listing.description}</p>

      {listing.image_url &&
      <div className="mb-4">
          <img src={listing.image_url} alt="Listing" className="w-full max-h-80 object-cover rounded-xl border border-slate-100" />
        </div>
      }
    </div>);

}

export default function Market() {
  const params = new URLSearchParams(window.location.search);
  const schoolCode = params.get("school");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const configSchoolCode = schoolCode || currentUser?.school;
  const schoolConfig = getSchoolConfig(configSchoolCode);

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

      // Only show listings from user's school community
      if (configSchoolCode) {
        data = data.filter((l) => !l.school || l.school === "all" || l.school === configSchoolCode);
      }

      setListings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {fetchListings();}, [configSchoolCode]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: schoolConfig.bg }}>
      {schoolCode ?
      <SchoolTopBar
        currentUser={currentUser}
        onUserUpdate={(u) => setCurrentUser(u)}
        onPost={() => setShowCreate(true)}
        activePage="market"
        schoolConfig={schoolConfig}
        schoolCode={schoolCode} /> :


      <TopBar
        currentUser={currentUser}
        onUserUpdate={(u) => setCurrentUser(u)}
        onPost={() => setShowCreate(true)}
        postLabel="Sell"
        activePage="market"
        schoolConfig={schoolConfig} />

      }

      {/* Feed */}
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {loading ?
        Array(3).fill(0).map((_, i) =>
        <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                </div>
                <div className="h-8 w-16 bg-slate-200 rounded-lg" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-4/5" />
              </div>
              <div className="h-40 bg-slate-200 rounded-xl w-full" />
            </div>
        ) :
        listings.length === 0 ?
        <div className="text-center py-20">
            <div className="text-5xl mb-4">🛍️</div>
            <p className="text-slate-500 font-medium">No items for sale yet</p>
            <p className="text-slate-400 text-sm mt-1">Be the first to list something!</p>
            <button
            onClick={() => setShowCreate(true)} className="text-white mt-4 px-6 py-2.5 text-sm font-semibold rounded-full transition-all hover:opacity-90"
            style={{ backgroundColor: schoolConfig?.primary || "#7C3AED" }}>


              Sell an item
            </button>
          </div> :

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {listings.map((listing) =>
          <ListingCard key={listing.id} listing={listing} />
          )}
          </div>
        }
      </div>

      {showCreate &&
      <CreateListingModal onClose={() => setShowCreate(false)} onCreated={fetchListings} currentUser={currentUser} />
      }
    </div>);

}