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

		// مسارات الطالب (محمية - تتطلب تسجيل دخول ودور "طالب")
		student := api.Group("/student")
		student.Use(middlewares.AuthMiddleware()) // التحقق من التوكن
		student.Use(middlewares.RoleMiddleware("student")) // التحقق من الدور
		{
			student.GET("/profile", controllers.ViewProfile) // جلب بيانات الملف الشخصي
		}

		// مسارات المسؤول (محمية - تتطلب تسجيل دخول ودور "أدمن")
		admin := api.Group("/admin")
		admin.Use(middlewares.AuthMiddleware())
		admin.Use(middlewares.RoleMiddleware("admin"))
		{
			admin.GET("/students", controllers.ListStudents) // عرض قائمة الطلاب
			admin.PUT("/students/:id", controllers.UpdateStudent) // تحديث بيانات طالب
			admin.DELETE("/students/:id", controllers.DeleteStudent) // حذف طالب
		}
	}

	return r
}
