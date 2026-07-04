package routes

import (
	collaborationHandler "flowBoard/draw/internal/handlers/collaboration"
	diagramHandler "flowBoard/draw/internal/handlers/diagram"
	projectHandler "flowBoard/draw/internal/handlers/project"
	userHandler "flowBoard/draw/internal/handlers/users"

	notificationHandler "flowBoard/draw/internal/handlers/notification"
	notificationStreamHandler "flowBoard/draw/internal/handlers/notification-stream"
	realTimeHandlers "flowBoard/draw/internal/handlers/realtime"
	middleware "flowBoard/draw/internal/middleware"

	"github.com/gin-gonic/gin"
)

func Routes(router *gin.Engine, userhandler userHandler.UserHandler, projectHandler projectHandler.ProjectHandler,
	diagramHandler diagramHandler.DiagramHandler,
	collaborationHandler collaborationHandler.CollaborationHandler,
	realtimeHandler realTimeHandlers.RealtimeHandler,
	notificationHandler notificationHandler.NotificationHandler,
	notificationStreamHandler notificationStreamHandler.NotificationStreamHandler,

) {
	api := router.Group("/api")
	{
		user := api.Group("user")
		{
			user.POST("register", userhandler.Register)
			user.POST("/login", userhandler.Login)
			user.POST("/refresh", userhandler.Refresh)
		}
		protected := api.Group("")

		protected.Use(middleware.AuthMiddleware())
		protected.GET("/users/search", collaborationHandler.SearchUsers)
		protected.GET("/user/self", userhandler.Self)
		protected.POST("/user/logout", userhandler.Logout)
		protected.GET("/ws/diagrams/:diagramID", realtimeHandler.HandleDiagramWS)
		projects := protected.Group("/projects")
		{
			projects.POST("", projectHandler.CreateProject)
			projects.GET("", projectHandler.GetProject)
		}

		projectDiagrams := protected.Group("/projects/:projectID/diagrams")
		{
			projectDiagrams.POST("", diagramHandler.CreateDiagram)
			projectDiagrams.GET("", diagramHandler.GetProjectDiagrams)
		}

		diagrams := protected.Group("/diagrams")
		{
			diagrams.GET("/:diagramID", diagramHandler.GetDiagram)
			diagrams.PUT("/:diagramID", diagramHandler.UpdateDiagram)
			diagrams.DELETE("/:diagramID", diagramHandler.DeleteDiagram)
			diagrams.PUT("/:diagramID/save", diagramHandler.SaveCanvas)
			diagrams.GET("/:diagramID/canvas", diagramHandler.GetCanvas)
			diagrams.GET("/:diagramID/versions", diagramHandler.GetVersions)
			diagrams.POST("/:diagramID/versions/:versionID/restore", diagramHandler.RestoreVersion)

		}

		collaboration := protected.Group("")
		{
			collaboration.GET("/diagrams/:diagramID/collaborators", collaborationHandler.GetCollaborators)
			collaboration.POST("/diagrams/:diagramID/collaborators", collaborationHandler.AddCollaborator)
			collaboration.DELETE("/diagrams/:diagramID/collaborators/:userID", collaborationHandler.RemoveCollaborator)
			collaboration.PATCH("/diagrams/:diagramID/collaborators/:userID/role", collaborationHandler.UpdateRole)
		}

		notifications := protected.Group("")
		{
			notifications.GET("/notifications", notificationHandler.GetNotifications)
			notifications.GET("/notifications/unread-count", notificationHandler.UnreadCount)
			notifications.PATCH("/notifications/:notificationID/read", notificationHandler.MarkAsRead)
			notifications.PATCH("/notifications/read-all", notificationHandler.MarkAllAsRead)
		}

		// Realtime notification SSE stream
		protected.GET("/notifications/stream", notificationStreamHandler.Stream)
	}

}
