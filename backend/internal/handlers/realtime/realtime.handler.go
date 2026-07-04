package realtime

import (
	"net/http"
	"strconv"

	"flowBoard/draw/internal/helpers"
	"flowBoard/draw/internal/realtime"
	collabservice "flowBoard/draw/internal/services/collaboration"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type RealtimeHandler struct {
	hub                  *realtime.Hub
	collaborationService collabservice.CollaborationService
}

func NewRealtimeHandler(
	hub *realtime.Hub,
	collaborationService collabservice.CollaborationService,
) *RealtimeHandler {
	return &RealtimeHandler{
		hub:                  hub,
		collaborationService: collaborationService,
	}
}

var wsUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *RealtimeHandler) HandleDiagramWS(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	userNameValue, _ := c.Get("full_name")
	userName, _ := userNameValue.(string)
	if userName == "" {
		userName = "User"
	}

	diagramIDParam := c.Param("diagramID")

	diagramID64, err := strconv.ParseUint(diagramIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid diagram id",
		})
		return
	}

	diagramID := uint(diagramID64)

	canAccess, err := h.collaborationService.CanAccessDiagram(userID, diagramID)
	if err != nil || !canAccess {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "you do not have access to this diagram",
		})
		return
	}

	conn, err := wsUpgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	client := &realtime.Client{
		Hub:       h.hub,
		Conn:      conn,
		Send:      make(chan realtime.WSMessage, 256),
		DiagramID: diagramID,
		UserID:    userID,
		UserName:  userName,
	}

	h.hub.Register <- client

	go client.WritePump()
	go client.ReadPump()
}
