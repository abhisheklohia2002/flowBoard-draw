package routes

import (
	userHandler "flowBoard/draw/internal/handlers/users"

	"github.com/gin-gonic/gin"
)

func Routes(router *gin.Engine, userhandler userHandler.UserHandler) {
	api := router.Group("/api")
	user := api.Group("user")
	{
		user.POST("register", userhandler.Register)
	}

}
