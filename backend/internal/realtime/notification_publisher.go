package realtime

import (
	"context"
	"encoding/json"
	"fmt"

	dto "flowBoard/draw/internal/DTO"

	"github.com/redis/go-redis/v9"
)

type NotificationPublisher interface {
	PublishToUser(ctx context.Context, userID uint, notification dto.NotificationResponse) error
}

type RedisNotificationPublisher struct {
	rdb *redis.Client
}

func NewRedisNotificationPublisher(rdb *redis.Client) NotificationPublisher {
	return &RedisNotificationPublisher{rdb: rdb}
}

func (p *RedisNotificationPublisher) PublishToUser(
	ctx context.Context,
	userID uint,
	notification dto.NotificationResponse,
) error {
	payload, err := json.Marshal(notification)
	if err != nil {
		return err
	}

	channel := fmt.Sprintf("user:%d:notifications", userID)

	return p.rdb.Publish(ctx, channel, payload).Err()
}