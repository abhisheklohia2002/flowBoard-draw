package token

import (
	"fmt"
	"time"

	"flowBoard/draw/internal/models"

	"github.com/golang-jwt/jwt/v5"
)

type TokenService interface {
	GenerateAccessToken(user *models.User) (string, error)
	GenerateRefreshToken(user *models.User) (string, error)
}

type TokenServiceImpl struct {
	privateKey string
	issuer     string
	kid        string
}

type CustomClaims struct {
	UserID    uint   `json:"user_id"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	TokenType string `json:"token_type"`
	jwt.RegisteredClaims
}

func NewTokenService(privateKey string, issuer string, kid string) TokenService {
	return &TokenServiceImpl{
		privateKey: privateKey,
		issuer:     issuer,
		kid:        kid,
	}
}

func (s *TokenServiceImpl) GenerateAccessToken(user *models.User) (string, error) {
	now := time.Now()

	claims := CustomClaims{
		UserID:    user.ID,
		Email:     user.Email,
		Role:      user.Role,
		TokenType: "access",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.issuer,
			Subject:   fmt.Sprintf("%d", user.ID),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(1 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["kid"] = s.kid
	token.Header["typ"] = "JWT"

	return token.SignedString(s.privateKey)
}

func (s *TokenServiceImpl) GenerateRefreshToken(user *models.User) (string, error) {
	now := time.Now()

	claims := CustomClaims{
		UserID:    user.ID,
		Email:     user.Email,
		Role:      user.Role,
		TokenType: "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.issuer,
			Subject:   fmt.Sprintf("%d", user.ID),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.AddDate(1, 0, 0)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["kid"] = s.kid
	token.Header["typ"] = "JWT"

	return token.SignedString(s.privateKey)
}
