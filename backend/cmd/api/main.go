package main

import (
	"context"
	"flowBoard/draw/internal/auth"
	"flowBoard/draw/internal/config"
	"flowBoard/draw/internal/connection"
	collaborationHandler "flowBoard/draw/internal/handlers/collaboration"
	handlers "flowBoard/draw/internal/handlers/diagram"
	projectHandler "flowBoard/draw/internal/handlers/project"
	realTimeHandlers "flowBoard/draw/internal/handlers/realtime"
	userHandler "flowBoard/draw/internal/handlers/users"

	// "flowBoard/draw/internal/models"
	"flowBoard/draw/internal/realtime"

	"os"
	"time"

	collaborationRepo "flowBoard/draw/internal/repository/collaboration"
	diagramRepositories "flowBoard/draw/internal/repository/diagram"
	notificationRepositories "flowBoard/draw/internal/repository/notifications"
	projectRepositories "flowBoard/draw/internal/repository/project"

	"flowBoard/draw/internal/repository/refresh_tokens"
	userRepo "flowBoard/draw/internal/repository/users"
	"flowBoard/draw/internal/routes"
	collaborationServices "flowBoard/draw/internal/services/collaboration"
	notificationServices "flowBoard/draw/internal/services/notifications"

	diagramServices "flowBoard/draw/internal/services/diagrams"
	projectServices "flowBoard/draw/internal/services/project"

	notificationHandler "flowBoard/draw/internal/handlers/notification"
	notificationStreamHandler "flowBoard/draw/internal/handlers/notification-stream"

	tokenservice "flowBoard/draw/internal/services/token"
	userSvc "flowBoard/draw/internal/services/users"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
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
	// 	&models.DiagramCollaborator{},
	// 	&models.DiagramVersion{},
	// 	&models.Notification{},
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
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6368",
	})
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatal("failed to connect redis:", err)
	}

	log.Println("Redis connected successfully")
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

	notificationRepo := notificationRepositories.NewNotificationRepository(db)
	diagramRepo := diagramRepositories.NewDiagramRepository(db)
	collaborationRepo := collaborationRepo.NewCollaborationRepository(db)

	diagramService := diagramServices.NewDiagramService(diagramRepo)

	hub := realtime.NewHub()
	go hub.Run()

	notificationPublisher := realtime.NewRedisNotificationPublisher(rdb)
	notificationServices := notificationServices.NewNotificationService(notificationRepo, notificationPublisher)
	collaborationServices := collaborationServices.NewCollaborationService(userRepository, diagramRepo, collaborationRepo, notificationServices)
	collaborationHandler := collaborationHandler.NewCollaborationHandler(collaborationServices)
	diagramHandler := handlers.NewDiagramHandler(diagramService, collaborationServices)
	realtimeHandler := realTimeHandlers.NewRealtimeHandler(hub, collaborationServices, userRepository)

	notificationHandler := notificationHandler.NewNotificationHandler(notificationServices)
	notificationStreamHandler := notificationStreamHandler.NewNotificationStreamHandler(rdb)

	routes.Routes(r, userHandler, projectHandler, diagramHandler, collaborationHandler, *realtimeHandler, *notificationHandler, *notificationStreamHandler)

	r.Run(":" + "8080")
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

}
