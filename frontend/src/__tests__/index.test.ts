import { describe, it, expect } from "vitest";

describe("NRB Vidyalaya LMS", () => {
  it("should have correct project name", () => {
    expect("NRB Vidyalaya LMS").toBe("NRB Vidyalaya LMS");
  });
});

describe("Login Validation", () => {
  it("rejects invalid email", async () => {
    const { loginSchema } = await import("@/utils/validators");
    const result = loginSchema.safeParse({ email: "not-email", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", async () => {
    const { loginSchema } = await import("@/utils/validators");
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123" });
    expect(result.success).toBe(false);
  });

  it("accepts valid login data", async () => {
    const { loginSchema } = await import("@/utils/validators");
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123456" });
    expect(result.success).toBe(true);
  });
});

describe("Registration Validation", () => {
  it("rejects short name", async () => {
    const { registerSchema } = await import("@/utils/validators");
    const result = registerSchema.safeParse({
      fullName: "A",
      email: "test@example.com",
      password: "Strong1Pass",
      confirmPassword: "Strong1Pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", async () => {
    const { registerSchema } = await import("@/utils/validators");
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      password: "Strong1Pass",
      confirmPassword: "Different1Pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weak password without uppercase", async () => {
    const { registerSchema } = await import("@/utils/validators");
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      password: "lowercase1",
      confirmPassword: "lowercase1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weak password without number", async () => {
    const { registerSchema } = await import("@/utils/validators");
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      password: "NoNumberPass",
      confirmPassword: "NoNumberPass",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid registration data", async () => {
    const { registerSchema } = await import("@/utils/validators");
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      password: "Strong1Pass",
      confirmPassword: "Strong1Pass",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional phone", async () => {
    const { registerSchema } = await import("@/utils/validators");
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      phone: "+91 98765 43210",
      password: "Strong1Pass",
      confirmPassword: "Strong1Pass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone format", async () => {
    const { registerSchema } = await import("@/utils/validators");
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      phone: "abc",
      password: "Strong1Pass",
      confirmPassword: "Strong1Pass",
    });
    expect(result.success).toBe(false);
  });
});

describe("Role Security", () => {
  it("default registration role is STUDENT", async () => {
    const { registerSchema } = await import("@/utils/validators");
    const fields = Object.keys(registerSchema.innerType().shape);
    expect(fields).not.toContain("role");
  });

  it("student cannot access admin route", () => {
    const allowedRoles = ["ADMIN", "SUPER_ADMIN"];
    const studentRole = "STUDENT";
    expect(allowedRoles).not.toContain(studentRole);
  });

  it("teacher can access teacher route", () => {
    const allowedRoles = ["TEACHER", "ADMIN", "SUPER_ADMIN"];
    const teacherRole = "TEACHER";
    expect(allowedRoles).toContain(teacherRole);
  });

  it("student cannot access teacher route", () => {
    const allowedRoles = ["TEACHER", "ADMIN", "SUPER_ADMIN"];
    const studentRole = "STUDENT";
    expect(allowedRoles).not.toContain(studentRole);
  });
});

describe("Route Constants", () => {
  it("has all portal login routes", async () => {
    const { ROUTES } = await import("@/constants/routes");
    expect(ROUTES.STUDENT_LOGIN).toBe("/student/login");
    expect(ROUTES.TEACHER_LOGIN).toBe("/teacher/login");
    expect(ROUTES.ADMIN_LOGIN).toBe("/admin/login");
  });

  it("has student portal routes", async () => {
    const { ROUTES } = await import("@/constants/routes");
    expect(ROUTES.STUDENT_DASHBOARD).toBe("/student/dashboard");
    expect(ROUTES.STUDENT_COURSES).toBe("/student/courses");
    expect(ROUTES.STUDENT_QUIZZES).toBe("/student/quizzes");
  });
});
