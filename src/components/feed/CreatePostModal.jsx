import React, { useState } from "react";
import { X, Image, Send, BarChart2, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getMoodLabel } from "@/components/profile/ProfilePanel";

const CATEGORIES = ["general", "academics", "housing", "food", "rants", "confessions", "advice", "events"];

const ETH_DEPTS = [
  "D-ARCH", "D-BAUG", "D-BSSE", "D-INFK", "D-ITET", "D-MATL",
  "D-MATH", "D-MAVT", "D-MTEC", "D-PHYS", "D-USYS", "D-ERDW",
  "D-BIOL", "D-CHAB", "D-GESS", "D-HEST"
];

const OTHER_UNIS = ["EPFL", "UNIZH", "UNIBASEL", "UNIBE", "UNIL", "UNIFR", "UNIGE", "UNISG", "USI", "UNILU"];

const LEVELS = ["BSc", "MSc", "PhD"];

export default function CreatePostModal({ onClose, onCreated, currentUser }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [department, setDepartment] = useState(null);
  const [level, setLevel] = useState(null);
  const [postType, setPostType] = useState("text"); // "text" | "poll"
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deptGroup, setDeptGroup] = useState("eth"); // "eth" | "other"

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) setPollOptions([...pollOptions, ""]);
  };

  const updatePollOption = (i, val) => {
    const updated = [...pollOptions];
    updated[i] = val;
    setPollOptions(updated);
  };

  const removePollOption = (i) => {
    if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, idx) => idx !== i));
  };

  const isValid = postType === "text"
    ? content.trim() && content.length <= 500
    : pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);

    const seed = currentUser?.id || Math.random().toString();
    const { alias, color } = generateAlias(seed);

    let image_url = null;
    if (imageFile) {
      const res = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = res.file_url;
    }

    const postData = {
      content: postType === "poll" ? pollQuestion.trim() : content.trim(),
      category,
      department: department || null,
      academic_level: level || null,
      post_type: postType,
      image_url,
      author_alias: alias,
      author_color: color,
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
      voted_up_by: [],
      voted_down_by: [],
    };

    if (postType === "poll") {
      postData.poll_question = pollQuestion.trim();
      postData.poll_options = pollOptions
        .filter(o => o.trim())
        .map(o => ({ text: o.trim(), votes: 0, voted_by: [] }));
    }

    await base44.entities.Post.create(postData);
    setLoading(false);
    onCreated?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900">New Post</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Post Type Toggle */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setPostType("text")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                postType === "text" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              💬 Text Post
            </button>
            <button
              onClick={() => setPostType("poll")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                postType === "poll" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Poll
            </button>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                    category === cat ? "bg-violet-600 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Department Tag */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Community <span className="normal-case font-normal text-slate-400">(optional)</span></p>
            <div className="flex gap-1.5 mb-2">
              <button
                onClick={() => setDeptGroup("eth")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  deptGroup === "eth" ? "bg-slate-800 text-white border-slate-800" : "border-slate-200 text-slate-500"
                }`}
              >
                ETH Zürich
              </button>
              <button
                onClick={() => setDeptGroup("other")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  deptGroup === "other" ? "bg-slate-800 text-white border-slate-800" : "border-slate-200 text-slate-500"
                }`}
              >
                Other Unis
              </button>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(deptGroup === "eth" ? ETH_DEPTS : OTHER_UNIS).map(d => (
                <button
                  key={d}
                  onClick={() => setDepartment(department === d ? null : d)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    department === d ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-400 hover:border-slate-300 bg-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Academic Level */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Academic Level <span className="normal-case font-normal text-slate-400">(optional)</span></p>
            <div className="flex gap-2">
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(level === l ? null : l)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    level === l ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Text Content or Poll */}
          {postType === "text" ? (
            <>
              <textarea
                autoFocus
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What's on your mind? You're anonymous here 👀"
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-200 p-4 text-slate-800 placeholder:text-slate-400 text-[15px] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
              {imagePreview && (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="" className="w-full max-h-48 object-cover" />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <input
                autoFocus
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 text-[15px] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                    <input
                      value={opt}
                      onChange={e => updatePollOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 transition-all"
                    />
                    {pollOptions.length > 2 && (
                      <button onClick={() => removePollOption(i)} className="text-slate-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 6 && (
                <button onClick={addPollOption} className="flex items-center gap-1.5 text-sm text-violet-600 font-medium hover:text-violet-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add option
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5 pt-3 border-t border-slate-100 flex-shrink-0">
          {postType === "text" ? (
            <label className="cursor-pointer w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <Image className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          ) : <div />}

          <div className="flex items-center gap-3">
            {postType === "text" && (
              <span className={`text-xs font-medium ${content.length > 500 ? "text-red-500" : "text-slate-400"}`}>
                {content.length}/500
              </span>
            )}
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}