# User Roles and Permissions

## Role Hierarchy

```
SUPER_ADMIN
  └── ADMIN
        └── TEACHER
              └── STUDENT
```

## Role Descriptions

### SUPER_ADMIN
- Full system access
- Manage all users including admins
- System configuration
- Audit log access
- Cannot be deleted by other admins

### ADMIN
- Manage students and teachers
- Manage courses, lessons, quizzes
- Manage blog and notifications
- View analytics and reports
- Manage payments
- AI question generation

### TEACHER
- Manage assigned courses
- Create and edit lessons
- Create and grade assignments
- Create quizzes
- Mark attendance
- View student progress
- Post announcements

### STUDENT
- Enroll in courses
- View lessons and materials
- Submit assignments
- Take quizzes
- View results and certificates
- AI Hindi Tutor access
- View attendance
- Manage profile

## Permission Matrix

| Feature | SUPER_ADMIN | ADMIN | TEACHER | STUDENT |
|---------|:-----------:|:-----:|:-------:|:-------:|
| Manage Users | ✅ | ✅¹ | ❌ | ❌ |
| Manage Courses | ✅ | ✅ | ✅² | ❌ |
| Create Lessons | ✅ | ✅ | ✅ | ❌ |
| Grade Assignments | ✅ | ✅ | ✅ | ❌ |
| Create Quizzes | ✅ | ✅ | ✅ | ❌ |
| AI Question Gen | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅³ | ❌ |
| Manage Payments | ✅ | ✅ | ❌ | ❌ |
| Blog Management | ✅ | ✅ | ❌ | ❌ |
| Take Quizzes | ✅ | ✅ | ✅ | ✅ |
| AI Hindi Tutor | ✅ | ✅ | ✅ | ✅ |
| View Certificates | ✅ | ✅ | ✅ | ✅ |

¹ Admin can manage students and teachers only
² Teacher can manage own assigned courses only
³ Teacher can view assigned student progress only

## Enforcement

- **Frontend:** Route guards prevent unauthorized navigation
- **Backend:** Role middleware checks permissions
- **Database:** RLS policies enforce data access at database level

**Never rely solely on frontend role checks.**
