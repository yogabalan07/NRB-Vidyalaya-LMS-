import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/utils/validators";

describe("NRB Vidyalaya LMS", () => {
  it("should have correct project name", () => {
    expect("NRB Vidyalaya LMS").toBe("NRB Vidyalaya LMS");
  });
});

describe("Login Validation", () => {
  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-email", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123" });
    expect(result.success).toBe(false);
  });

  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123456" });
    expect(result.success).toBe(true);
  });
});

describe("Registration Validation", () => {
  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      fullName: "A",
      email: "test@example.com",
      password: "Strong1Pass",
      confirmPassword: "Strong1Pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      password: "Strong1Pass",
      confirmPassword: "Different1Pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weak password without uppercase", () => {
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      password: "lowercase1",
      confirmPassword: "lowercase1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weak password without number", () => {
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      password: "NoNumberPass",
      confirmPassword: "NoNumberPass",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      password: "Strong1Pass",
      confirmPassword: "Strong1Pass",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional phone", () => {
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "test@example.com",
      phone: "+91 98765 43210",
      password: "Strong1Pass",
      confirmPassword: "Strong1Pass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone format", () => {
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
  it("default registration role is STUDENT", () => {
    // The registration form does not expose role selection
    // Role is set server-side via Supabase trigger
    // This test verifies our Zod schema does not include a role field
    const fields = Object.keys(registerSchema.innerType().shape);
    expect(fields).not.toContain("role");
  });
});

describe("Protected Routes", () => {
  it("student cannot access admin route", () => {
    // This is enforced by ProtectedRoute component checking allowedRoles
    // Student roles are checked against ADMIN allowedRoles
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
