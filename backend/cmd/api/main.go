package main

import (
	"flowBoard/draw/internal/auth"
	"flowBoard/draw/internal/config"
	"flowBoard/draw/internal/connection"
	userHandler "flowBoard/draw/internal/handlers/users"
	"flowBoard/draw/internal/models"
	"flowBoard/draw/internal/repository/refresh_tokens"
	userRepo "flowBoard/draw/internal/repository/users"
	"flowBoard/draw/internal/routes"
	tokenservice "flowBoard/draw/internal/services/token"
	userSvc "flowBoard/draw/internal/services/users"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadEnv()
	port := cfg.Port
	db := connection.ConnectDB(cfg)
	db.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.Project{},
		&models.Diagram{},
		&models.Node{},
		&models.Edge{},
		&models.DiagramVersion{},
	)

	log.Println("Server starting on port:", port)
	r := gin.Default()
	r.Use(gin.Logger())
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
	r.StaticFile(
		"/.well-known/jwks.json",
		"./public/.well-known/jwks.json",
	)

	//Routes setup

	userRepository := userRepo.NewUserRepository(db)
	refreshTokenRepo := refresh_tokens.NewRefreshTokenRepository(db)
	privateKey, err := auth.LoadRSAPrivateKeyFromEnv("JWT_PRIVATE_KEY")
	if err != nil {
		log.Fatal(err)
	}

	tokenService := tokenservice.NewTokenService(privateKey, cfg.JWT_ISSUER, cfg.JWTKid)
	userService := userSvc.NewUserService(userRepository, tokenService, refreshTokenRepo)
	userHandler := userHandler.NewUserHandler(userService)

	routes.Routes(r, userHandler)
	r.Run(":" + port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

}
