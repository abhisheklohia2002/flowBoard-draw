package connection

import (
	"flowBoard/draw/internal/config"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func ConnectDB(cfg config.Config) *gorm.DB {
	databaseURL := cfg.DB_URL

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Warn,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	if databaseURL != "" {
		log.Println("connecting to render database")

		database, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
			Logger: newLogger,
		})
		if err != nil {
			log.Fatal("failed to connect render database: ", err)
		}

		return database
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		cfg.DBHost,
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBName,
		cfg.DBPort,
		cfg.DBSSLMode,
		cfg.DBTimeZone,
	)

	log.Printf(cfg.DBHost,
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBName,
		cfg.DBPort,
		cfg.DBSSLMode,
		cfg.DBTimeZone)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database: ", err)
	}

	log.Println("Database connected successfully")

	return db
}
