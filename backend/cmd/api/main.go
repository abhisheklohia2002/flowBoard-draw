package main

import (
	"flowBoard/draw/internal/config"
	"log"
	"os"
)

func main() {
	config.LoadEnv()

	port := os.Getenv("PORT")
	dbURL := os.Getenv("DATABASE_URL")

	log.Println("Server starting on port:", port)
	log.Println("Database URL exists:", dbURL != "")

}
