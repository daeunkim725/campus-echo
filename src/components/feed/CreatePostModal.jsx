import React, { useState } from "react";
import { X, Image, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { generateAlias } from "@/components/utils/aliases";

const categories = ["general", "academics", "social", "housing", "food", "sports", "rants", "confessions", "advice", "events"];

export default function CreatePostModal({ onClose, onCreated, currentUser }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);

    const seed = currentUser?.id || Math.random().toString();
    const { alias, color } = generateAlias(seed);

    let image_url = null;
    if (imageFile) {
      const res = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = res.file_url;
    }

    await base44.entities.Post.create({
      content: content.trim(),
      category,
      image_url,
      author_alias: alias,
      author_color: color,
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
      voted_up_by: [],
      voted_down_by: []
    });

    setLoading(false);
    onCreated?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">New Post</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Category */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  category === cat
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            autoFocus
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind? You're anonymous here 👀"
            rows={4}
            className="w-full resize-none rounded-2xl border border-slate-200 p-4 text-slate-800 placeholder:text-slate-400 text-[15px] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden">
              <img src={imagePreview} alt="" className="w-full max-h-48 object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <label className="cursor-pointer w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <Image className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${content.length > 500 ? "text-red-500" : "text-slate-400"}`}>
                {content.length}/500
              </span>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || loading || content.length > 500}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}