import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationKeys } from "./useNotifications";
import type { Notification } from "../api/notifications.api";

export function useNotificationStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiBaseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

    const eventSource = new EventSource(
      `${apiBaseURL}/api/notifications/stream`,
      {
        withCredentials: true,
      }
    );

    eventSource.addEventListener("notification", (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification;

        queryClient.setQueryData<Notification[]>(
          notificationKeys.list,
          (old = []) => [notification, ...old]
        );

        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount,
        });

        toast.info(notification.title, {
          description: notification.message,
        });
      } catch (error) {
        console.error("Failed to parse notification", error);
      }
    });

    eventSource.onerror = () => {
      console.error("Notification stream disconnected");
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);
}