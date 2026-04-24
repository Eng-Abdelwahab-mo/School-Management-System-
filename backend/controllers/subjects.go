package controllers

import (
	"net/http"
	"strconv"

	"school-system/database"
	"school-system/models"

	"github.com/gin-gonic/gin"
)

// ListSubjects returns all subjects
func ListSubjects(c *gin.Context) {
	var subjects []models.Subject
	if err := database.DB.Find(&subjects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subjects"})
		return
	}
	c.JSON(http.StatusOK, subjects)
}

// CreateSubject creates a new subject (admin only)
func CreateSubject(c *gin.Context) {
	var subject models.Subject
	if err := c.ShouldBindJSON(&subject); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&subject).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subject"})
		return
	}

	c.JSON(http.StatusCreated, subject)
}

// UpdateSubject updates an existing subject (admin only)
func UpdateSubject(c *gin.Context) {
	id := c.Param("id")
	var subject models.Subject

	if err := database.DB.First(&subject, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subject not found"})
		return
	}

	if err := c.ShouldBindJSON(&subject); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Save(&subject).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update subject"})
		return
	}

	c.JSON(http.StatusOK, subject)
}

// DeleteSubject deletes a subject (admin only)
func DeleteSubject(c *gin.Context) {
	id := c.Param("id")
	var subject models.Subject

	if err := database.DB.First(&subject, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subject not found"})
		return
	}

	if err := database.DB.Delete(&subject).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete subject"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subject deleted successfully"})
}

// AssignSubjectToStudent assigns a subject to a student (admin only)
func AssignSubjectToStudent(c *gin.Context) {
	var input struct {
		StudentID uint `json:"student_id"`
		SubjectID uint `json:"subject_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify student exists
	var student models.User
	if err := database.DB.Where("id = ? AND role = 'student'", input.StudentID).First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	// Verify subject exists
	var subject models.Subject
	if err := database.DB.First(&subject, input.SubjectID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subject not found"})
		return
	}

	// Check if already assigned
	var existing models.StudentSubject
	if err := database.DB.Where("student_id = ? AND subject_id = ?", input.StudentID, input.SubjectID).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Subject already assigned to student"})
		return
	}

	// Create enrollment
	enrollment := models.StudentSubject{
		StudentID: input.StudentID,
		SubjectID: input.SubjectID,
	}

	if err := database.DB.Create(&enrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign subject"})
		return
	}

	// Create empty grade record
	grade := models.Grade{
		StudentID:    input.StudentID,
		SubjectID:    input.SubjectID,
		MidtermGrade: 0,
		FinalGrade:   0,
		TotalGrade:   0,
		LetterGrade:  "N/A",
	}

	if err := database.DB.Create(&grade).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create grade record"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Subject assigned successfully", "enrollment": enrollment})
}

// RemoveSubjectFromStudent removes a subject from a student (admin only)
func RemoveSubjectFromStudent(c *gin.Context) {
	studentID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	subjectID, _ := strconv.ParseUint(c.Param("subject_id"), 10, 32)

	var enrollment models.StudentSubject
	if err := database.DB.Where("student_id = ? AND subject_id = ?", studentID, subjectID).First(&enrollment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Enrollment not found"})
		return
	}

	if err := database.DB.Delete(&enrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove subject"})
		return
	}

	// Also delete the grade record
	var grade models.Grade
	if err := database.DB.Where("student_id = ? AND subject_id = ?", studentID, subjectID).First(&grade).Error; err == nil {
		database.DB.Delete(&grade)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subject removed successfully"})
}

// GetStudentSubjects returns all subjects for a student
func GetStudentSubjects(c *gin.Context) {
	studentID, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var enrollments []models.StudentSubject
	if err := database.DB.Preload("Subject").Where("student_id = ?", studentID).Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subjects"})
		return
	}

	subjects := make([]gin.H, len(enrollments))
	for i, e := range enrollments {
		subjects[i] = gin.H{
			"id":          e.Subject.ID,
			"name":        e.Subject.Name,
			"code":        e.Subject.Code,
			"description": e.Subject.Description,
			"credits":     e.Subject.Credits,
		}
	}

	c.JSON(http.StatusOK, subjects)
}

// GetStudentGrades returns all grades for a student (for student profile)
func GetStudentGrades(c *gin.Context) {
	studentID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	var grades []models.Grade
	if err := database.DB.Preload("Subject").Where("student_id = ?", studentID).Find(&grades).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch grades"})
		return
	}

	c.JSON(http.StatusOK, grades)
}

// GetGradesByStudent returns all grades for a specific student (admin only)
func GetGradesByStudent(c *gin.Context) {
	studentID, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var grades []models.Grade
	if err := database.DB.Preload("Subject").Where("student_id = ?", studentID).Find(&grades).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch grades"})
		return
	}

	c.JSON(http.StatusOK, grades)
}

// UpdateGrade updates a student's grade (admin only)
func UpdateGrade(c *gin.Context) {
	studentID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	subjectID, _ := strconv.ParseUint(c.Param("subject_id"), 10, 32)

	var input struct {
		MidtermGrade float64 `json:"midterm_grade"`
		FinalGrade   float64 `json:"final_grade"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var grade models.Grade
	if err := database.DB.Where("student_id = ? AND subject_id = ?", studentID, subjectID).First(&grade).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grade record not found"})
		return
	}

	grade.MidtermGrade = input.MidtermGrade
	grade.FinalGrade = input.FinalGrade
	grade.TotalGrade = input.MidtermGrade + input.FinalGrade

	// Calculate letter grade
	if grade.TotalGrade >= 90 {
		grade.LetterGrade = "A"
	} else if grade.TotalGrade >= 80 {
		grade.LetterGrade = "B"
	} else if grade.TotalGrade >= 70 {
		grade.LetterGrade = "C"
	} else if grade.TotalGrade >= 60 {
		grade.LetterGrade = "D"
	} else {
		grade.LetterGrade = "F"
	}

	if err := database.DB.Save(&grade).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update grade"})
		return
	}

	c.JSON(http.StatusOK, grade)
}

// GetAllStudentsWithGrades returns all students with their grades (admin only)
func GetAllStudentsWithGrades(c *gin.Context) {
	var students []models.User
	if err := database.DB.Where("role = 'student'").Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	type StudentWithGrades struct {
		ID     uint   `json:"id"`
		Name   string `json:"name"`
		Email  string `json:"email"`
		Grades []models.Grade
	}

	result := make([]StudentWithGrades, len(students))
	for i, student := range students {
		var grades []models.Grade
		database.DB.Preload("Subject").Where("student_id = ?", student.ID).Find(&grades)
		result[i] = StudentWithGrades{
			ID:     student.ID,
			Name:   student.Name,
			Email:  student.Email,
			Grades: grades,
		}
	}

	c.JSON(http.StatusOK, result)
}
