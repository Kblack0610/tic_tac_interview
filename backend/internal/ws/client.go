package ws

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"nhooyr.io/websocket"
)

const (
	writeTimeout = 10 * time.Second
	pongWait     = 60 * time.Second
	pingInterval = 50 * time.Second
)

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan ServerMessage
	room *Room
	mark string // "X" or "O"
}

func newClient(hub *Hub, conn *websocket.Conn) *Client {
	return &Client{
		hub:  hub,
		conn: conn,
		send: make(chan ServerMessage, 16),
	}
}

func (c *Client) readPump(ctx context.Context) {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close(websocket.StatusNormalClosure, "")
	}()

	for {
		_, data, err := c.conn.Read(ctx)
		if err != nil {
			return
		}

		var msg ClientMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			c.sendMsg(ServerMessage{Type: MsgError, Message: "invalid JSON"})
			continue
		}

		c.hub.handleMessage(c, msg)
	}
}

func (c *Client) writePump(ctx context.Context) {
	ticker := time.NewTicker(pingInterval)
	defer func() {
		ticker.Stop()
		c.conn.Close(websocket.StatusNormalClosure, "")
	}()

	for {
		select {
		case msg, ok := <-c.send:
			if !ok {
				return
			}
			data, err := json.Marshal(msg)
			if err != nil {
				log.Printf("marshal error: %v", err)
				return
			}
			writeCtx, cancel := context.WithTimeout(ctx, writeTimeout)
			err = c.conn.Write(writeCtx, websocket.MessageText, data)
			cancel()
			if err != nil {
				return
			}
		case <-ticker.C:
			pingCtx, cancel := context.WithTimeout(ctx, writeTimeout)
			err := c.conn.Ping(pingCtx)
			cancel()
			if err != nil {
				return
			}
		case <-ctx.Done():
			return
		}
	}
}

func (c *Client) sendMsg(msg ServerMessage) {
	select {
	case c.send <- msg:
	default:
		// Channel full, client too slow
	}
}
