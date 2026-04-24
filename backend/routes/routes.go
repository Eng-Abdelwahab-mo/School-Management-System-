package routes

import (
	"school-system/controllers"
	"school-system/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// إضافة برمجية CORS للسماح بالطلبات من الواجهة الأمامية (http://localhost:3000)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	api := r.Group("/api")
	{
		// Public Routes
		api.POST("/register", controllers.Register)
		api.POST("/register-admin", controllers.BootstrapAdmin)
		api.POST("/login", controllers.Login)

		// Public routes for subjects (for dropdowns, etc.)
		api.GET("/subjects", controllers.ListSubjects)

		// مسارات الطالب (محمية - تتطلب تسجيل دخول ودور "طالب")
		student := api.Group("/student")
		student.Use(middlewares.AuthMiddleware())          // التحقق من التوكن
		student.Use(middlewares.RoleMiddleware("student")) // التحقق من الدور
		{
			student.GET("/profile", controllers.ViewProfile)             // جلب بيانات الملف الشخصي
			student.GET("/subjects", controllers.GetStudentGrades)       // جلب درجات الطالب
			student.GET("/subjects/:id", controllers.GetStudentSubjects) // جلب مواد الطالب
		}

		// مسارات المسؤول (محمية - تتطلب تسجيل دخول ودور "أدمن")
		admin := api.Group("/admin")
		admin.Use(middlewares.AuthMiddleware())
		admin.Use(middlewares.RoleMiddleware("admin"))
		{
			admin.GET("/students", controllers.ListStudents) // عرض قائمة الطلاب

			// Student-Subject Assignment (must come before /:id routes to avoid conflict)
			admin.POST("/students/subjects", controllers.AssignSubjectToStudent)                     // تعيين مادة لطالب
			admin.DELETE("/students/:id/subjects/:subject_id", controllers.RemoveSubjectFromStudent) // إزالة مادة من طالب
			admin.GET("/students/:id/subjects", controllers.GetStudentSubjects)                      // عرض مواد طالب معين

			// Grade Management (must come before /:id routes to avoid conflict)
			admin.GET("/grades", controllers.GetAllStudentsWithGrades)             // عرض جميع الطلاب مع درجاتهم
			admin.GET("/students/:id/grades", controllers.GetGradesByStudent)      // عرض درجات طالب معين
			admin.PUT("/students/:id/grades/:subject_id", controllers.UpdateGrade) // تحديث درجة طالب

			// Subject Management
			admin.POST("/subjects", controllers.CreateSubject)       // إنشاء مادة جديدة
			admin.PUT("/subjects/:id", controllers.UpdateSubject)    // تحديث مادة
			admin.DELETE("/subjects/:id", controllers.DeleteSubject) // حذف مادة
			admin.GET("/subjects", controllers.ListSubjects)         // عرض جميع المواد

			// Student CRUD (must come after specific student routes to avoid conflict)
			admin.PUT("/students/:id", controllers.UpdateStudent)    // تحديث بيانات طالب
			admin.DELETE("/students/:id", controllers.DeleteStudent) // حذف طالب
		}
	}

	return r
}
