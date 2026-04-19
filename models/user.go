package models

import (
	"time"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"uniqueIndex;not null" json:"username"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Role         string    `gorm:"type:varchar(20);not null;default:'student'" json:"role"` // 'admin' or 'student'
	Name         string    `json:"name"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
