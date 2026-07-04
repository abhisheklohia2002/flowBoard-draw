package notifications

import (
	"context"
	"fmt"

	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/models"
	"flowBoard/draw/internal/realtime"
	notificationrepo "flowBoard/draw/internal/repository/notifications"
)

type NotificationService interface {
	CreateCollaborationInvite(
		ctx context.Context,
		targetUserID uint,
		inviterName string,
		diagramID uint,
		projectID *uint,
		diagramName string,
	) error

	GetUserNotifications(userID uint) ([]dto.NotificationResponse, error)
	MarkAsRead(notificationID uint, userID uint) error
	MarkAllAsRead(userID uint) error
	UnreadCount(userID uint) (int64, error)
}

type NotificationServiceImpl struct {
	repo      notificationrepo.NotificationRepository
	publisher realtime.NotificationPublisher
}

func NewNotificationService(
	repo notificationrepo.NotificationRepository,
	publisher realtime.NotificationPublisher,
) NotificationService {
	return &NotificationServiceImpl{
		repo:      repo,
		publisher: publisher,
	}
}

func (s *NotificationServiceImpl) CreateCollaborationInvite(
	ctx context.Context,
	targetUserID uint,
	inviterName string,
	diagramID uint,
	projectID *uint,
	diagramName string,
) error {
	notification := models.Notification{
		UserID:    targetUserID,
		Type:      "collaboration_invite",
		Title:     "New collaboration invite",
		Message:   fmt.Sprintf("%s invited you to collaborate on %s", inviterName, diagramName),
		DiagramID: &diagramID,
		ProjectID: projectID,
		IsRead:    false,
	}

	if err := s.repo.Create(&notification); err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}

	res := mapNotificationToResponse(notification)

	// Realtime delivery. If Redis fails, do not fail collaborator creation.
	_ = s.publisher.PublishToUser(ctx, targetUserID, res)

	return nil
}

func (s *NotificationServiceImpl) GetUserNotifications(userID uint) ([]dto.NotificationResponse, error) {
	notifications, err := s.repo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	res := make([]dto.NotificationResponse, 0, len(notifications))
	for _, item := range notifications {
		res = append(res, mapNotificationToResponse(item))
	}

	return res, nil
}

func (s *NotificationServiceImpl) MarkAsRead(notificationID uint, userID uint) error {
	return s.repo.MarkAsRead(notificationID, userID)
}

func (s *NotificationServiceImpl) MarkAllAsRead(userID uint) error {
	return s.repo.MarkAllAsRead(userID)
}

func (s *NotificationServiceImpl) UnreadCount(userID uint) (int64, error) {
	return s.repo.UnreadCount(userID)
}

func mapNotificationToResponse(n models.Notification) dto.NotificationResponse {
	return dto.NotificationResponse{
		ID:        n.ID,
		UserID:    n.UserID,
		Type:      n.Type,
		Title:     n.Title,
		Message:   n.Message,
		DiagramID: n.DiagramID,
		ProjectID: n.ProjectID,
		IsRead:    n.IsRead,
		CreatedAt: n.CreatedAt,
	}
}
