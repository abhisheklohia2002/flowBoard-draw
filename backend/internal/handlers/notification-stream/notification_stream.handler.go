package notificationStream

import (
	"context"
	"fmt"
	"io"

	"flowBoard/draw/internal/helpers"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type NotificationStreamHandler struct {
	rdb *redis.Client
}

func NewNotificationStreamHandler(rdb *redis.Client) *NotificationStreamHandler {
	return &NotificationStreamHandler{rdb: rdb}
}

func (h *NotificationStreamHandler) Stream(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	channel := fmt.Sprintf("user:%d:notifications", userID)

	pubsub := h.rdb.Subscribe(context.Background(), channel)
	defer pubsub.Close()

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("X-Accel-Buffering", "no")

	c.Stream(func(w io.Writer) bool {
		msg, err := pubsub.ReceiveMessage(context.Background())
		if err != nil {
			return false
		}

		c.SSEvent("notification", msg.Payload)
		return true
	})
}
