package diagram

import (
	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/models"
	"fmt"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type DiagramRepository interface {
	Create(diagram *models.Diagram) (*models.Diagram, error)
	FindByProjectID(projectID uint) ([]models.Diagram, error)
	FindByID(id uint) (*models.Diagram, error)
	Update(diagram *models.Diagram) (*models.Diagram, error)
	Delete(id uint) error
	FindCanvasByID(diagramID uint) (*models.Diagram, error)
	FindVersionsByDiagramID(diagramID uint) ([]models.DiagramVersion, error)
	FindVersionByID(diagramID uint, versionID uint) (*models.DiagramVersion, error)
	SaveCanvas(diagramID uint, userID uint, nodes []models.Node, edges []models.Edge, viewport dto.CanvasViewport, snapshot datatypes.JSON, changeNote string) (uint, error)
}

type DiagramRepositoryImpl struct {
	db *gorm.DB
}

func NewDiagramRepository(db *gorm.DB) DiagramRepository {
	return &DiagramRepositoryImpl{db: db}
}

func (r *DiagramRepositoryImpl) Create(diagram *models.Diagram) (*models.Diagram, error) {
	if err := r.db.Create(diagram).Error; err != nil {
		return nil, err
	}

	return diagram, nil
}

func (r *DiagramRepositoryImpl) FindByProjectID(projectID uint) ([]models.Diagram, error) {
	var diagrams []models.Diagram

	err := r.db.
		Where("project_id = ?", projectID).
		Order("created_at DESC").
		Find(&diagrams).
		Error

	return diagrams, err
}

func (r *DiagramRepositoryImpl) FindByID(id uint) (*models.Diagram, error) {
	var diagram models.Diagram

	if err := r.db.First(&diagram, id).Error; err != nil {
		return nil, err
	}

	return &diagram, nil
}

func (r *DiagramRepositoryImpl) Update(diagram *models.Diagram) (*models.Diagram, error) {
	if err := r.db.Save(diagram).Error; err != nil {
		return nil, err
	}

	return diagram, nil
}

func (r *DiagramRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&models.Diagram{}, id).Error
}

func (r *DiagramRepositoryImpl) SaveCanvas(
	diagramID uint,
	userID uint,
	nodes []models.Node,
	edges []models.Edge,
	viewport dto.CanvasViewport,
	snapshot datatypes.JSON,
	changeNote string,
) (uint, error) {
	var versionNumber uint

	err := r.db.Transaction(func(tx *gorm.DB) error {
		var diagram models.Diagram

		if err := tx.First(&diagram, diagramID).Error; err != nil {
			return fmt.Errorf("diagram not found: %w", err)
		}

		if err := tx.Where("diagram_id = ?", diagramID).Delete(&models.Edge{}).Error; err != nil {
			return fmt.Errorf("failed to delete old edges: %w", err)
		}

		if err := tx.Where("diagram_id = ?", diagramID).Delete(&models.Node{}).Error; err != nil {
			return fmt.Errorf("failed to delete old nodes: %w", err)
		}

		if len(nodes) > 0 {
			if err := tx.Create(&nodes).Error; err != nil {
				return fmt.Errorf("failed to create nodes: %w", err)
			}
		}

		if len(edges) > 0 {
			if err := tx.Create(&edges).Error; err != nil {
				return fmt.Errorf("failed to create edges: %w", err)
			}
		}

		if err := tx.Model(&models.Diagram{}).
			Where("id = ?", diagramID).
			Updates(map[string]any{
				"pan_x":      viewport.X,
				"pan_y":      viewport.Y,
				"zoom_level": viewport.Zoom,
			}).Error; err != nil {
			return fmt.Errorf("failed to update diagram viewport: %w", err)
		}

		var lastVersion models.DiagramVersion

		err := tx.
			Where("diagram_id = ?", diagramID).
			Order("version_number DESC").
			First(&lastVersion).
			Error

		if err != nil && err != gorm.ErrRecordNotFound {
			return fmt.Errorf("failed to get last version: %w", err)
		}

		versionNumber = lastVersion.VersionNumber + 1

		version := models.DiagramVersion{
			DiagramID:     diagramID,
			CreatedByID:   userID,
			VersionNumber: versionNumber,
			Snapshot:      snapshot,
			ChangeNote:    changeNote,
		}

		if err := tx.Create(&version).Error; err != nil {
			return fmt.Errorf("failed to create diagram version: %w", err)
		}

		return nil
	})

	if err != nil {
		return 0, err
	}

	return versionNumber, nil
}

func (r *DiagramRepositoryImpl) FindCanvasByID(diagramID uint) (*models.Diagram, error) {
	var diagram models.Diagram

	err := r.db.
		Preload("Nodes").
		Preload("Edges").
		First(&diagram, diagramID).
		Error

	if err != nil {
		return nil, err
	}

	return &diagram, nil
}

func (r *DiagramRepositoryImpl) FindVersionsByDiagramID(diagramID uint) ([]models.DiagramVersion, error) {
	var versions []models.DiagramVersion

	err := r.db.
		Where("diagram_id = ?", diagramID).
		Order("version_number DESC").
		Find(&versions).
		Error

	return versions, err
}

func (r *DiagramRepositoryImpl) FindVersionByID(
	diagramID uint,
	versionID uint,
) (*models.DiagramVersion, error) {
	var version models.DiagramVersion

	err := r.db.
		Where("id = ? AND diagram_id = ?", versionID, diagramID).
		First(&version).
		Error

	if err != nil {
		return nil, err
	}

	return &version, nil
}
