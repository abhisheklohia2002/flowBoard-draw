package helpers

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func NormalizePEM(value string) string {
	return strings.ReplaceAll(value, `\n`, "\n")
}

func SetAuthCookies(c *gin.Context, accessToken string, refreshToken string) {
	accessMaxAge := 60 * 60
	refreshMaxAge := 60 * 60 * 24 * 365
	isProduction := false // later get from config: cfg.AppEnv == "production"

	c.SetCookie(
		"access_token",
		accessToken,
		accessMaxAge,
		"/",
		"",
		isProduction,
		true,
	)

	c.SetCookie(
		"refresh_token",
		refreshToken,
		refreshMaxAge,
		"/",
		"",
		isProduction,
		true,
	)
}
