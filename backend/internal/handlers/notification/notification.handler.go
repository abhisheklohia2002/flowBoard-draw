package notification

import (
	"net/http"
	"strconv"

	"flowBoard/draw/internal/helpers"
	notificationservice "flowBoard/draw/internal/services/notifications"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	service notificationservice.NotificationService
}

func NewNotificationHandler(service notificationservice.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: service}
}

func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	notifications, err := h.service.GetUserNotifications(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to fetch notifications",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "notifications fetched successfully",
		"data":    notifications,
	})
}

func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	notificationID, err := strconv.ParseUint(c.Param("notificationID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid notification id"})
		return
	}

	if err := h.service.MarkAsRead(uint(notificationID), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to mark notification as read",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "notification marked as read",
	})
}

func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	if err := h.service.MarkAllAsRead(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to mark all notifications as read",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "all notifications marked as read",
	})
}

func (h *NotificationHandler) UnreadCount(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	count, err := h.service.UnreadCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to fetch unread count",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "unread count fetched successfully",
		"data": gin.H{
			"count": count,
		},
	})
}
