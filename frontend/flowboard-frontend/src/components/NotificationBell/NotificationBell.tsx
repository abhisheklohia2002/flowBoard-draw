import { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useMarkNotificationRead, useNotifications, useUnreadCount } from "@/features/notification/hooks/useNotifications";
interface NotificationBellProps {
  className?: string;
}
export function NotificationBell({className}:NotificationBellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const notificationsQuery = useNotifications();
  const unreadCountQuery = useUnreadCount();
  const markRead = useMarkNotificationRead();

  const count = unreadCountQuery.data ?? 0;

  const handleClickNotification = (notification: any) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }

    setOpen(false);

    if (notification.diagram_id) {
      navigate(`/diagrams/${notification.diagram_id}`);
    }
  };

  return (
    <div className={`relative`}>
      <Button
        size="icon"
        variant="ghost"
        className="relative text-slate-300 hover:bg-slate-900 hover:text-white"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-5 w-5" />

        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Notifications</p>
            <p className="text-xs text-slate-500">Collaboration updates</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificationsQuery.data?.length === 0 && (
              <div className="p-5 text-center text-sm text-slate-500">
                No notifications yet
              </div>
            )}

            {notificationsQuery.data?.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleClickNotification(notification)}
                className={[
                  "block w-full border-b border-white/5 px-4 py-3 text-left hover:bg-slate-900",
                  notification.is_read ? "bg-slate-950" : "bg-cyan-500/10",
                ].join(" ")}
              >
                <p className="text-sm font-medium text-white">
                  {notification.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {notification.message}
                </p>
                <p className="mt-2 text-[11px] text-slate-600">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}