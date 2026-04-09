import { useState, useEffect, useRef, useCallback } from 'react';
import type { WSEvent, WSAIStreamEvent } from '@/lib/types';

const WS_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/^http/, 'ws')
  : `ws://${window.location.host}`;

export interface AIStreamState {
  agent: WSAIStreamEvent['agent'];
  content: string;
  done: boolean;
}

interface UseWebSocketReturn {
  events: WSEvent[];
  lastEvent: WSEvent | null;
  isConnected: boolean;
  /** Live streaming AI content keyed by leadId */
  aiStreams: Map<string, AIStreamState>;
}

export function useWebSocket(campaignId: string | null): UseWebSocketReturn {
  const [events, setEvents] = useState<WSEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [aiStreams, setAIStreams] = useState<Map<string, AIStreamState>>(new Map());
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
        const data = JSON.parse(event.data) as WSEvent & { type: string };
        if (data.type === 'connected') return;

        if (data.type === 'ai_stream') {
          const stream = data as WSAIStreamEvent;
          setAIStreams((prev) => {
            const next = new Map(prev);
            const existing = next.get(stream.leadId);
            const isNewAgent = existing?.agent !== stream.agent;
            if (stream.done) {
              next.set(stream.leadId, {
                agent: stream.agent,
                content: existing?.content || '',
                done: true,
              });
            } else {
              next.set(stream.leadId, {
                agent: stream.agent,
                // Reset content when a new agent stage begins for this lead
                content: isNewAgent ? stream.token : (existing?.content || '') + stream.token,
                done: false,
              });
            }
            return next;
          });
          return; // Don't add ai_stream to general events log
        }

        setEvents((prev) => [...prev.slice(-200), data as WSEvent]);
        setLastEvent(data as WSEvent);
      } catch {
        // Ignore non-JSON messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
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
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { events, lastEvent, isConnected, aiStreams };
}
