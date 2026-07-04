package collaboration

import (
	"net/http"
	"strconv"

	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/helpers"
	collabservice "flowBoard/draw/internal/services/collaboration"

	"github.com/gin-gonic/gin"
)

type CollaborationHandler interface {
	SearchUsers(c *gin.Context)
	AddCollaborator(c *gin.Context)
	GetCollaborators(c *gin.Context)
	RemoveCollaborator(c *gin.Context)
	UpdateRole(c *gin.Context)
}

type CollaborationHandlerImpl struct {
	service collabservice.CollaborationService
}

func NewCollaborationHandler(service collabservice.CollaborationService) CollaborationHandler {
	return &CollaborationHandlerImpl{service: service}
}

func (h *CollaborationHandlerImpl) SearchUsers(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	query := c.Query("query")

	users, err := h.service.SearchUsers(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to search users",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "users fetched successfully",
		"data":    users,
	})
}

func (h *CollaborationHandlerImpl) AddCollaborator(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid diagram id"})
		return
	}

	var req dto.AddCollaboratorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.AddCollaborator(uint(diagramID), userID, req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "failed to add collaborator",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "collaborator added successfully",
	})
}

func (h *CollaborationHandlerImpl) GetCollaborators(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid diagram id"})
		return
	}

	collaborators, err := h.service.GetCollaborators(uint(diagramID), userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "failed to fetch collaborators",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "collaborators fetched successfully",
		"data":    collaborators,
	})
}

func (h *CollaborationHandlerImpl) RemoveCollaborator(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid diagram id"})
		return
	}

	targetUserID, err := strconv.ParseUint(c.Param("userID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	if err := h.service.RemoveCollaborator(uint(diagramID), userID, uint(targetUserID)); err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "failed to remove collaborator",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "collaborator removed successfully",
	})
}

func (h *CollaborationHandlerImpl) UpdateRole(c *gin.Context) {
	userID, ok := helpers.RequireUserID(c)
	if !ok {
		return
	}

	diagramID, err := strconv.ParseUint(c.Param("diagramID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid diagram id"})
		return
	}

	targetUserID, err := strconv.ParseUint(c.Param("userID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	var req dto.UpdateCollaboratorRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.UpdateRole(uint(diagramID), userID, uint(targetUserID), req.Role); err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "failed to update role",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "collaborator role updated successfully",
	})
}