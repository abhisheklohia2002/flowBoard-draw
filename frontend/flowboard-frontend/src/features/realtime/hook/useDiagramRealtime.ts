import { useCallback, useEffect, useRef, useState } from "react";
import { RealtimeMessage } from "../types";
import { getRealtimeURL } from "../realtime-url";


interface UseDiagramRealtimeOptions {
  diagramID: number;
  enabled?: boolean;
  onMessage: (message: RealtimeMessage) => void;
}

export function useDiagramRealtime({
  diagramID,
  enabled = true,
  onMessage,
}: UseDiagramRealtimeOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const sendMessage = useCallback((message: Omit<RealtimeMessage, "diagram_id">) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(
      JSON.stringify({
        ...message,
        diagram_id: diagramID,
      })
    );

    return true;
  }, [diagramID]);

  useEffect(() => {
    if (!enabled || !diagramID || Number.isNaN(diagramID)) {
      return;
    }

    let manuallyClosed = false;

    const connect = () => {
      const url = getRealtimeURL(diagramID);
      const socket = new WebSocket(url);

      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as RealtimeMessage;
          onMessageRef.current(message);
        } catch (error) {
          console.error("Invalid realtime message", error);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);

        if (manuallyClosed) {
          return;
        }

        const attempts = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempts;

        const delay = Math.min(1000 * attempts, 5000);

        reconnectTimerRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      manuallyClosed = true;

      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }

      socketRef.current?.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [diagramID, enabled]);

  return {
    isConnected,
    sendMessage,
  };
}