package models

import (
	"time"
)

// Subject represents a course/subject in the school
type Subject struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null;uniqueIndex" json:"name"`
	Code        string    `gorm:"not null;uniqueIndex" json:"code"`
	Description string    `json:"description"`
	Credits     int       `gorm:"default:3" json:"credits"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// StudentSubject represents the enrollment of a student in a subject
type StudentSubject struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	StudentID uint      `gorm:"not null;index" json:"student_id"`
	SubjectID uint      `gorm:"not null;index" json:"subject_id"`
	Student   User      `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Subject   Subject   `gorm:"foreignKey:SubjectID" json:"subject,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Grade represents a student's grade in a subject
type Grade struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	StudentID   uint      `gorm:"not null;index" json:"student_id"`
	SubjectID   uint      `gorm:"not null;index" json:"subject_id"`
	Student     User      `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Subject     Subject   `gorm:"foreignKey:SubjectID" json:"subject,omitempty"`
	MidtermGrade float64  `gorm:"default:0" json:"midterm_grade"`
	FinalGrade   float64  `gorm:"default:0" json:"final_grade"`
	TotalGrade   float64  `gorm:"default:0" json:"total_grade"`
	LetterGrade  string   `json:"letter_grade"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
