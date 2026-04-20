package controllers

import (
	"net/http"
	"school-system/database"
	"school-system/models"

	"github.com/gin-gonic/gin"
)

// ViewProfile returns the details of the currently authenticated user
func ViewProfile(c *gin.Context) {
	// user_id is injected into context by AuthMiddleware
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}
