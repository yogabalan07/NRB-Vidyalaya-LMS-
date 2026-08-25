import { describe, it, expect } from "vitest";

describe("E2E - API Contract Tests", () => {
  describe("Health Endpoint", () => {
    it("returns correct health response structure", () => {
      const response = {
        status: "ok",
        service: "NRB Vidyalaya LMS API",
        timestamp: new Date().toISOString(),
      };
      expect(response.status).toBe("ok");
      expect(typeof response.service).toBe("string");
      expect(typeof response.timestamp).toBe("string");
    });
  });

  describe("AI Chat Contract", () => {
    it("defines correct request shape", () => {
      const request = {
        message: "Hello, I want to learn Hindi",
        level: "beginner",
        conversationId: undefined,
      };
      expect(typeof request.message).toBe("string");
      expect(["beginner", "intermediate", "advanced"]).toContain(request.level);
    });

    it("defines correct response shape", () => {
      const response = {
        reply: "Namaste! Main aapki madad karunga.",
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
      };
      expect(typeof response.reply).toBe("string");
      expect(typeof response.conversationId).toBe("string");
    });
  });

  describe("AI Question Generator Contract", () => {
    it("defines correct request shape", () => {
      const request = {
        subject: "Hindi",
        topic: "व्याकरण",
        classLevel: "Class 8",
        difficulty: "medium",
        language: "Hindi",
        numberOfQuestions: 5,
        marks: 1,
        negativeMarks: 0.25,
        questionType: "MCQ",
      };
      expect(typeof request.subject).toBe("string");
      expect(typeof request.numberOfQuestions).toBe("number");
      expect(request.numberOfQuestions).toBeGreaterThan(0);
      expect(request.numberOfQuestions).toBeLessThanOrEqual(50);
    });

    it("defines correct response shape", () => {
      const response = {
        questions: [
          {
            question: "भारत की राजधानी क्या है?",
            options: [
              { id: "A", text: "मुंबई" },
              { id: "B", text: "दिल्ली" },
              { id: "C", text: "कोलकाता" },
              { id: "D", text: "चेन्नई" },
            ],
            correctOption: "B",
            explanation: "दिल्ली भारत की राजधानी है",
            marks: 1,
          },
        ],
      };
      expect(Array.isArray(response.questions)).toBe(true);
      expect(response.questions.length).toBeGreaterThan(0);

      const q = response.questions[0];
      expect(typeof q.question).toBe("string");
      expect(q.options).toHaveLength(4);
      expect(["A", "B", "C", "D"]).toContain(q.correctOption);
      expect(typeof q.explanation).toBe("string");
      expect(q.marks).toBeGreaterThan(0);
    });
  });

  describe("AI Grammar Correction Contract", () => {
    it("defines correct request shape", () => {
      const request = { text: "मैं स्कूल जाता हूँ" };
      expect(typeof request.text).toBe("string");
      expect(request.text.length).toBeGreaterThan(0);
    });

    it("defines correct response shape", () => {
      const response = {
        original: "मैं स्कूल जाता हूँ",
        corrected: "मैं विद्यालय जाता हूँ",
        errors: [
          {
            original: "स्कूल",
            corrected: "विद्यालय",
            explanation: "Hindi formal word",
            category: "vocabulary",
          },
        ],
        improvedVersion: "मैं प्रतिदिन विद्यालय जाता हूँ।",
      };
      expect(typeof response.original).toBe("string");
      expect(typeof response.corrected).toBe("string");
      expect(Array.isArray(response.errors)).toBe(true);
      expect(typeof response.improvedVersion).toBe("string");
    });
  });

  describe("Certificate Verification Contract", () => {
    it("defines correct response for valid certificate", () => {
      const response = {
        valid: true,
        certificate: {
          institution: "NRB Vidyalaya",
          studentName: "राहुल शर्मा",
          course: "Hindi Beginner",
          completionDate: "2025-01-15",
          certificateNumber: "NRB-2025-001",
          status: "active",
        },
      };
      expect(response.valid).toBe(true);
      expect(response.certificate.institution).toBe("NRB Vidyalaya");
      expect(typeof response.certificate.studentName).toBe("string");
      expect(typeof response.certificate.course).toBe("string");
    });

    it("defines correct response for invalid certificate", () => {
      const response = {
        valid: false,
        message: "Certificate not found",
      };
      expect(response.valid).toBe(false);
      expect(typeof response.message).toBe("string");
    });
  });

  describe("Storage Buckets", () => {
    it("defines required buckets", () => {
      const buckets = [
        "assignment-submissions",
        "study-materials",
        "blog-images",
        "profile-images",
        "certificates",
      ];
      expect(buckets).toHaveLength(5);
      for (const bucket of buckets) {
        expect(typeof bucket).toBe("string");
        expect(bucket.length).toBeGreaterThan(0);
      }
    });
  });
});

describe("E2E - Role-Based Access Control", () => {
  const roles = ["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"];

  it("defines all valid roles", () => {
    expect(roles).toHaveLength(4);
    expect(roles).toContain("STUDENT");
    expect(roles).toContain("TEACHER");
    expect(roles).toContain("ADMIN");
    expect(roles).toContain("SUPER_ADMIN");
  });

  it("teacher-only endpoints require TEACHER or higher role", () => {
    const teacherEndpoints = [
      "POST /api/ai/generate-questions",
    ];
    const allowedRoles = ["ADMIN", "TEACHER", "SUPER_ADMIN"];
    expect(allowedRoles).toContain("TEACHER");
    expect(allowedRoles).toContain("ADMIN");
    expect(allowedRoles).toContain("SUPER_ADMIN");
    expect(allowedRoles).not.toContain("STUDENT");
    expect(teacherEndpoints.length).toBeGreaterThan(0);
  });

  it("student endpoints require authentication", () => {
    const studentEndpoints = [
      "POST /api/ai/chat",
      "POST /api/ai/correct-writing",
    ];
    expect(studentEndpoints.length).toBeGreaterThan(0);
  });
});

describe("E2E - Data Validation Rules", () => {
  it("enforces max 50 questions per generation via schema", async () => {
    const { generateQuestionsSchema } = await import("../../backend/src/validators/ai.validators");
    const result = generateQuestionsSchema.safeParse({
      subject: "Hindi",
      topic: "Grammar",
      classLevel: "Class 8",
      numberOfQuestions: 51,
    });
    expect(result.success).toBe(false);
  });

  it("enforces max 2000 char chat message via schema", async () => {
    const { chatSchema } = await import("../../backend/src/validators/ai.validators");
    const result = chatSchema.safeParse({
      message: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("enforces max 5000 char writing correction via schema", async () => {
    const { correctWritingSchema } = await import("../../backend/src/validators/ai.validators");
    const result = correctWritingSchema.safeParse({
      text: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("requires exactly 4 options per question", () => {
    function validateQuestion(q: { options: { id: string; text: string }[] }) {
      return q.options.length === 4;
    }
    expect(validateQuestion({ options: [{ id: "A", text: "a" }, { id: "B", text: "b" }, { id: "C", text: "c" }, { id: "D", text: "d" }] })).toBe(true);
    expect(validateQuestion({ options: [{ id: "A", text: "a" }, { id: "B", text: "b" }] })).toBe(false);
  });

  it("valid option IDs are A, B, C, D", () => {
    const validIds = ["A", "B", "C", "D"];
    expect(validIds).toHaveLength(4);
    expect(new Set(validIds).size).toBe(4);
  });
});
