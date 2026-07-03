package config

import (
	"flowBoard/draw/internal/helpers"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv string
	Port   string

	DBHost          string
	DBPort          string
	DBUser          string
	DBPassword      string
	DBName          string
	DBSSLMode       string
	DBTimeZone      string
	JWTKid          string
	JWT_PRIVATE_KEY string
	JWT_ISSUER      string
}

func LoadEnv() Config {
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
		return Config{}
	}

	log.Printf("Loaded environment file: %s", envFile)

	if err := godotenv.Load(envFile); err != nil {
		log.Printf("No %s file found, using system env", envFile)
	}

	return Config{
		AppEnv: helpers.GetEnv("APP_ENV", "development"),
		Port:   helpers.GetEnv("PORT", "8080"),

		DBHost:          helpers.GetEnv("DB_HOST", "localhost"),
		DBPort:          helpers.GetEnv("DB_PORT", "5435"),
		DBUser:          helpers.GetEnv("DB_USERNAME", "ai_travel_user"),
		DBPassword:      helpers.GetEnv("DB_PASSWORD", "ai_travel_pass"),
		DBName:          helpers.GetEnv("DB_NAME", "ai_travel_db"),
		DBSSLMode:       helpers.GetEnv("DB_SSLMODE", "disable"),
		DBTimeZone:      helpers.GetEnv("DB_TIMEZONE", "Asia/Kolkata"),
		JWTKid:          helpers.GetEnv("JWT_KID", "********"),
		JWT_PRIVATE_KEY: helpers.NormalizePEM(helpers.GetEnv("JWT_PRIVATE_KEY", "private_key")),
		JWT_ISSUER:      helpers.GetEnv("JWT_ISSUER", "JWT_ISSUER"),
	}
}
