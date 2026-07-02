package repository

import (
	"errors"
	"flowBoard/draw/internal/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user *models.User) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
}

type UserRepositoryImpl struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &UserRepositoryImpl{db: db}
}

func (r *UserRepositoryImpl) Create(user *models.User) (*models.User, error) {
	err := r.db.Create(user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRegistered) {
			return nil, nil
		}
	}
	return &models.User{}, nil
}

func (r *UserRepositoryImpl) FindByEmail(email string) (*models.User, error) {
	var user = models.User{}

	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &user, nil

}
