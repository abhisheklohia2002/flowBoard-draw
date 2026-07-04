package main

import (
	"flowBoard/draw/internal/auth"
	"flowBoard/draw/internal/config"
	"flowBoard/draw/internal/connection"
	collaborationHandler "flowBoard/draw/internal/handlers/collaboration"
	handlers "flowBoard/draw/internal/handlers/diagram"
	projectHandler "flowBoard/draw/internal/handlers/project"
	userHandler "flowBoard/draw/internal/handlers/users"

	"os"
	"time"

	collaborationRepo "flowBoard/draw/internal/repository/collaboration"
	diagramRepositories "flowBoard/draw/internal/repository/diagram"
	projectRepositories "flowBoard/draw/internal/repository/project"

	"flowBoard/draw/internal/repository/refresh_tokens"
	userRepo "flowBoard/draw/internal/repository/users"
	"flowBoard/draw/internal/routes"
	collaborationServices "flowBoard/draw/internal/services/collaboration"
	diagramServices "flowBoard/draw/internal/services/diagrams"
	projectServices "flowBoard/draw/internal/services/project"

	tokenservice "flowBoard/draw/internal/services/token"
	userSvc "flowBoard/draw/internal/services/users"

	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadEnv()
	port := cfg.Port
	db := connection.ConnectDB(cfg)
	// db.AutoMigrate(
	// 	&models.User{},
	// 	&models.RefreshToken{},
	// 	&models.Project{},
	// 	&models.Diagram{},
	// 	&models.Node{},
	// 	&models.Edge{},
	// 	&models.DiagramVersion{},
	// )

	log.Println("Server starting on port:", port)
	r := gin.Default()

	allowedOrigins := []string{"http://localhost:5173"}

	if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}
	log.Printf("Allowed CORS origins: %v\n", allowedOrigins)
	r.Use(cors.New(cors.Config{
		AllowOrigins: allowedOrigins,
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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

	projectRepo := projectRepositories.NewProjectRepository(db)
	projectService := projectServices.NewProjectService(projectRepo)
	projectHandler := projectHandler.NewProjectHandler(projectService)

	if err != nil {
		log.Fatal(err)
	}

	tokenService := tokenservice.NewTokenService(privateKey, cfg.JWT_ISSUER, cfg.JWTKid)
	userService := userSvc.NewUserService(userRepository, tokenService, refreshTokenRepo)
	userHandler := userHandler.NewUserHandler(userService)

	diagramRepo := diagramRepositories.NewDiagramRepository(db)
	collaborationRepo := collaborationRepo.NewCollaborationRepository(db)
	collaborationServices := collaborationServices.NewCollaborationService(userRepository, diagramRepo, collaborationRepo)
	collaborationHandler := collaborationHandler.NewCollaborationHandler(collaborationServices)

	diagramService := diagramServices.NewDiagramService(diagramRepo)
	diagramHandler := handlers.NewDiagramHandler(diagramService, collaborationServices)

	routes.Routes(r, userHandler, projectHandler, diagramHandler, collaborationHandler)

	r.Run(":" + "8080")
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

}
