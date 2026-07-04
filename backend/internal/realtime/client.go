package realtime

import (
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	Hub       *Hub
	Conn      *websocket.Conn
	Send      chan WSMessage
	DiagramID uint
	UserID    uint
	UserName  string
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		_ = c.Conn.Close()
	}()

	for {
		var msg WSMessage

		if err := c.Conn.ReadJSON(&msg); err != nil {
			log.Println("websocket read error:", err)
			break
		}

		msg.DiagramID = c.DiagramID
		msg.UserID = c.UserID
		msg.UserName = c.UserName

		c.Hub.Broadcast <- BroadcastMessage{
			Sender:  c,
			Message: msg,
		}
	}
}

func (c *Client) WritePump() {
	defer func() {
		_ = c.Conn.Close()
	}()

	for msg := range c.Send {
		if err := c.Conn.WriteJSON(msg); err != nil {
			log.Println("websocket write error:", err)
			break
		}
	}
}