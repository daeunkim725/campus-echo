import React, { useState } from "react";
import { X, Image, Send, BarChart2, Plus, Trash2, Smile } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getMoodLabel } from "@/components/profile/ProfilePanel";
import { getSchoolDepartments, getSchoolLevels } from "@/components/utils/schoolDepartments";
import GiphyBrowser from "@/components/feed/GiphyBrowser";
import { PlayableGif } from "@/components/ui/PlayableGif";
import { useThemeTokens } from "@/components/utils/ThemeProvider";
import { getCleanAlias, getAliasEmoji } from "@/components/utils/moodUtils";

const CATEGORIES = ["general", "academics", "housing", "food", "rants", "confessions", "advice"];

export default function CreatePostModal({ onClose, onCreated, currentUser, schoolConfig, isEvent = false, quoteParentPost }) {
  const schoolCode = currentUser?.school;
  const departments = getSchoolDepartments(schoolCode);
  const levels = getSchoolLevels(schoolCode);
  const tokens = useThemeTokens(schoolConfig);
  const primary = tokens.primary;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(isEvent ? "events" : "general");
  const [department, setDepartment] = useState(null);
  const [level, setLevel] = useState(null);
  const [postType, setPostType] = useState("text");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [stillUrl, setStillUrl] = useState(null);
  const [showGiphy, setShowGiphy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState("on-campus");
  const [eventInterests, setEventInterests] = useState([]);

  const INTEREST_CATEGORIES = [
  { id: "social", label: "Social" },
  { id: "sports", label: "Sports" },
  { id: "academic", label: "Academic" },
  { id: "cultural", label: "Cultural" },
  { id: "professional", label: "Professional" },
  { id: "wellness", label: "Wellness" },
  { id: "arts", label: "Arts" },
  { id: "tech", label: "Tech" },
  { id: "other", label: "Other" }];


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setGifUrl(null);
    setStillUrl(null);
  };

  const handleGifSelect = (gif) => {
    setGifUrl(gif.gif_url);
    setStillUrl(gif.still_url);
    setImageFile(null);
    setImagePreview(null);
    setShowGiphy(false);
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

  const isQuote = !!quoteParentPost;
  const activePostType = isQuote ? "quote" : postType;

  // Title is optional for quotes, required for original posts
  let isValid = false;
  if (isQuote) {
      isValid = true;
  } else if (title.trim().length > 0) {
      if (activePostType === "text") {
          isValid = title.trim().length <= 200;
      } else {
          isValid = pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2;
      }
  }

  if (isEvent) {
    isValid = isValid && !!eventDate && !!eventTime && eventLocation.trim().length > 0;
  }

  const toggleInterest = (catId) => {
    setEventInterests((prev) =>
    prev.includes(catId) ?
    prev.filter((id) => id !== catId) :
    [...prev, catId]
    );
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);

    const alias = getMoodLabel(currentUser?.mood) || "Anonymous";
    const color = primary;

    let image_url = null;
    if (imageFile) {
      const res = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = res.file_url;
    }

    const postData = {
      title: title.trim(),
      content: activePostType === "poll" ? pollQuestion.trim() : content.trim() || null,
      category,
      department: department || null,
      academic_level: level || null,
      post_type: activePostType,
      parent_post_id: isQuote ? quoteParentPost.id : undefined,
      image_url,
      gif_url: gifUrl,
      still_url: stillUrl,
      author_alias: alias,
      author_color: color,
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
      voted_up_by: [],
      voted_down_by: []
    };

    if (isEvent) {
      postData.event_date = eventDate;
      postData.event_time = eventTime;
      postData.event_location = eventLocation.trim();
      postData.event_type = eventType;
      postData.event_interests = eventInterests;
      postData.interested_users = [{
        user_id: currentUser?.id,
        email: currentUser?.email,
        reminder_minutes: 60,
        notified: false
      }];
    }

    if (postType === "poll") {
      postData.poll_question = pollQuestion.trim();
      postData.poll_options = pollOptions.
      filter((o) => o.trim()).
      map((o) => ({ text: o.trim(), votes: 0, voted_by: [] }));
    }

    await base44.entities.Post.create(postData);
    setLoading(false);
    onCreated?.();
    onClose();
  };

  const activeStyle = { backgroundColor: primary, borderColor: primary };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900">{isEvent ? "New Event" : "New Post"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Post Type Toggle */}
          {!isEvent &&
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
              <button
              onClick={() => setPostType("text")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${postType === "text" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>

                💬 Text Post
              </button>
              <button
              onClick={() => setPostType("poll")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${postType === "poll" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>

                <BarChart2 className="w-3.5 h-3.5" /> Poll
              </button>
            </div>
          }

          {/* Event Details */}
          {isEvent &&
          <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date <span className="text-red-400">*</span></p>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-slate-800 text-[14px] focus:outline-none focus:border-slate-400" style={{ borderColor: eventDate ? primary : undefined }} onFocus={(e) => e.target.style.borderColor = primary} onBlur={(e) => e.target.style.borderColor = eventDate ? primary : ""} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Time <span className="text-red-400">*</span></p>
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-slate-800 text-[14px] focus:outline-none focus:border-slate-400" style={{ borderColor: eventTime ? primary : undefined }} onFocus={(e) => e.target.style.borderColor = primary} onBlur={(e) => e.target.style.borderColor = eventTime ? primary : ""} />
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location <span className="text-red-400">*</span></p>
                <input type="text" placeholder="Where is it happening?" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-slate-800 text-[14px] focus:outline-none focus:border-slate-400" style={{ borderColor: eventLocation ? primary : undefined }} onFocus={(e) => e.target.style.borderColor = primary} onBlur={(e) => e.target.style.borderColor = eventLocation ? primary : ""} />
              </div>
              <div className="col-span-2">
                <div className="flex gap-2">
                  <button onClick={() => setEventType("on-campus")} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${eventType === "on-campus" ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`} style={{ backgroundColor: eventType === "on-campus" ? primary : undefined }}>On Campus</button>
                  <button onClick={() => setEventType("off-campus")} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${eventType === "off-campus" ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`} style={{ backgroundColor: eventType === "off-campus" ? primary : undefined }}>Off Campus</button>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_CATEGORIES.map((cat) =>
                <button key={cat.id} onClick={() => toggleInterest(cat.id)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${eventInterests.includes(cat.id) ? "text-white border-transparent" : "border-slate-200 text-slate-600 hover:border-slate-300"}`} style={{ backgroundColor: eventInterests.includes(cat.id) ? primary : undefined }}>{cat.label}</button>
                )}
                </div>
              </div>
            </div>
          }

          {/* Title (mandatory for non-quotes) */}
          {!isQuote && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Subject <span className="text-red-400">*</span>
                </p>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's this about?"
                  maxLength={200}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 text-[15px] focus:outline-none transition-all"
                  style={{ outline: title.trim() ? "none" : undefined }}
                  onFocus={(e) => e.target.style.borderColor = primary}
                  onBlur={(e) => e.target.style.borderColor = ""} />

              </div>
          )}

          {/* Category */}
          {!isEvent &&
          <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</p>
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map((cat) =>
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all capitalize border ${category === cat ? "text-white border-transparent" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`
                }
                style={category === cat ? activeStyle : {}}>

                    {cat}
                  </button>
              )}
              </div>
            </div>
          }

          {/* Department tags (school-specific) */}
          {departments.length > 0 &&
          <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Department <span className="normal-case font-normal text-slate-400">(optional)</span>
              </p>
              <div className="flex gap-1 flex-wrap">
                {departments.map((d) =>
              <button
                key={d.code}
                onClick={() => setDepartment(department === d.code ? null : d.code)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all border ${department === d.code ? "text-white border-transparent" : "border-slate-200 text-slate-400 hover:border-slate-300 bg-white"}`
                }
                style={department === d.code ? activeStyle : {}}>

                    {d.code}
                  </button>
              )}
              </div>
            </div>
          }

          {/* Academic Level */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Academic Level <span className="normal-case font-normal text-slate-400">(optional)</span>
            </p>
            <div className="flex gap-1.5">
              {levels.map((l) =>
              <button
                key={l}
                onClick={() => setLevel(level === l ? null : l)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${level === l ? "text-white border-transparent" : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"}`
                }
                style={level === l ? activeStyle : {}}>

                  {l}
                </button>
              )}
            </div>
          </div>

          {/* Quote Parent Preview */}
          {isQuote && (
              <div className="mb-4 rounded-xl border border-slate-200 p-3 bg-slate-50 opacity-80 pointer-events-none">
                  <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm bg-slate-100">
                          {getAliasEmoji(quoteParentPost.author_alias)}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-800 capitalize">{getCleanAlias(quoteParentPost.author_alias)}</p>
                  </div>
                  {quoteParentPost.title && <p className="font-semibold text-slate-900 text-xs mb-0.5 line-clamp-1">{quoteParentPost.title}</p>}
                  {quoteParentPost.content && <p className="text-slate-600 text-[11px] leading-[16px] line-clamp-2">{quoteParentPost.content}</p>}
              </div>
          )}

          {/* Content or Poll */}
          {activePostType === "text" || activePostType === "quote" ?
          <>
              <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add more details... (optional)"
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-200 p-4 text-slate-800 placeholder:text-slate-400 text-[15px] focus:outline-none transition-all"
              onFocus={(e) => e.target.style.borderColor = primary}
              onBlur={(e) => e.target.style.borderColor = ""} />

              {imagePreview &&
            <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="" className="w-full max-h-48 object-cover" />
                  <button onClick={() => {setImageFile(null);setImagePreview(null);}} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
            }
              {gifUrl &&
            <div className="relative rounded-xl overflow-hidden">
                  <PlayableGif gifUrl={gifUrl} stillUrl={stillUrl} className="w-full max-h-48" />
                  <button onClick={() => {setGifUrl(null);setStillUrl(null);}} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
            }
            </> :

          <div className="space-y-3">
              <input
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 text-[15px] focus:outline-none transition-all"
              onFocus={(e) => e.target.style.borderColor = primary}
              onBlur={(e) => e.target.style.borderColor = ""} />

              <div className="space-y-2">
                {pollOptions.map((opt, i) =>
              <div key={i} className="flex gap-2 items-center">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                    <input
                  value={opt}
                  onChange={(e) => updatePollOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all" />

                    {pollOptions.length > 2 &&
                <button onClick={() => removePollOption(i)} className="text-slate-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                }
                  </div>
              )}
              </div>
              {pollOptions.length < 6 &&
            <button onClick={addPollOption} className="flex items-center gap-1.5 text-xs font-medium hover:opacity-75 transition-opacity" style={{ color: primary }}>
                  <Plus className="w-3.5 h-3.5" /> Add option
                </button>
            }
            </div>
          }
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5 pt-3 border-t border-slate-100 flex-shrink-0 relative">
          {activePostType === "text" || activePostType === "quote" ?
          <div className="flex items-center gap-2">
              <label className="cursor-pointer w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <Image className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <button
              type="button"
              onClick={() => setShowGiphy(!showGiphy)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">

                <Smile className="w-3.5 h-3.5" />
              </button>
              {showGiphy && <GiphyBrowser onSelect={handleGifSelect} onClose={() => setShowGiphy(false)} />}
            </div> :
          <div />}

          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:opacity-90"
            style={{ backgroundColor: primary }}>

            {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Post
          </button>
        </div>
      </div>
    </div>);

}