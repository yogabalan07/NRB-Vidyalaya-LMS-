# API Documentation

## Base URL

- Development: `http://localhost:4000/api`
- Production: `https://api.nrbvidyalaya.com/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

## Response Format

### Success
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error
```json
{
  "status": "error",
  "message": "Error description"
}
```

### Paginated
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## Endpoints (Planned)

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `GET /users` - List users (admin only)
- `GET /users/:id` - Get user by ID (admin only)

### Courses
- `GET /courses` - List published courses
- `GET /courses/:slug` - Get course details
- `POST /courses` - Create course (teacher/admin)
- `PUT /courses/:id` - Update course (owner/admin)
- `DELETE /courses/:id` - Delete course (admin)

### Lessons
- `GET /courses/:courseId/lessons` - List lessons
- `POST /courses/:courseId/lessons` - Create lesson (teacher)
- `PUT /lessons/:id` - Update lesson (teacher)
- `DELETE /lessons/:id` - Delete lesson (teacher)

### Quizzes
- `GET /courses/:courseId/quizzes` - List quizzes
- `POST /quizzes` - Create quiz (teacher)
- `POST /quizzes/:id/attempt` - Start quiz attempt
- `POST /quizzes/:id/submit` - Submit quiz answers

### AI
- `POST /ai/hindi-tutor` - Chat with AI Hindi tutor
- `POST /ai/generate-questions` - Generate questions with AI
- `POST /ai/correct-writing` - Correct Hindi writing

### Attendance
- `GET /attendance` - Get attendance records
- `POST /attendance` - Mark attendance (teacher)
