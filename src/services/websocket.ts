import { API_BASE_URL } from '../constants';
import type { ClientMessage, ServerMessage } from './ws-types';

type MessageHandler = (msg: ServerMessage) => void;

const MAX_RETRIES = 5;
const BASE_DELAY = 1000;

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private onMessage: MessageHandler;
  private onDisconnect: () => void;
  private retries = 0;
  private closed = false;

  constructor(onMessage: MessageHandler, onDisconnect: () => void) {
    this.onMessage = onMessage;
    this.onDisconnect = onDisconnect;
  }

  connect(): void {
    this.closed = false;
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/api/ws';
    console.log('[WS] connecting to:', wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('[WS] connected!');
      this.retries = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);
        console.log('[WS] recv:', msg.type);
        this.onMessage(msg);
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = (e) => {
      console.log('[WS] closed, code:', e.code, 'reason:', e.reason);
      if (this.closed) return;
      this.onDisconnect();
      this.reconnect();
    };

    this.ws.onerror = (e) => {
      console.log('[WS] error:', e);
      this.ws?.close();
    };
  }

  send(msg: ClientMessage): void {
    console.log('[WS] send:', msg.type, 'readyState:', this.ws?.readyState);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      console.warn('[WS] not connected, dropping message:', msg.type);
    }
  }

  close(): void {
    this.closed = true;
    this.ws?.close();
    this.ws = null;
  }

  private reconnect(): void {
    if (this.retries >= MAX_RETRIES || this.closed) return;

    const delay = BASE_DELAY * Math.pow(2, this.retries);
    this.retries++;

    setTimeout(() => {
      if (!this.closed) {
        this.connect();
      }
    }, delay);
  }
}
