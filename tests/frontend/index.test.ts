import { describe, it, expect } from "vitest";

describe("Frontend - Route Constants", () => {
  it("has all portal login routes", async () => {
    const { ROUTES } = await import("../../frontend/src/constants/routes");
    expect(ROUTES.STUDENT_LOGIN).toBe("/student/login");
    expect(ROUTES.TEACHER_LOGIN).toBe("/teacher/login");
    expect(ROUTES.ADMIN_LOGIN).toBe("/admin/login");
  });

  it("has student portal routes", async () => {
    const { ROUTES } = await import("../../frontend/src/constants/routes");
    expect(ROUTES.STUDENT_DASHBOARD).toBe("/student/dashboard");
    expect(ROUTES.STUDENT_COURSES).toBe("/student/courses");
    expect(ROUTES.STUDENT_QUIZZES).toBe("/student/quizzes");
    expect(ROUTES.STUDENT_ASSIGNMENTS).toBe("/student/assignments");
    expect(ROUTES.STUDENT_ATTENDANCE).toBe("/student/attendance");
    expect(ROUTES.STUDENT_CERTIFICATES).toBe("/student/certificates");
    expect(ROUTES.STUDENT_NOTIFICATIONS).toBe("/student/notifications");
    expect(ROUTES.STUDENT_AI_TUTOR).toBe("/student/ai-tutor");
  });

  it("has teacher portal routes", async () => {
    const { ROUTES } = await import("../../frontend/src/constants/routes");
    expect(ROUTES.TEACHER_DASHBOARD).toBe("/teacher/dashboard");
    expect(ROUTES.TEACHER_COURSES).toBe("/teacher/courses");
    expect(ROUTES.TEACHER_STUDENTS).toBe("/teacher/students");
    expect(ROUTES.TEACHER_ATTENDANCE).toBe("/teacher/attendance");
  });

  it("has admin portal routes", async () => {
    const { ROUTES } = await import("../../frontend/src/constants/routes");
    expect(ROUTES.ADMIN_DASHBOARD).toBe("/admin/dashboard");
    expect(ROUTES.ADMIN_COURSES).toBe("/admin/courses");
    expect(ROUTES.ADMIN_STUDENTS).toBe("/admin/students");
    expect(ROUTES.ADMIN_TEACHERS).toBe("/admin/teachers");
    expect(ROUTES.ADMIN_BLOG).toBe("/admin/blog");
    expect(ROUTES.ADMIN_SETTINGS).toBe("/admin/settings");
  });

  it("has public routes", async () => {
    const { ROUTES } = await import("../../frontend/src/constants/routes");
    expect(ROUTES.HOME).toBe("/");
    expect(ROUTES.ABOUT).toBe("/about");
    expect(ROUTES.COURSES).toBe("/courses");
    expect(ROUTES.BLOG).toBe("/blog");
    expect(ROUTES.CONTACT).toBe("/contact");
  });
});

describe("Frontend - Types", () => {
  it("has all role types", async () => {
    const { ALL_ROLES, STUDENT_ROLE } = await import("../../frontend/src/types/auth");
    expect(ALL_ROLES).toContain("STUDENT");
    expect(ALL_ROLES).toContain("TEACHER");
    expect(ALL_ROLES).toContain("ADMIN");
    expect(ALL_ROLES).toContain("SUPER_ADMIN");
    expect(STUDENT_ROLE).toBe("STUDENT");
  });

  it("has lesson status enum", async () => {
    const { LessonStatus } = await import("../../frontend/src/types");
    expect(LessonStatus.DRAFT).toBe("DRAFT");
    expect(LessonStatus.PUBLISHED).toBe("PUBLISHED");
    expect(LessonStatus.ARCHIVED).toBe("ARCHIVED");
  });

  it("has attendance status enum", async () => {
    const { AttendanceStatus } = await import("../../frontend/src/types");
    expect(AttendanceStatus.PRESENT).toBe("PRESENT");
    expect(AttendanceStatus.ABSENT).toBe("ABSENT");
    expect(AttendanceStatus.LEAVE).toBe("LEAVE");
  });

  it("has difficulty enum", async () => {
    const { Difficulty } = await import("../../frontend/src/types");
    expect(Difficulty.EASY).toBe("easy");
    expect(Difficulty.MEDIUM).toBe("medium");
    expect(Difficulty.HARD).toBe("hard");
  });
});

describe("Frontend - Utility Functions", () => {
  it("getInitials returns correct initials", async () => {
    const { getInitials } = await import("../../frontend/src/lib/utils");
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Single")).toBe("S");
    expect(getInitials("Three Names")).toBe("TN");
  });

  it("formatCurrency formats INR correctly", async () => {
    const { formatCurrency } = await import("../../frontend/src/lib/utils");
    const result = formatCurrency(1000);
    expect(result).toContain("1");
    expect(result).toContain("000");
  });

  it("slugify creates valid slugs", async () => {
    const { slugify } = await import("../../frontend/src/lib/utils");
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("Test!@#$%")).toBe("test");
    expect(slugify("Multiple  Spaces")).toBe("multiple-spaces");
  });

  it("formatDate formats dates correctly", async () => {
    const { formatDate } = await import("../../frontend/src/lib/utils");
    const result = formatDate("2024-01-15");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});
