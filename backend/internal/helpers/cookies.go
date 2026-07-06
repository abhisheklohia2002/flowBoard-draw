package helpers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func SetAuthCookies(c *gin.Context, accessToken string, refreshToken string) {
	accessMaxAge := 60 * 60
	refreshMaxAge := 60 * 60 * 24 * 365
	httpOnly := true

	envFile := ".env"
	isProduction := os.Getenv("APP_ENV") == envFile

	sameSite := http.SameSiteLaxMode
	// if isProduction {
	// 	sameSite = http.SameSiteNoneMode
	// }

	// http.SetCookie(c.Writer, &http.Cookie{
	// 	Name:     "access_token",
	// 	Value:    accessToken,
	// 	Path:     "/",
	// 	MaxAge:   accessMaxAge,
	// 	HttpOnly: true,
	// 	Secure:   !isProduction,
	// 	SameSite: sameSite,
	// })

	// http.SetCookie(c.Writer, &http.Cookie{
	// 	Name:     "refresh_token",
	// 	Value:    refreshToken,
	// 	Path:     "/",
	// 	MaxAge:   refreshMaxAge,
	// 	HttpOnly: true,
	// 	Secure:   !isProduction,
	// 	SameSite: http.SameSiteNoneMode,
	// })

	c.SetSameSite(sameSite)

	c.SetCookie(
		"access_token",
		accessToken,
		accessMaxAge,
		"/",
		"",
		!isProduction,
		httpOnly,
	)

	c.SetCookie(
		"refresh_token",
		refreshToken,
		refreshMaxAge,
		"/",
		"",
		!isProduction,
		httpOnly,
	)
}

func RequireUserID(c *gin.Context) (uint, bool) {
	value, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "unauthorized",
		})
		return 0, false
	}

	userID, ok := value.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "invalid user id",
		})
		return 0, false
	}

	return userID, true
}

func ClearAuthCookies(c *gin.Context) {
	isProduction := os.Getenv("APP_ENV") == "production"
	httpOnly := true

	sameSite := http.SameSiteLaxMode
	c.SetSameSite(sameSite)
	// if isProduction {
	// 	sameSite = http.SameSiteNoneMode
	// }

	// http.SetCookie(c.Writer, &http.Cookie{
	// 	Name:     "access_token",
	// 	Value:    "",
	// 	Path:     "/",
	// 	MaxAge:   -1,
	// 	HttpOnly: true,
	// 	Secure:   !isProduction,
	// 	SameSite: sameSite,
	// })

	// http.SetCookie(c.Writer, &http.Cookie{
	// 	Name:     "refresh_token",
	// 	Value:    "",
	// 	Path:     "/",
	// 	MaxAge:   -1,
	// 	HttpOnly: true,
	// 	Secure:   !isProduction,
	// 	SameSite: sameSite,
	// })

	c.SetCookie("access_token", "", -1, "/", "", !isProduction, httpOnly)
	c.SetCookie("refresh_token", "", -1, "/", "", !isProduction, httpOnly)
}
