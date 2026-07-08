package llm

import (
	"encoding/json"
	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LLMRepository interface {
	SaveDiagram(
		diagramID uint,
		response dto.LLMResponse,
	) error
}

type LLMRepositoryImpl struct {
	db *gorm.DB
}

func NewLLMRepository(db *gorm.DB) LLMRepository {
	return &LLMRepositoryImpl{
		db: db,
	}
}

func (r *LLMRepositoryImpl) SaveDiagram(
	diagramID uint,
	response dto.LLMResponse,
) error {

	tx := r.db.Begin()

	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.Where("diagram_id = ?", diagramID).Delete(&models.Edge{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Where("diagram_id = ?", diagramID).Delete(&models.Node{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	const (
		spacingX = 320.0
		spacingY = 220.0
	)

	for i, entity := range response.Entities {

		data, err := json.Marshal(gin.H{
			"attributes": entity.Attributes,
		})
		if err != nil {
			tx.Rollback()
			return err
		}

		style, _ := json.Marshal(gin.H{
			"background": "#0f172a",
			"border":     "#22d3ee",
			"color":      "#ffffff",
		})

		node := models.Node{
			DiagramID: diagramID,

			ClientNodeID: entity.ID,

			Type:  "entity",
			Label: entity.Name,

			PositionX: float64(i%3) * spacingX,
			PositionY: float64(i/3) * spacingY,

			Width:  240,
			Height: 180,

			Data:  data,
			Style: style,
		}

		if err := tx.Create(&node).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	for _, rel := range response.Relationships {

		style, _ := json.Marshal(gin.H{
			"stroke":      "#67e8f9",
			"strokeWidth": 2,
		})

		edge := models.Edge{
			DiagramID: diagramID,

			ClientEdgeID: uuid.NewString(),

			SourceNodeID: rel.From,
			TargetNodeID: rel.To,

			SourceHandle: "source-right",
			TargetHandle: "target-left",

			Label: rel.Label,

			EdgeType: "smoothstep",

			Style: style,
		}

		if err := tx.Create(&edge).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	err := tx.Model(&models.Diagram{}).
		Where("id = ?", diagramID).
		Updates(map[string]any{
			"zoom_level": 1,
			"pan_x":      0,
			"pan_y":      0,
		}).Error

	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
