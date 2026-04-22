package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware يضمن أن الطلب يحتوي على توكن JWT صالح
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. استخراج التوكن من ترويسة Authorization (Header)
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort() // إيقاف الطلب وعدم إكماله للمسار المطلوب
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		secret := os.Getenv("JWT_SECRET")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// 3. تخزين بيانات المستخدم (المعرف والدور) في سياق الطلب (Context) لاستخدامها لاحقاً في الـ Controllers
		c.Set("user_id", uint(claims["user_id"].(float64)))
		c.Set("role", claims["role"].(string))

		c.Next() // السماح للطلب بالانتقال للخطوة التالية (مثل Controller)
	}
}

// RoleMiddleware يقيد الوصول بناءً على دور المستخدم (مثلاً طالب أو أدمن)
func RoleMiddleware(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. جلب الدور الذي تم تخزينه في الـ Context بواسطة الـ AuthMiddleware
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Role not found in token"})
			c.Abort()
			return
		}

		// 2. التحقق مما إذا كان دور المستخدم يطابق الدور المطلوب للمسار
		if role.(string) != requiredRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied, insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}
