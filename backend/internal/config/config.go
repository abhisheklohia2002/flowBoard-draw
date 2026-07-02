package config
import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	appEnv := os.Getenv("APP_ENV")

	envFile := ".env"

	switch appEnv {
	case "production":
		envFile = ".env.production"
	case "test":
		envFile = ".env.test"
	case "development":
		envFile = ".env"
	default:
		envFile = ".env"
	}

	err := godotenv.Load(envFile)
	if err != nil {
		log.Printf("No %s file found, using system environment variables", envFile)
		return
	}

	log.Printf("Loaded environment file: %s", envFile)
}