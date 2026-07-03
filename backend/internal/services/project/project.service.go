package project

import (
	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/models"
	repository "flowBoard/draw/internal/repository/project"
	"strings"
)

type ProjectService interface {
	CreateProject(userId uint, req dto.CreateProjectRequest) (*dto.ProjectResponse, error)
	GetUserProject(userId uint) ([]dto.ProjectResponse, error)
}

type ProjectServiceImpl struct {
	repo repository.ProjectRepository
}

func NewProjectService(repo repository.ProjectRepository) ProjectService {
	return &ProjectServiceImpl{
		repo: repo,
	}
}

func (s *ProjectServiceImpl) CreateProject(userId uint, req dto.CreateProjectRequest) (*dto.ProjectResponse, error) {
	project := models.Project{
		UserID:      userId,
		Name:        strings.TrimSpace(req.Name),
		Description: strings.TrimSpace(req.Description),
	}

	savedProject, err := s.repo.Create(&project)
	if err != nil {
		return nil, err
	}
	return &dto.ProjectResponse{
		ID:          savedProject.ID,
		UserID:      savedProject.UserID,
		Name:        savedProject.Name,
		Description: savedProject.Description,
	}, nil
}

func (s *ProjectServiceImpl) GetUserProject(userId uint) ([]dto.ProjectResponse, error) {
	projects, err := s.repo.FindByUserId(userId)
	if err != nil {
		return nil, err
	}
	response := make([]dto.ProjectResponse, 0, len(projects))

	for _, project := range projects {
		response = append(response, dto.ProjectResponse{
			ID:          project.ID,
			UserID:      project.UserID,
			Name:        project.Name,
			Description: project.Description,
		})
	}

	return response, nil
}
