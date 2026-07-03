package project

import (
	"flowBoard/draw/internal/models"

	"gorm.io/gorm"
)

type ProjectRepository interface {
	Create(project *models.Project) (*models.Project, error)
	FindByUserId(userID uint) ([]models.Project, error)
}

type ProjectRepositoryImpl struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) ProjectRepository {
	return &ProjectRepositoryImpl{
		db: db,
	}
}
func (r *ProjectRepositoryImpl) Create(project *models.Project) (*models.Project, error) {
	if err := r.db.Create(project).Error; err != nil {
		return nil, err
	}
	return project, nil
}
func (r *ProjectRepositoryImpl) FindByUserId(userID uint) ([]models.Project, error) {
	var projects []models.Project

	err := r.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&projects).
		Error

	return projects, err

}
