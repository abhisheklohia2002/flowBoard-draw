package llm

import (
	"encoding/json"
	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/helpers"
	llmService "flowBoard/draw/internal/services/llm"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LLMHandlers interface {
	ModelInvoke(c *gin.Context)
}

type LLMHandlersImpl struct {
	llmService llmService.LLMService
}

func NewLLMHandlers(llmService llmService.LLMService) LLMHandlers {
	return &LLMHandlersImpl{
		llmService: llmService,
	}
}

func (h *LLMHandlersImpl) ModelInvoke(c *gin.Context) {

	var req dto.LLMDiagram

	if err := c.ShouldBindJSON(&req); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request",
		})
		return
	}

	body, err := helpers.Post(
		"http://localhost:3000/llm-diagram",
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

	c.JSON(http.StatusOK, gin.H{
		"message": "Diagram generated and saved successfully",
		"data":    llmResponse,
	})
}
