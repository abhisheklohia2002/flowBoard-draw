package main

import (
	"flowBoard/draw/internal/config"
	"flowBoard/draw/internal/connection"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadEnv()
	port := cfg.Port
	connection.ConnectDB(cfg)
	log.Println("Server starting on port:", port)
	r := gin.Default()
	r.Use(gin.Logger())
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
	r.Run(":" + port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

}
