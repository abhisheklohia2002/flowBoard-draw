package routes

import (
	diagramHandler "flowBoard/draw/internal/handlers/diagram"
	projectHandler "flowBoard/draw/internal/handlers/project"
	userHandler "flowBoard/draw/internal/handlers/users"

	"github.com/gin-gonic/gin"
)

func Routes(router *gin.Engine, userhandler userHandler.UserHandler, projectHandler projectHandler.ProjectHandler,
	diagramHandler diagramHandler.DiagramHandler,
) {
	api := router.Group("/api")
	{
		user := api.Group("user")
		{
			user.POST("register", userhandler.Register)
		}

		projects := api.Group("/projects")
		{
			projects.POST("", projectHandler.CreateProject)
			projects.GET("", projectHandler.GetProject)
		}

		projectDiagrams := api.Group("/projects/:projectID/diagrams")
		{
			projectDiagrams.POST("", diagramHandler.CreateDiagram)
			projectDiagrams.GET("", diagramHandler.GetProjectDiagrams)
		}

		diagrams := api.Group("/diagrams")
		{
			diagrams.GET("/:diagramID", diagramHandler.GetDiagram)
			diagrams.PUT("/:diagramID", diagramHandler.UpdateDiagram)
			diagrams.DELETE("/:diagramID", diagramHandler.DeleteDiagram)
			diagrams.PUT("/:diagramID/save", diagramHandler.SaveCanvas)
			diagrams.GET("/:diagramID/canvas", diagramHandler.GetCanvas)
			diagrams.GET("/:diagramID/versions", diagramHandler.GetVersions)
			diagrams.POST("/:diagramID/versions/:versionID/restore", diagramHandler.RestoreVersion)

		}
	}

}
