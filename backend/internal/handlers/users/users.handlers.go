package handlers

import (
	"net/http"

	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/helpers"
	services "flowBoard/draw/internal/services/users"

	"github.com/gin-gonic/gin"
)

type UserHandler interface {
	Register(c *gin.Context)
}

type UserHandlerImpl struct {
	service services.UserService
}

func NewUserHandler(service services.UserService) UserHandler {
	return &UserHandlerImpl{
		service: service,
	}
}

func (h *UserHandlerImpl) Register(c *gin.Context) {
	var req dto.RegisterUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	res, err := h.service.Register(req)
	if err != nil {
		if err.Error() == "email already exists" {
			c.JSON(http.StatusConflict, gin.H{
				"message": "email already exists",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to register user",
		})
		return
	}

	helpers.SetAuthCookies(c, res.AccessToken, res.RefreshToken)

	c.JSON(http.StatusCreated, gin.H{
		"message": "user registered successfully",
		"data":    res.User,
	})
}
