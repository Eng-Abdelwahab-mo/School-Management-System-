package controllers

import (
	"net/http"
	"school-system/database"
	"school-system/models"

	"github.com/gin-gonic/gin"
)

// ListStudents gets all users with the role 'student'
func ListStudents(c *gin.Context) {
	var students []models.User
	if err := database.DB.Where("role = ?", "student").Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": students})
}

type UpdateStudentInput struct {
	Name  string `json:"name"`
	Email string `json:"email" binding:"omitempty,email"`
}

// UpdateStudent updates a student's info
func UpdateStudent(c *gin.Context) {
	studentID := c.Param("id")

	var student models.User
	if err := database.DB.Where("id = ? AND role = ?", studentID, "student").First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	var input UpdateStudentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields if provided
	if input.Name != "" {
		student.Name = input.Name
	}
	if input.Email != "" {
		student.Email = input.Email
	}

	if err := database.DB.Save(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Student updated successfully", "data": student})
}

// DeleteStudent removes a student account
func DeleteStudent(c *gin.Context) {
	studentID := c.Param("id")

	var student models.User
	if err := database.DB.Where("id = ? AND role = ?", studentID, "student").First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	if err := database.DB.Delete(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Student deleted successfully"})
}
