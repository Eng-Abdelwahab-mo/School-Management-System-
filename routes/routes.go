package routes

import (
	"school-system/controllers"
	"school-system/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	api := r.Group("/api")
	{
		// Public Routes
		api.POST("/register", controllers.Register)
		api.POST("/register-admin", controllers.BootstrapAdmin)
		api.POST("/login", controllers.Login)

		// Student Routes (Protected, accessible to students)
		student := api.Group("/student")
		student.Use(middlewares.AuthMiddleware())
		student.Use(middlewares.RoleMiddleware("student"))
		{
			student.GET("/profile", controllers.ViewProfile)
		}

		// Admin Routes (Protected, accessible only to admins)
		admin := api.Group("/admin")
		admin.Use(middlewares.AuthMiddleware())
		admin.Use(middlewares.RoleMiddleware("admin"))
		{
			admin.GET("/students", controllers.ListStudents)
			admin.PUT("/students/:id", controllers.UpdateStudent)
			admin.DELETE("/students/:id", controllers.DeleteStudent)
		}
	}

	return r
}
