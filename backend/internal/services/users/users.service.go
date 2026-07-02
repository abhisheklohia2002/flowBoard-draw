package services

import (
	"errors"
	"strings"
	"time"

	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/models"
	refreshtokenrepo "flowBoard/draw/internal/repository/refresh_tokens"
	repository "flowBoard/draw/internal/repository/users"
	tokenservice "flowBoard/draw/internal/services/token"

	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	Register(req dto.RegisterUserRequest) (*dto.RegisterUserResponse, error)
}

type UserServiceImpl struct {
	repo             repository.UserRepository
	tokenService     tokenservice.TokenService
	refreshTokenRepo refreshtokenrepo.RefreshTokenRepository
}

func NewUserService(
	repo repository.UserRepository,
	tokenService tokenservice.TokenService,
	refreshTokenRepo refreshtokenrepo.RefreshTokenRepository,
) UserService {
	return &UserServiceImpl{
		repo:             repo,
		tokenService:     tokenService,
		refreshTokenRepo: refreshTokenRepo,
	}
}

func (s *UserServiceImpl) Register(req dto.RegisterUserRequest) (*dto.RegisterUserResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	fullName := strings.TrimSpace(req.FullName)

	existingUser, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, err
	}

	if existingUser != nil {
		return nil, errors.New("email already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := models.User{
		FullName:     fullName,
		Email:        email,
		PasswordHash: string(hashedPassword),
		Role:         "customer",
	}

	savedUser, err := s.repo.Create(&user)
	if err != nil {
		return nil, errors.New("failed to create user")
	}

	accessToken, err := s.tokenService.GenerateAccessToken(savedUser)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	refreshToken, err := s.tokenService.GenerateRefreshToken(savedUser)
	if err != nil {
		return nil, errors.New("failed to generate refresh token")
	}

	refreshTokenRecord := models.RefreshToken{
		Token:     refreshToken,
		UserID:    savedUser.ID,
		ExpiresAt: time.Now().AddDate(1, 0, 0),
	}

	if err := s.refreshTokenRepo.Create(&refreshTokenRecord); err != nil {
		return nil, errors.New("failed to save refresh token")
	}

	response := &dto.RegisterUserResponse{
		User: dto.AuthUserResponse{
			ID:       savedUser.ID,
			FullName: savedUser.FullName,
			Email:    savedUser.Email,
			Role:     savedUser.Role,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	return response, nil
}
