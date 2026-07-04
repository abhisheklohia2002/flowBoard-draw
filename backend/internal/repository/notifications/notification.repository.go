package notifications

import (
	"flowBoard/draw/internal/models"

	"gorm.io/gorm"
)

type NotificationRepository interface {
	Create(notification *models.Notification) error
	FindByUserID(userID uint) ([]models.Notification, error)
	MarkAsRead(notificationID uint, userID uint) error
	MarkAllAsRead(userID uint) error
	UnreadCount(userID uint) (int64, error)
}

type NotificationRepositoryImpl struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &NotificationRepositoryImpl{db: db}
}

func (r *NotificationRepositoryImpl) Create(notification *models.Notification) error {
	return r.db.Create(notification).Error
}

func (r *NotificationRepositoryImpl) FindByUserID(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification

	err := r.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(50).
		Find(&notifications).
		Error

	return notifications, err
}

func (r *NotificationRepositoryImpl) MarkAsRead(notificationID uint, userID uint) error {
	return r.db.
		Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Update("is_read", true).
		Error
}

func (r *NotificationRepositoryImpl) MarkAllAsRead(userID uint) error {
	return r.db.
		Model(&models.Notification{}).
		Where("user_id = ? AND is_read = false", userID).
		Update("is_read", true).
		Error
}

func (r *NotificationRepositoryImpl) UnreadCount(userID uint) (int64, error) {
	var count int64

	err := r.db.
		Model(&models.Notification{}).
		Where("user_id = ? AND is_read = false", userID).
		Count(&count).
		Error

	return count, err
}
