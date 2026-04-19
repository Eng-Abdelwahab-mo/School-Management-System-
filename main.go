package main

import (
	"log"
	"school-system/database"
	"school-system/routes"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file, relying on environment variables")
	}

	// Initialize Database Connection
	database.Connect()

	// Setup Routes
	r := routes.SetupRouter()

	// Run Server
	r.Run(":8080")
}
