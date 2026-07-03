package handlers

import (
	"net/http"
	"strconv"

	dto "flowBoard/draw/internal/DTO"
	services "flowBoard/draw/internal/services/diagrams"

	"github.com/gin-gonic/gin"
)

type DiagramHandler interface {
	CreateDiagram(c *gin.Context)
	GetProjectDiagrams(c *gin.Context)
	GetDiagram(c *gin.Context)
	UpdateDiagram(c *gin.Context)
	DeleteDiagram(c *gin.Context)
	SaveCanvas(c *gin.Context)
	GetCanvas(c *gin.Context)
	GetVersions(c *gin.Context)
	RestoreVersion(c *gin.Context)
}

type DiagramHandlerImpl struct {
	service services.DiagramService
}

func NewDiagramHandler(service services.DiagramService) DiagramHandler {
	return &DiagramHandlerImpl{service: service}
}

func (h *DiagramHandlerImpl) CreateDiagram(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("projectID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid project id"})
		return
	}

	var req dto.CreateDiagramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	diagram, err := h.service.CreateDiagram(uint(projectID), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to create diagram",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "diagram created successfully",
		"data":    diagram,
	})
}

func (h *DiagramHandlerImpl) GetProjectDiagrams(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("projectID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid project id"})
		return
	}

	diagrams, err := h.service.GetProjectDiagrams(uint(projectID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to fetch diagrams",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "diagrams fetched successfully",
		"data":    diagrams,
	})
}

func (h *DiagramHandlerImpl) GetDiagram(c *gin.Context) {
	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid diagram id"})
		return
	}

	diagram, err := h.service.GetDiagram(uint(diagramID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "diagram not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "diagram fetched successfully",
		"data":    diagram,
	})
}

func (h *DiagramHandlerImpl) UpdateDiagram(c *gin.Context) {
	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid diagram id"})
		return
	}

	var req dto.UpdateDiagramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	diagram, err := h.service.UpdateDiagram(uint(diagramID), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to update diagram",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "diagram updated successfully",
		"data":    diagram,
	})
}

func (h *DiagramHandlerImpl) DeleteDiagram(c *gin.Context) {
	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid diagram id"})
		return
	}

	if err := h.service.DeleteDiagram(uint(diagramID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to delete diagram",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "diagram deleted successfully",
	})
}

func (h *DiagramHandlerImpl) SaveCanvas(c *gin.Context) {
	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid diagram id",
		})
		return
	}

	var req dto.SaveCanvasRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	userID := uint(1)

	response, err := h.service.SaveCanvas(uint(diagramID), userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to save canvas",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "canvas saved successfully",
		"data":    response,
	})
}

func (h *DiagramHandlerImpl) GetCanvas(c *gin.Context) {
	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid diagram id",
		})
		return
	}

	canvas, err := h.service.GetCanvas(uint(diagramID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "canvas not found",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "canvas fetched successfully",
		"data":    canvas,
	})
}

func (h *DiagramHandlerImpl) GetVersions(c *gin.Context) {
	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid diagram id",
		})
		return
	}

	versions, err := h.service.GetVersions(uint(diagramID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to fetch versions",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "versions fetched successfully",
		"data":    versions,
	})
}

func (h *DiagramHandlerImpl) RestoreVersion(c *gin.Context) {
	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid diagram id",
		})
		return
	}

	versionID, err := strconv.ParseUint(c.Param("versionID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid version id",
		})
		return
	}

	// Temporary until JWT middleware is ready.
	userID := uint(1)

	response, err := h.service.RestoreVersion(
		uint(diagramID),
		uint(versionID),
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to restore version",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "version restored successfully",
		"data":    response,
	})
}
