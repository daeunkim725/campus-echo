import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";
import SchoolTopBar from "@/components/feed/SchoolTopBar";
import TopBar from "@/components/feed/TopBar";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import { useThemeTokens } from "@/components/utils/ThemeProvider";
import EventCalendarView from "@/components/events/EventCalendarView";
import EventFilterPanel from "@/components/events/EventFilterPanel";
import { Filter, Calendar as CalendarIcon, List } from "lucide-react";
import { isSameDay, isSameWeek, isSameMonth, parseISO } from "date-fns";

export default function Events() {
  const params = new URLSearchParams(window.location.search);
  const schoolCode = params.get("school");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [viewMode, setViewMode] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ locationType: "all", interests: [], dateRange: "all" });
  const [selectedDate, setSelectedDate] = useState(null);

  const configSchoolCode = schoolCode || currentUser?.school || (currentUser?.role === 'admin' ? 'ETH' : null);
  const schoolConfig = getSchoolConfig(configSchoolCode);
  const tokens = useThemeTokens(schoolConfig);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      if (!u?.school_verified && u?.role !== "admin") {
        window.location.href = createPageUrl("Onboarding");
        return;
      }
      if (u?.role !== "admin" && u?.school !== schoolCode && schoolCode) {
        window.location.href = createPageUrl("Events") + `?school=${u.school}`;
      }
    }).catch(() => base44.auth.redirectToLogin(createPageUrl("Events") + (schoolCode ? `?school=${schoolCode}` : "")));
  }, [schoolCode]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let data = await base44.entities.Post.filter({ category: "events", deleted: false }, "-created_date", 200);

      // Filter to this school's posts
      if (configSchoolCode) {
        data = data.filter(p => {
          if (!p.department || p.department === "all") return true;
          if (configSchoolCode === "ETH") return p.department.startsWith("D-") || p.department === "ETH";
          return p.department === configSchoolCode;
        });
      }

      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [configSchoolCode]);

  const filteredPosts = posts.filter(p => {
    // Location Filter
    if (filters.locationType !== "all") {
      const isOffCampus = p.event_type === "off-campus" || (p.event_location && p.event_location.toLowerCase().includes("off campus"));
      if (filters.locationType === "on-campus" && isOffCampus) return false;
      if (filters.locationType === "off-campus" && !isOffCampus) return false;
    }

    // Interests Filter
    if (filters.interests.length > 0) {
      if (!p.event_interests || !filters.interests.some(i => p.event_interests.includes(i))) return false;
    }

    // Date Range Filter
    if (filters.dateRange !== "all" && p.event_date) {
      const eDate = parseISO(p.event_date);
      const today = new Date();
      if (filters.dateRange === "today" && !isSameDay(eDate, today)) return false;
      if (filters.dateRange === "this-week" && !isSameWeek(eDate, today)) return false;
      if (filters.dateRange === "this-month" && !isSameMonth(eDate, today)) return false;
    }

    // Selected Date Filter (from Calendar)
    if (viewMode === "calendar" && selectedDate && p.event_date) {
      if (!isSameDay(parseISO(p.event_date), selectedDate)) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: schoolConfig.bg }}>
      {schoolCode ? (
        <SchoolTopBar
          currentUser={currentUser}
          onUserUpdate={u => setCurrentUser(u)}
          onPost={() => setShowCreate(true)}
          activePage="events"
          schoolConfig={schoolConfig}
          schoolCode={schoolCode}
        />
      ) : (
        <TopBar
          currentUser={currentUser}
          onUserUpdate={u => setCurrentUser(u)}
          onPost={() => setShowCreate(true)}
          postLabel="Post Event"
          activePage="events"
          schoolConfig={schoolConfig}
        />
      )}

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Actions Bar */}
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex gap-1">
            <button
              onClick={() => { setViewMode("list"); setSelectedDate(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "calendar" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
          >
            <Filter className="w-3.5 h-3.5" /> Filters
            {(filters.locationType !== "all" || filters.interests.length > 0 || filters.dateRange !== "all") && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tokens.primary }} />
            )}
          </button>
        </div>

        {viewMode === "calendar" && (
          <EventCalendarView 
            events={posts} 
            onSelectDate={(date) => setSelectedDate(date)} 
            schoolConfig={schoolConfig} 
          />
        )}

        <div className="space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="space-y-1">
                    <div className="h-3 w-28 bg-slate-200 rounded" />
                    <div className="h-2.5 w-16 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-full" />
                  <div className="h-3.5 bg-slate-200 rounded w-4/5" />
                </div>
              </div>
            ))
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-5xl mb-4">📅</div>
              <p className="text-slate-500 font-medium">No events found</p>
              <p className="text-slate-400 text-sm mt-1">Try changing your filters or post a new event!</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 px-5 py-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: tokens.primary }}
              >
                Create an event
              </button>
            </div>
          ) : (
            filteredPosts.map(post => (
              <PostCard key={post.id} post={post} currentUser={currentUser} onUpdate={fetchPosts} schoolConfig={schoolConfig} />
            ))
          )}
        </div>
      </div>

      {showFilters && (
        <EventFilterPanel
          filters={filters}
          onFilterChange={setFilters}
          schoolConfig={schoolConfig}
          onClose={() => setShowFilters(false)}
        />
      )}

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchPosts}
          currentUser={currentUser}
          schoolConfig={schoolConfig}
          isEvent={true}
        />
      )}
    </div>
  );
}