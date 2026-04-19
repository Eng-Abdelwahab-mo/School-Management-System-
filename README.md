# Simple School System

A REST API built with Go (Gin + GORM) and PostgreSQL for a simple school system supporting basic Admin and Student operations with JWT authentication.

## Prerequisites
- Go 1.20+
- Docker and Docker Compose

## Setup

1. **Start the database:**
   ```bash
   docker-compose up -d
   ```

2. **Create a `.env` file in the root directory:**
   ```env
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=school_db
   DB_PORT=5432
   JWT_SECRET=supersecretkey
   ```

3. **Run the server:**
   ```bash
   go run main.go
   ```

## Example API Usage

### 1. Register an Admin
```bash
curl -X POST http://localhost:8080/api/register-admin \
-H "Content-Type: application/json" \
-d '{"username":"admin1", "password":"password123", "name":"Admin Joe", "email":"admin@school.com"}'
```

### 2. Register a Student
```bash
curl -X POST http://localhost:8080/api/register \
-H "Content-Type: application/json" \
-d '{"username":"student1", "password":"password123", "name":"Student Jane", "email":"student@school.com"}'
```

### 3. Login
```bash
curl -X POST http://localhost:8080/api/login \
-H "Content-Type: application/json" \
-d '{"username":"admin1", "password":"password123"}'
```
*Take the `token` from the response and use it for subsequent protected requests.*

### 4. Admin Operations (Requires Admin Token)
**List all students:**
```bash
curl -X GET http://localhost:8080/api/admin/students \
-H "Authorization: Bearer <your_admin_token>"
```

**Update a student (Replace `:id` with actual student ID):**
```bash
curl -X PUT http://localhost:8080/api/admin/students/1 \
-H "Authorization: Bearer <your_admin_token>" \
-H "Content-Type: application/json" \
-d '{"name":"Jane Updated"}'
```

**Delete a student:**
```bash
curl -X DELETE http://localhost:8080/api/admin/students/1 \
-H "Authorization: Bearer <your_admin_token>"
```

### 5. Student Operations (Requires Student Token)
**View Profile:**
```bash
curl -X GET http://localhost:8080/api/student/profile \
-H "Authorization: Bearer <your_student_token>"
```
