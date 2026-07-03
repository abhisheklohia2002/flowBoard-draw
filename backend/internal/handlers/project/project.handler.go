package project

import (
	dto "flowBoard/draw/internal/DTO"
	services "flowBoard/draw/internal/services/project"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProjectHandler interface {
	CreateProject(c *gin.Context)
	GetProject(c *gin.Context)
}

type ProjectHandlerImpl struct {
	service services.ProjectService
}

func NewProjectHandler(service services.ProjectService) ProjectHandler {
	return &ProjectHandlerImpl{
		service: service,
	}
}

func (h *ProjectHandlerImpl) CreateProject(c *gin.Context) {
	var req dto.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "user not found in context",
		})
		return
	}
	userID, ok := userIDValue.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "invalid user id in context",
		})
		return
	}

	project, err := h.service.CreateProject(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to create project",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "project created successfully",
		"data":    project,
	})
}

func (h *ProjectHandlerImpl) GetProject(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "user not found in context",
		})
		return
	}
	userID, ok := userIDValue.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "invalid user id in context",
		})
		return
	}

	projects, err := h.service.GetUserProject(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to fetch projects",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "projects fetched successfully",
		"data":    projects,
	})
}
