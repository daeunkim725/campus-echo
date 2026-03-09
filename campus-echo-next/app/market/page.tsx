"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import NavBar from "@/components/NavBar";
import { market as marketApi } from "@/lib/apiClient";
import { Plus, Tag, Bookmark, MapPin, Clock, ShieldCheck, X, ChevronLeft, ChevronRight, DollarSign, Image as ImageIcon, Loader2 } from "lucide-react";

interface Listing {
    id: string;
    title: string;
    description?: string;
    price: number;
    is_free: boolean;
    category: string;
    condition: string;
    status: string;
    seller_anon_id: string;
    is_own_listing: boolean;
    images: { url: string; order_index: number }[];
    pickup_location_tag?: string;
    created_at: string;
}

const CATEGORIES = ["Textbooks", "Electronics", "Furniture", "Clothing", "Housing", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const timeAgo = (ts: string) => {
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
};

export default function MarketPage() {
    const { user, isLoadingAuth } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Filters
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterSort, setFilterSort] = useState("newest");
    const [filterFree, setFilterFree] = useState(false);
    const [filterIncludeSold, setFilterIncludeSold] = useState(false);

    // Create form
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ title: "", description: "", price: "", is_free: false, category: "Other", condition: "Good", pickup: "" });
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!isLoadingAuth && !user) router.replace("/login");
    }, [user, isLoadingAuth, router]);

    const fetchListings = () => {
        setLoading(true);
        marketApi.listListings({ category: filterCategory !== "all" ? filterCategory : undefined })
            .then((data: any) => setListings(data.listings ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { if (user) fetchListings(); }, [filterCategory, user]);

    const handleCreate = async () => {
        if (!form.title.trim()) { setFormError("Title is required"); return; }
        if (!form.is_free && !form.price) { setFormError("Price is required"); return; }
        setFormError(""); setCreating(true);
        try {
            await marketApi.createListing({
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                price: form.is_free ? 0 : parseFloat(form.price),
                is_free: form.is_free,
                category: form.category,
                condition: form.condition,
                pickup_location_tag: form.pickup.trim() || undefined,
            });
            setShowCreate(false); setStep(1);
            setForm({ title: "", description: "", price: "", is_free: false, category: "Other", condition: "Good", pickup: "" });
            fetchListings();
        } catch (e: any) { setFormError(e.message); }
        finally { setCreating(false); }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F6F8FC" }}>
            <NavBar onCreatePost={() => setShowCreate(true)} createLabel="Sell" />

            {/* Filters Bar */}
            <div className="sticky z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 top-[100px] pt-3 pb-2">
                <div className="max-w-3xl mx-auto px-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-transparent text-slate-700 text-[13px] font-medium rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer border border-transparent hover:border-slate-200"
                        >
                            <option value="all">All Categories</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFilterFree(!filterFree)}
                                className={`text-[11px] font-medium px-3 py-1 rounded-full transition-colors border ${filterFree
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    }`}
                            >Free</button>
                            <button
                                onClick={() => setFilterIncludeSold(!filterIncludeSold)}
                                className={`text-[11px] font-medium px-3 py-1 rounded-full transition-colors border ${filterIncludeSold
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    }`}
                            >Include sold</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-1 mt-1">
                        <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">Sort:</span>
                        {[
                            { id: "newest", label: "Newest" },
                            { id: "price_low", label: "Price \u2191" },
                            { id: "price_high", label: "Price \u2193" },
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setFilterSort(s.id)}
                                className={`text-[12px] font-semibold transition-colors relative pb-0.5 ${filterSort === s.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                {s.label}
                                {filterSort === s.id && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full bg-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                                <div className="h-32 bg-slate-200" />
                                <div className="p-4 space-y-2"><div className="h-4 bg-slate-200 rounded w-3/4" /><div className="h-3 bg-slate-200 rounded w-full" /><div className="h-3 bg-slate-200 rounded w-1/2" /></div>
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
                        <button onClick={() => setShowCreate(true)} className="text-white w-full py-3 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Start Selling
                        </button>
                        <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> 100% verified student community
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {listings.map((listing) => (
                            <div key={listing.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer relative group">
                                {listing.images?.length > 0 ? (
                                    <div className={`w-full h-40 bg-slate-100 relative ${listing.status === "sold" ? "grayscale opacity-60" : ""}`}>
                                        <img src={listing.images[0].url} alt={listing.title} className="w-full h-full object-cover" />
                                        <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${listing.status === "sold" ? "bg-slate-700 text-white" : listing.is_free ? "bg-green-100 text-green-700" : "bg-white/90 backdrop-blur-sm text-slate-900"}`}>
                                            {listing.status === "sold" ? "SOLD" : listing.is_free ? "FREE" : `CHF ${listing.price.toFixed(2)}`}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-32 bg-slate-50 flex items-center justify-center relative">
                                        <Tag className="w-8 h-8 text-slate-300" />
                                        <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm border ${listing.status === "sold" ? "bg-slate-700 text-white border-transparent" : listing.is_free ? "bg-green-100 text-green-700 border-transparent" : "bg-white/90 text-slate-900 border-slate-100"}`}>
                                            {listing.status === "sold" ? "SOLD" : listing.is_free ? "FREE" : `CHF ${listing.price.toFixed(2)}`}
                                        </div>
                                    </div>
                                )}
                                <div className={`p-3 flex flex-col flex-1 ${listing.status === "sold" ? "opacity-70" : ""}`}>
                                    <h3 className={`text-sm font-bold mb-1 line-clamp-1 ${listing.status === "sold" ? "text-slate-500 line-through" : "text-slate-900"}`}>{listing.title}</h3>
                                    <p className="text-slate-500 text-xs line-clamp-2 mb-2 flex-1">{listing.description}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {listing.condition && <span className="text-[9px] px-1 py-0.5 rounded font-medium bg-slate-100 text-slate-600">{listing.condition}</span>}
                                        {listing.category && <span className="text-[9px] px-1 py-0.5 rounded font-medium bg-slate-100 text-slate-600">{listing.category}</span>}
                                    </div>
                                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-50">
                                        {listing.pickup_location_tag && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 bg-blue-50 text-blue-600 truncate">
                                                <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{listing.pickup_location_tag}</span>
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1 text-[9px] text-slate-400 shrink-0 ml-auto">
                                            <Clock className="w-3 h-3" /> {timeAgo(listing.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal — 3-step like Base44 */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0" onClick={() => setShowCreate(false)}>
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                {step > 1 && <button onClick={() => setStep(step - 1)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>}
                                <h2 className="text-lg font-bold text-slate-900">List an Item (Step {step}/3)</h2>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100"><X className="w-4 h-4" /></button>
                        </div>

                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Title</label>
                                    <input type="text" placeholder="e.g. Intro to Physics Textbook" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full text-base font-medium text-slate-900 bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-sm font-semibold text-slate-700">Price</label>
                                            <button type="button" onClick={() => setForm((f) => ({ ...f, is_free: !f.is_free, price: f.is_free ? f.price : "" }))} className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${form.is_free ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>FREE</button>
                                        </div>
                                        <div className="relative">
                                            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                            <input type="number" placeholder="0.00" value={form.is_free ? "" : form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} disabled={form.is_free} className={`w-full text-base font-medium text-slate-900 bg-slate-50 border-0 rounded-xl pl-9 pr-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none ${form.is_free ? "opacity-50 cursor-not-allowed" : ""}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1">Category</label>
                                        <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full text-base font-medium text-slate-900 bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none">
                                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button onClick={() => setStep(2)} disabled={!form.title.trim() || (!form.price && !form.is_free)} className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50 hover:bg-slate-800 transition-all">
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1">Condition</label>
                                        <select value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))} className="w-full text-base font-medium text-slate-900 bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none">
                                            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1">Pickup Area</label>
                                        <input type="text" placeholder="e.g. Main Library" value={form.pickup} onChange={(e) => setForm((f) => ({ ...f, pickup: e.target.value }))} className="w-full text-base font-medium text-slate-900 bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Description (Optional)</label>
                                    <textarea placeholder="More details about your item..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full h-24 text-sm text-slate-700 bg-slate-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-slate-200 outline-none resize-none" />
                                </div>
                                <button onClick={() => setStep(3)} className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 mt-4 hover:bg-slate-800 transition-all">
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-slate-700 block">Add a Photo (Optional)</label>
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 mb-3 shadow-sm border border-slate-100">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Upload an image</p>
                                    <p className="text-xs text-slate-400 mt-1">Clear photos help sell faster!</p>
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs flex items-start gap-2">
                                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>For your safety, only meet on campus during daylight hours. Never transfer money before seeing the item.</p>
                                </div>
                                {formError && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{formError}</p>}
                                <button onClick={handleCreate} disabled={creating} className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50 hover:bg-slate-800 transition-all">
                                    {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Publish Listing
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
