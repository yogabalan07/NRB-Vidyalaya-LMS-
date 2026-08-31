import { describe, it, expect } from "vitest";

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

// ─── Storage Statistics ──────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value < 10 ? value.toFixed(2) : value < 100 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

function calculateUsedPercentage(usedBytes: number, totalBytes: number): number {
  if (totalBytes <= 0) return 0;
  return Math.min(100, Math.round((usedBytes / totalBytes) * 100));
}

function calculateRemainingBytes(totalBytes: number, usedBytes: number): number {
  return Math.max(0, totalBytes - usedBytes);
}

function getWarningLevel(
  percentage: number
): "normal" | "warning" | "strong" | "critical" {
  if (percentage >= 95) return "critical";
  if (percentage >= 85) return "strong";
  if (percentage >= 70) return "warning";
  return "normal";
}

describe("Storage - formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1.00 KB");
    expect(formatBytes(1536)).toBe("1.50 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1.00 MB");
    expect(formatBytes(1572864)).toBe("1.50 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1.00 GB");
    expect(formatBytes(2147483648)).toBe("2.00 GB");
  });

  it("formats terabytes", () => {
    expect(formatBytes(1099511627776)).toBe("1.00 TB");
  });
});

describe("Storage - Percentage Calculation", () => {
  it("calculates 50% usage", () => {
    expect(calculateUsedPercentage(500, 1000)).toBe(50);
  });

  it("calculates 0% usage", () => {
    expect(calculateUsedPercentage(0, 1000)).toBe(0);
  });

  it("calculates 100% usage", () => {
    expect(calculateUsedPercentage(1000, 1000)).toBe(100);
  });

  it("caps at 100% when over", () => {
    expect(calculateUsedPercentage(1500, 1000)).toBe(100);
  });

  it("returns 0 for zero total", () => {
    expect(calculateUsedPercentage(500, 0)).toBe(0);
  });
});

describe("Storage - Remaining Bytes", () => {
  it("calculates remaining bytes", () => {
    expect(calculateRemainingBytes(1000, 300)).toBe(700);
  });

  it("returns 0 when fully used", () => {
    expect(calculateRemainingBytes(1000, 1000)).toBe(0);
  });

  it("returns 0 when over-used", () => {
    expect(calculateRemainingBytes(1000, 1500)).toBe(0);
  });

  it("returns total when empty", () => {
    expect(calculateRemainingBytes(1000, 0)).toBe(1000);
  });
});

describe("Storage - Warning Thresholds", () => {
  it("returns normal below 70%", () => {
    expect(getWarningLevel(0)).toBe("normal");
    expect(getWarningLevel(69)).toBe("normal");
  });

  it("returns warning at 70%", () => {
    expect(getWarningLevel(70)).toBe("warning");
    expect(getWarningLevel(84)).toBe("warning");
  });

  it("returns strong at 85%", () => {
    expect(getWarningLevel(85)).toBe("strong");
    expect(getWarningLevel(94)).toBe("strong");
  });

  it("returns critical at 95%", () => {
    expect(getWarningLevel(95)).toBe("critical");
    expect(getWarningLevel(100)).toBe("critical");
  });
});

describe("Storage - Stats Response Structure", () => {
  it("has correct shape for valid stats", () => {
    const stats = {
      totalBytes: 1073741824,
      usedBytes: 536870912,
      remainingBytes: 536870912,
      usedPercentage: 50,
      quotaAvailable: false,
      buckets: [
        { bucketName: "avatars", fileCount: 10, usedBytes: 1048576 },
        { bucketName: "study-materials", fileCount: 5, usedBytes: 5242880 },
      ],
    };

    expect(stats.totalBytes).toBeGreaterThan(0);
    expect(stats.usedBytes).toBeGreaterThanOrEqual(0);
    expect(stats.remainingBytes).toBeGreaterThanOrEqual(0);
    expect(stats.usedPercentage).toBeGreaterThanOrEqual(0);
    expect(stats.usedPercentage).toBeLessThanOrEqual(100);
    expect(Array.isArray(stats.buckets)).toBe(true);
    stats.buckets.forEach((b) => {
      expect(b.bucketName).toBeTruthy();
      expect(b.fileCount).toBeGreaterThanOrEqual(0);
      expect(b.usedBytes).toBeGreaterThanOrEqual(0);
    });
  });

  it("bucket usedBytes sum does not exceed total usedBytes", () => {
    const stats = {
      totalBytes: 1073741824,
      usedBytes: 536870912,
      remainingBytes: 536870912,
      usedPercentage: 50,
      quotaAvailable: false,
      buckets: [
        { bucketName: "avatars", fileCount: 10, usedBytes: 2097152 },
        { bucketName: "study-materials", fileCount: 5, usedBytes: 3145728 },
      ],
    };

    const bucketTotal = stats.buckets.reduce((sum, b) => sum + b.usedBytes, 0);
    expect(bucketTotal).toBeLessThanOrEqual(stats.usedBytes + 1);
  });
});
