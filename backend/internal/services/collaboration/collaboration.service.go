package collaboration

import (
	"context"
	"errors"
	"fmt"
	"strings"

	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/models"
	collabrepo "flowBoard/draw/internal/repository/collaboration"
	diagramrepo "flowBoard/draw/internal/repository/diagram"
	userrepo "flowBoard/draw/internal/repository/users"
	notificationservice "flowBoard/draw/internal/services/notifications"
)

type CollaborationService interface {
	SearchUsers(query string, currentUserID uint) ([]dto.SearchUserResponse, error)
	AddCollaborator(diagramID uint, currentUserID uint, req dto.AddCollaboratorRequest) error
	GetCollaborators(diagramID uint, currentUserID uint) ([]dto.DiagramCollaboratorResponse, error)
	RemoveCollaborator(diagramID uint, currentUserID uint, targetUserID uint) error
	UpdateRole(diagramID uint, currentUserID uint, targetUserID uint, role string) error

	CanAccessDiagram(userID uint, diagramID uint) (bool, error)
	CanEditDiagram(userID uint, diagramID uint) (bool, error)
	IsOwner(userID uint, diagramID uint) (bool, error)
}

type CollaborationServiceImpl struct {
	userRepo            userrepo.UserRepository
	diagramRepo         diagramrepo.DiagramRepository
	collabRepo          collabrepo.CollaborationRepository
	notificationService notificationservice.NotificationService
}

func NewCollaborationService(
	userRepo userrepo.UserRepository,
	diagramRepo diagramrepo.DiagramRepository,
	collabRepo collabrepo.CollaborationRepository,
	notificationService notificationservice.NotificationService,
) CollaborationService {
	return &CollaborationServiceImpl{
		userRepo:            userRepo,
		diagramRepo:         diagramRepo,
		collabRepo:          collabRepo,
		notificationService: notificationService,
	}
}

func (s *CollaborationServiceImpl) SearchUsers(query string, currentUserID uint) ([]dto.SearchUserResponse, error) {
	query = strings.TrimSpace(query)

	if len(query) < 2 {
		return []dto.SearchUserResponse{}, nil
	}

	users, err := s.userRepo.SearchUsers(query, currentUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to search users: %w", err)
	}

	res := make([]dto.SearchUserResponse, 0, len(users))

	for _, user := range users {
		res = append(res, dto.SearchUserResponse{
			ID:       user.ID,
			FullName: user.FullName,
			Email:    user.Email,
			Role:     user.Role,
		})
	}

	return res, nil
}

func (s *CollaborationServiceImpl) IsOwner(userID uint, diagramID uint) (bool, error) {
	return s.diagramRepo.IsDiagramOwner(diagramID, userID)
}

func (s *CollaborationServiceImpl) CanAccessDiagram(userID uint, diagramID uint) (bool, error) {
	isOwner, err := s.IsOwner(userID, diagramID)
	if err != nil {
		return false, err
	}

	if isOwner {
		return true, nil
	}

	collaborator, err := s.collabRepo.FindByDiagramAndUser(diagramID, userID)
	if err != nil {
		return false, err
	}

	return collaborator != nil, nil
}

func (s *CollaborationServiceImpl) CanEditDiagram(userID uint, diagramID uint) (bool, error) {
	isOwner, err := s.IsOwner(userID, diagramID)
	if err != nil {
		return false, err
	}

	if isOwner {
		return true, nil
	}

	collaborator, err := s.collabRepo.FindByDiagramAndUser(diagramID, userID)
	if err != nil {
		return false, err
	}

	if collaborator == nil {
		return false, nil
	}

	return collaborator.Role == "editor", nil
}

func (s *CollaborationServiceImpl) AddCollaborator(diagramID uint, currentUserID uint, req dto.AddCollaboratorRequest) error {
	if req.UserID == currentUserID {
		return errors.New("you cannot add yourself as collaborator")
	}

	isOwner, err := s.IsOwner(currentUserID, diagramID)
	if err != nil {
		return err
	}

	if !isOwner {
		return errors.New("only diagram owner can add collaborators")
	}

	existing, err := s.collabRepo.FindByDiagramAndUser(diagramID, req.UserID)
	if err != nil {
		return err
	}

	if existing != nil {
		return errors.New("user is already collaborator")
	}

	collaborator := models.DiagramCollaborator{
		DiagramID:   diagramID,
		UserID:      req.UserID,
		Role:        req.Role,
		InvitedByID: currentUserID,
	}

	if err := s.collabRepo.Add(&collaborator); err != nil {
		return fmt.Errorf("failed to add collaborator: %w", err)
	}
	inviter, _ := s.userRepo.FindByID(currentUserID)
	diagram, _ := s.diagramRepo.FindByID(diagramID)

	inviterName := "Someone"
	if inviter != nil {
		inviterName = inviter.FullName
	}

	diagramName := "a diagram"
	var projectID *uint

	if diagram != nil {
		diagramName = diagram.Name
		projectID = &diagram.ProjectID
	}

	_ = s.notificationService.CreateCollaborationInvite(
		context.Background(),
		req.UserID,
		inviterName,
		diagramID,
		projectID,
		diagramName,
	)

	return nil
}

func (s *CollaborationServiceImpl) GetCollaborators(diagramID uint, currentUserID uint) ([]dto.DiagramCollaboratorResponse, error) {
	canAccess, err := s.CanAccessDiagram(currentUserID, diagramID)
	if err != nil {
		return nil, err
	}

	if !canAccess {
		return nil, errors.New("you do not have access to this diagram")
	}

	collaborators, err := s.collabRepo.FindByDiagramID(diagramID)
	if err != nil {
		return nil, fmt.Errorf("failed to find collaborators: %w", err)
	}

	res := make([]dto.DiagramCollaboratorResponse, 0, len(collaborators))

	for _, item := range collaborators {
		res = append(res, dto.DiagramCollaboratorResponse{
			ID:        item.ID,
			DiagramID: item.DiagramID,
			UserID:    item.UserID,
			Role:      item.Role,
			User: dto.CollaboratorUserResponse{
				ID:       item.User.ID,
				FullName: item.User.FullName,
				Email:    item.User.Email,
				Role:     item.User.Role,
			},
		})
	}

	return res, nil
}

func (s *CollaborationServiceImpl) RemoveCollaborator(diagramID uint, currentUserID uint, targetUserID uint) error {
	isOwner, err := s.IsOwner(currentUserID, diagramID)
	if err != nil {
		return err
	}

	if !isOwner {
		return errors.New("only diagram owner can remove collaborators")
	}

	return s.collabRepo.Remove(diagramID, targetUserID)
}

func (s *CollaborationServiceImpl) UpdateRole(diagramID uint, currentUserID uint, targetUserID uint, role string) error {
	isOwner, err := s.IsOwner(currentUserID, diagramID)
	if err != nil {
		return err
	}

	if !isOwner {
		return errors.New("only diagram owner can update collaborator role")
	}

	return s.collabRepo.UpdateRole(diagramID, targetUserID, role)
}
