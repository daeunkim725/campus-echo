import React, { useState, useEffect } from "react";
import { ArrowLeft, Bell, MessageCircle, CornerDownRight, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { getShortTimeAgo } from "@/components/utils/timeUtils";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      const user = await base44.auth.me();
      if (!user) return base44.auth.redirectToLogin();
      
      const notifs = await base44.entities.Notification.filter({ user_email: user.email }, "-created_date", 50);
      setNotifications(notifs);
      setLoading(false);
      
      // Mark all as read
      const unread = notifs.filter(n => !n.read);
      for (const n of unread) {
        await base44.entities.Notification.update(n.id, { read: true });
      }
    };
    fetchNotifs();
  }, []);

  const getIcon = (type) => {
    if (type === "comment") return <MessageCircle className="w-5 h-5 text-blue-500" />;
    if (type === "reply") return <CornerDownRight className="w-5 h-5 text-purple-500" />;
    return <Calendar className="w-5 h-5 text-indigo-500" />;
  };

  const getTitle = (n) => {
    if (n.type === "comment") return `${n.actor_alias} commented on your post`;
    if (n.type === "reply") return `${n.actor_alias} replied to your comment`;
    return "Upcoming Event Reminder";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-bold text-slate-900">Notifications</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <a 
              key={n.id}
              href={createPageUrl(`PostDetail?id=${n.post_id}`)}
              className={`block bg-white p-4 rounded-2xl border transition-all hover:shadow-sm ${!n.read ? "border-indigo-200 bg-indigo-50/30" : "border-slate-100"}`}
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                  {getIcon(n.type)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{getTitle(n)}</p>
                  <p className="text-[13px] text-slate-600 mt-0.5 line-clamp-2">{n.content}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{getShortTimeAgo(n.created_date)}</p>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}