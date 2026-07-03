package routes

import (
	projectHandler "flowBoard/draw/internal/handlers/project"
	userHandler "flowBoard/draw/internal/handlers/users"

	"github.com/gin-gonic/gin"
)

func Routes(router *gin.Engine, userhandler userHandler.UserHandler, projectHandler projectHandler.ProjectHandler) {
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
	}

}
