import { useState, useEffect, useRef, useCallback } from 'react';
import type { WSEvent } from '@/lib/types';

const WS_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/^http/, 'ws')
  : `ws://${window.location.host}`;

interface UseWebSocketReturn {
  events: WSEvent[];
  lastEvent: WSEvent | null;
  isConnected: boolean;
}

export function useWebSocket(campaignId: string | null): UseWebSocketReturn {
  const [events, setEvents] = useState<WSEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (!campaignId) return;

    const token = localStorage.getItem('auth_token') || '';
    const url = `${WS_BASE}/ws?campaignId=${campaignId}&token=${token}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSEvent;
        if (data.type === 'connected' as any) return; // Skip connection confirmation
        setEvents((prev) => [...prev.slice(-200), data]); // Keep last 200 events
        setLastEvent(data);
      } catch {
        // Ignore non-JSON messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto-reconnect after 3s
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [campaignId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on cleanup
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { events, lastEvent, isConnected };
}
