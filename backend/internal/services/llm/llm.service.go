package llm

import (
	dto "flowBoard/draw/internal/DTO"
	llmRepo "flowBoard/draw/internal/repository/llm"
)

type LLMService interface {
	SaveDiagram(diagramID uint, response dto.LLMResponse) error
}

type LLMServiceImpl struct {
	llmRepository llmRepo.LLMRepository
}

func NewLLMService(llmRepository llmRepo.LLMRepository) LLMService {
	return &LLMServiceImpl{
		llmRepository: llmRepository,
	}
}

func (s *LLMServiceImpl) SaveDiagram(
	diagramID uint,
	response dto.LLMResponse,
) error {

	return s.llmRepository.SaveDiagram(diagramID, response)
}
