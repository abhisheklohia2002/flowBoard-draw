package realtime

import (
	"encoding/json"
	"log"
)

type BroadcastMessage struct {
	Sender  *Client
	Message WSMessage
}

type Hub struct {
	Rooms map[uint]map[*Client]bool

	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan BroadcastMessage
}

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[uint]map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan BroadcastMessage),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.registerClient(client)

		case client := <-h.Unregister:
			h.unregisterClient(client)

		case broadcast := <-h.Broadcast:
			h.broadcastToRoom(broadcast)
		}
	}
}

func (h *Hub) registerClient(client *Client) {
	if h.Rooms[client.DiagramID] == nil {
		h.Rooms[client.DiagramID] = make(map[*Client]bool)
	}

	h.Rooms[client.DiagramID][client] = true

	log.Printf("user %d joined diagram %d", client.UserID, client.DiagramID)

	payload, _ := json.Marshal(ClientInfo{
		UserID:   client.UserID,
		UserName: client.UserName,
	})

	msg := WSMessage{
		Type:      EventUserJoined,
		DiagramID: client.DiagramID,
		UserID:    client.UserID,
		UserName:  client.UserName,
		Payload:   payload,
	}

	h.sendToRoom(client.DiagramID, msg, nil)
}

func (h *Hub) unregisterClient(client *Client) {
	room := h.Rooms[client.DiagramID]
	if room == nil {
		return
	}

	if _, ok := room[client]; ok {
		delete(room, client)
		close(client.Send)

		log.Printf("user %d left diagram %d", client.UserID, client.DiagramID)

		payload, _ := json.Marshal(ClientInfo{
			UserID:   client.UserID,
			UserName: client.UserName,
		})

		msg := WSMessage{
			Type:      EventUserLeft,
			DiagramID: client.DiagramID,
			UserID:    client.UserID,
			UserName:  client.UserName,
			Payload:   payload,
		}

		h.sendToRoom(client.DiagramID, msg, client)
	}

	if len(room) == 0 {
		delete(h.Rooms, client.DiagramID)
	}
}

func (h *Hub) broadcastToRoom(broadcast BroadcastMessage) {
	h.sendToRoom(
		broadcast.Sender.DiagramID,
		broadcast.Message,
		broadcast.Sender,
	)
}

func (h *Hub) sendToRoom(diagramID uint, msg WSMessage, exclude *Client) {
	room := h.Rooms[diagramID]
	if room == nil {
		return
	}

	for client := range room {
		if exclude != nil && client == exclude {
			continue
		}

		select {
		case client.Send <- msg:
		default:
			close(client.Send)
			delete(room, client)
		}
	}
}
