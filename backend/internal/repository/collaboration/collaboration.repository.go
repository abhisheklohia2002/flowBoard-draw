package collaboration

import (
	"errors"
	"flowBoard/draw/internal/models"

	"gorm.io/gorm"
)

type CollaborationRepository interface {
	Add(collaborator *models.DiagramCollaborator) error
	FindByDiagramID(diagramID uint) ([]models.DiagramCollaborator, error)
	FindByDiagramAndUser(diagramID uint, userID uint) (*models.DiagramCollaborator, error)
	Remove(diagramID uint, userID uint) error
	UpdateRole(diagramID uint, userID uint, role string) error
}

type CollaborationRepositoryImpl struct {
	db *gorm.DB
}

func NewCollaborationRepository(db *gorm.DB) CollaborationRepository {
	return &CollaborationRepositoryImpl{db: db}
}
func (r *CollaborationRepositoryImpl) Add(collaborator *models.DiagramCollaborator) error {
	return r.db.Create(collaborator).Error
}

func (r *CollaborationRepositoryImpl) FindByDiagramID(diagramID uint) ([]models.DiagramCollaborator, error) {
	var collaborators []models.DiagramCollaborator

	err := r.db.
		Preload("User").
		Where("diagram_id = ?", diagramID).
		Order("created_at DESC").
		Find(&collaborators).
		Error

	return collaborators, err
}

func (r *CollaborationRepositoryImpl) Remove(diagramID uint, userID uint) error {
	return r.db.
		Where("diagram_id = ? AND user_id = ?", diagramID, userID).
		Delete(&models.DiagramCollaborator{}).
		Error
}

func (r *CollaborationRepositoryImpl) UpdateRole(diagramID uint, userID uint, role string) error {
	return r.db.
		Model(&models.DiagramCollaborator{}).
		Where("diagram_id = ? AND user_id = ?", diagramID, userID).
		Update("role", role).
		Error
}


func (r *CollaborationRepositoryImpl) FindByDiagramAndUser(diagramID uint, userID uint) (*models.DiagramCollaborator, error) {
	var collaborator models.DiagramCollaborator

	err := r.db.
		Where("diagram_id = ? AND user_id = ?", diagramID, userID).
		First(&collaborator).
		Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return &collaborator, nil
}


