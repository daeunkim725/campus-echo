import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";
import SchoolTopBar from "@/components/feed/SchoolTopBar";
import TopBar from "@/components/feed/TopBar";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import EventFilterPanel from "@/components/events/EventFilterPanel";
import EventCalendarView from "@/components/events/EventCalendarView";
import { Filter, Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";

export default function Events() {
  const params = new URLSearchParams(window.location.search);
  const schoolCode = params.get("school");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    locationType: "all",
    interests: []
  });

  const configSchoolCode = schoolCode || currentUser?.school;
  const schoolConfig = getSchoolConfig(configSchoolCode);

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
      let data = await base44.entities.Post.filter({ category: "events" }, "-created_date", 200);

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

  // Apply filters
  const filteredPosts = posts.filter(post => {
    // Date range filter
    if (filters.startDate && post.event_date) {
      if (isBefore(parseISO(post.event_date), parseISO(filters.startDate))) return false;
    }
    if (filters.endDate && post.event_date) {
      if (isAfter(parseISO(post.event_date), parseISO(filters.endDate))) return false;
    }

    // Location type filter
    if (filters.locationType !== "all" && post.event_location_type !== filters.locationType) {
      return false;
    }

    // Interest categories filter
    if (filters.interests.length > 0) {
      const postCategories = post.event_interest_categories || [];
      if (!filters.interests.some(cat => postCategories.includes(cat))) {
        return false;
      }
    }

    // Date selection filter
    if (selectedDate && post.event_date) {
      if (!format(parseISO(post.event_date), "yyyy-MM-dd").includes(format(selectedDate, "yyyy-MM-dd"))) {
        return false;
      }
    }

    return true;
  });

  const hasActiveFilters = filters.startDate || filters.endDate || filters.locationType !== "all" || filters.interests.length > 0 || selectedDate;

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

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Filter and View Toggle Buttons */}
        <div className="flex gap-2 sticky top-20 z-40">
          <button
            onClick={() => setShowFilterPanel(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
              hasActiveFilters
                ? "text-white shadow-md"
                : "bg-white text-slate-900 shadow-sm border border-slate-200 hover:shadow-md"
            }`}
            style={hasActiveFilters ? { backgroundColor: schoolConfig?.primary } : {}}
          >
            <Filter className="w-4 h-4" />
            Filters {hasActiveFilters && <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">Active</span>}
          </button>

          <button
            onClick={() => setShowCalendarView(!showCalendarView)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
              showCalendarView
                ? "text-white shadow-md"
                : "bg-white text-slate-900 shadow-sm border border-slate-200 hover:shadow-md"
            }`}
            style={showCalendarView ? { backgroundColor: schoolConfig?.primary } : {}}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </button>
        </div>

        {/* Calendar View */}
        {showCalendarView && (
          <div className="sticky top-36 z-30">
            <EventCalendarView
              events={posts}
              onSelectDate={(date) => {
                setSelectedDate(selectedDate && format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") ? null : date);
              }}
              schoolConfig={schoolConfig}
            />
          </div>
        )}

        {/* Events List */}
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
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-slate-500 font-medium">{hasActiveFilters ? "No events match your filters" : "No events yet"}</p>
            <p className="text-slate-400 text-sm mt-1">
              {hasActiveFilters ? "Try adjusting your filters" : "Be the first to post an event!"}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 px-6 py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: schoolConfig?.primary || "#7C3AED" }}
              >
                Create an event
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} currentUser={currentUser} onUpdate={fetchPosts} />
            ))}
          </div>
        )}
      </div>

      {showFilterPanel && (
        <EventFilterPanel
          filters={filters}
          onFilterChange={setFilters}
          schoolConfig={schoolConfig}
          onClose={() => setShowFilterPanel(false)}
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