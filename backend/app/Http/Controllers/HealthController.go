package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Ping is a simple health check endpoint
func Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "pong",
		"status":  "healthy",
	})
}
