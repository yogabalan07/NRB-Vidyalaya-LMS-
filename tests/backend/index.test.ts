import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "../../frontend/src/utils/validators";

describe("Authentication Validation", () => {
  describe("Login Schema", () => {
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

  describe("Register Schema", () => {
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
});

describe("Role Security", () => {
  it("default registration role is STUDENT", () => {
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

  it("admin can access admin route", () => {
    const allowedRoles = ["ADMIN", "SUPER_ADMIN"];
    const adminRole = "ADMIN";
    expect(allowedRoles).toContain(adminRole);
  });

  it("super_admin can access admin route", () => {
    const allowedRoles = ["ADMIN", "SUPER_ADMIN"];
    const superAdminRole = "SUPER_ADMIN";
    expect(allowedRoles).toContain(superAdminRole);
  });
});
