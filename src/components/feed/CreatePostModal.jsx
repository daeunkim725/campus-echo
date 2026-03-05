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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg mx-4 rounded-lg shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">Write a post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Category selector */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all border ${
                  category === cat
                    ? "border-[#E8344E] text-[#E8344E] bg-red-50"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                #{cat}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            autoFocus
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share something anonymously with your campus..."
            rows={5}
            className="w-full resize-none text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none leading-relaxed"
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded overflow-hidden border border-gray-100">
              <img src={imagePreview} alt="" className="w-full max-h-48 object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          <label className="cursor-pointer flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors text-[13px]">
            <Image className="w-4 h-4" />
            <span>Photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${content.length > 500 ? "text-red-500" : "text-gray-400"}`}>
              {content.length}/500
            </span>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading || content.length > 500}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#E8344E] text-white text-[13px] font-medium hover:bg-[#d02d43] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}