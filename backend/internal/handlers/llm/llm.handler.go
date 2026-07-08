package llm

import (
	"encoding/json"
	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/config"
	"flowBoard/draw/internal/helpers"
	llmService "flowBoard/draw/internal/services/llm"
	userService "flowBoard/draw/internal/services/users"
	"fmt"
	"strconv"

	"net/http"

	"github.com/gin-gonic/gin"
)

type LLMHandlers interface {
	ModelInvoke(c *gin.Context)
}

type LLMHandlersImpl struct {
	llmService  llmService.LLMService
	userService userService.UserService
}

func NewLLMHandlers(llmService llmService.LLMService, userService userService.UserService) LLMHandlers {
	return &LLMHandlersImpl{
		llmService:  llmService,
		userService: userService,
	}
}

func (h *LLMHandlersImpl) ModelInvoke(c *gin.Context) {
	cfg := config.LoadEnv()
	userId := c.Param("userId")

	var req dto.LLMDiagram

	if err := c.ShouldBindJSON(&req); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request",
		})
		return
	}

	body, err := helpers.Post(
		cfg.LLM_URL+"/llm-diagram",
		req,
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	var llmResponse dto.LLMResponse

	err = json.Unmarshal(body, &llmResponse)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	err = h.llmService.SaveDiagram(req.Diagram, llmResponse)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to save diagram",
			"error":   err.Error(),
		})
		return
	}

	val64, err := strconv.ParseUint(userId, 10, 0)
	if err != nil {
		fmt.Println("Error parsing string:", err)
		return
	}
	val := uint(val64)

	user, err := h.userService.UpdateUser(val)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to User Update",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Diagram generated and saved successfully",
		"data":    llmResponse,
		"user":    user,
	})
}
