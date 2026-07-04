package realtime

import (
	"net/http"
	"strconv"

	"flowBoard/draw/internal/helpers"
	"flowBoard/draw/internal/realtime"
	userrepo "flowBoard/draw/internal/repository/users"
	collabservice "flowBoard/draw/internal/services/collaboration"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type RealtimeHandler struct {
	hub                  *realtime.Hub
	collaborationService collabservice.CollaborationService
	userRepo             userrepo.UserRepository
}

func NewRealtimeHandler(
	hub *realtime.Hub,
	collaborationService collabservice.CollaborationService,
	userRepo userrepo.UserRepository,
) *RealtimeHandler {
	return &RealtimeHandler{
		hub:                  hub,
		collaborationService: collaborationService,
		userRepo:             userRepo,
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

	userName := "User"

	user, err := h.userRepo.FindByID(userID)
	if err == nil && user != nil && user.FullName != "" {
		userName = user.FullName
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
