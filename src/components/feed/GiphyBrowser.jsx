import React, { useState, useEffect } from "react";
import { Search, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function GiphyBrowser({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGifs = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("giphy", {
        action: searchQuery ? "search" : "trending",
        query: searchQuery,
        limit: 20
      });
      if (response.data && response.data.data) {
        setGifs(response.data.data);
      } else {
        setGifs([]);
      }
    } catch (error) {
      console.error("Error fetching gifs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs("");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGifs(query);
  };

  return (
    <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 flex flex-col max-h-[300px]">
      <div className="flex items-center p-2 border-b border-slate-100 gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex items-center bg-slate-100 rounded-full px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder:text-slate-400"
          />
        </form>
        <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : gifs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No GIFs found</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => onSelect({
                  gif_url: gif.images.fixed_height.url,
                  still_url: gif.images.fixed_height_still.url
                })}
                className="w-full relative pt-[100%] rounded-lg overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity"
              >
                <img
                  src={gif.images.fixed_height_small.url}
                  alt={gif.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}