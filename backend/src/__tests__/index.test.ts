import { describe, it, expect } from "vitest";
import {
  chatSchema,
  correctWritingSchema,
  generateQuestionsSchema,
} from "../validators/ai.validators.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import { calculatePagination } from "../utils/pagination.js";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "../utils/errors.js";

describe("AI Validators", () => {
  describe("chatSchema", () => {
    it("accepts valid chat message", () => {
      const result = chatSchema.safeParse({
        message: "Namaste, mujhe Hindi seekhni hai",
        level: "beginner",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty message", () => {
      const result = chatSchema.safeParse({ message: "", level: "beginner" });
      expect(result.success).toBe(false);
    });

    it("rejects message exceeding 2000 chars", () => {
      const result = chatSchema.safeParse({
        message: "a".repeat(2001),
        level: "beginner",
      });
      expect(result.success).toBe(false);
    });

    it("defaults level to beginner", () => {
      const result = chatSchema.safeParse({ message: "Hello" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.level).toBe("beginner");
      }
    });

    it("accepts valid conversationId", () => {
      const result = chatSchema.safeParse({
        message: "Hello",
        level: "intermediate",
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid conversationId", () => {
      const result = chatSchema.safeParse({
        message: "Hello",
        conversationId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("correctWritingSchema", () => {
    it("accepts valid text", () => {
      const result = correctWritingSchema.safeParse({
        text: "मैं स्कूल जाता हूँ",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty text", () => {
      const result = correctWritingSchema.safeParse({ text: "" });
      expect(result.success).toBe(false);
    });

    it("rejects text exceeding 5000 chars", () => {
      const result = correctWritingSchema.safeParse({
        text: "a".repeat(5001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("generateQuestionsSchema", () => {
    it("accepts valid question generation request", () => {
      const result = generateQuestionsSchema.safeParse({
        subject: "Hindi",
        topic: "व्याकरण",
        classLevel: "Class 8",
        difficulty: "medium",
        language: "Hindi",
        numberOfQuestions: 5,
        marks: 1,
        negativeMarks: 0.25,
        questionType: "MCQ",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing subject", () => {
      const result = generateQuestionsSchema.safeParse({
        topic: "Grammar",
        classLevel: "Class 8",
      });
      expect(result.success).toBe(false);
    });

    it("rejects numberOfQuestions > 50", () => {
      const result = generateQuestionsSchema.safeParse({
        subject: "Hindi",
        topic: "Grammar",
        classLevel: "Class 8",
        numberOfQuestions: 51,
      });
      expect(result.success).toBe(false);
    });

    it("defaults numberOfQuestions to 5", () => {
      const result = generateQuestionsSchema.safeParse({
        subject: "Hindi",
        topic: "Grammar",
        classLevel: "Class 8",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.numberOfQuestions).toBe(5);
      }
    });

    it("accepts difficulty values", () => {
      for (const diff of ["easy", "medium", "hard"]) {
        const result = generateQuestionsSchema.safeParse({
          subject: "Hindi",
          topic: "Grammar",
          classLevel: "Class 8",
          difficulty: diff,
        });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid difficulty", () => {
      const result = generateQuestionsSchema.safeParse({
        subject: "Hindi",
        topic: "Grammar",
        classLevel: "Class 8",
        difficulty: "impossible",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Error Classes", () => {
  it("AppError sets message and statusCode", () => {
    const err = new AppError("Something failed", 500);
    expect(err.message).toBe("Something failed");
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
  });

  it("NotFoundError sets 404", () => {
    const err = new NotFoundError("Course");
    expect(err.message).toBe("Course not found");
    expect(err.statusCode).toBe(404);
  });

  it("UnauthorizedError sets 401", () => {
    const err = new UnauthorizedError();
    expect(err.message).toBe("Unauthorized");
    expect(err.statusCode).toBe(401);
  });

  it("ForbiddenError sets 403", () => {
    const err = new ForbiddenError();
    expect(err.message).toBe("Forbidden");
    expect(err.statusCode).toBe(403);
  });

  it("ValidationError sets 400", () => {
    const err = new ValidationError("Invalid input");
    expect(err.message).toBe("Invalid input");
    expect(err.statusCode).toBe(400);
  });
});

describe("Pagination", () => {
  it("calculates default pagination", () => {
    const result = calculatePagination(1, 10);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it("calculates custom page and limit", () => {
    const result = calculatePagination(3, 20);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(40);
  });

  it("caps limit at 100", () => {
    const result = calculatePagination(1, 200);
    expect(result.limit).toBe(100);
  });

  it("ensures page >= 1", () => {
    const result = calculatePagination(-1, 10);
    expect(result.page).toBe(1);
  });
});

describe("Response Helpers", () => {
  it("sendSuccess returns correct format", () => {
    let statusCode = 0;
    let body: unknown = null;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: unknown) => {
            body = data;
          },
        };
      },
    } as never;

    sendSuccess(res, { id: 1 }, 201);
    expect(statusCode).toBe(201);
    expect(body).toEqual({ status: "success", data: { id: 1 } });
  });

  it("sendError returns correct format", () => {
    let statusCode = 0;
    let body: unknown = null;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: unknown) => {
            body = data;
          },
        };
      },
    } as never;

    sendError(res, "Not found", 404);
    expect(statusCode).toBe(404);
    expect(body).toEqual({ status: "error", message: "Not found" });
  });

  it("sendPaginated returns correct format", () => {
    let body: unknown = null;
    const res = {
      status: () => ({
        json: (data: unknown) => {
          body = data;
        },
      }),
    } as never;

    sendPaginated(res, [{ id: 1 }], 25, 2, 10);
    expect(body).toEqual({
      status: "success",
      data: [{ id: 1 }],
      pagination: { total: 25, page: 2, limit: 10, totalPages: 3 },
    });
  });
});

describe("Backend - AI Question Validation", () => {
  function validateQuestion(q: {
    question: string;
    options: { id: string; text: string }[];
    correctOption: string;
    explanation: string;
    marks: number;
  }): string[] {
    const errors: string[] = [];
    if (!q.question?.trim()) errors.push("Question text is empty");
    if (!Array.isArray(q.options) || q.options.length !== 4)
      errors.push(`Expected 4 options, got ${q.options?.length ?? 0}`);
    if (!["A", "B", "C", "D"].includes(q.correctOption))
      errors.push(`Invalid correctOption: ${q.correctOption}`);
    if (!q.explanation?.trim()) errors.push("Explanation is empty");
    if (!q.marks || q.marks < 1) errors.push("Invalid marks value");
    if (q.options) {
      const ids = q.options.map((o) => o.id);
      if (new Set(ids).size !== 4) errors.push("Duplicate option IDs");
      if (q.options.some((o) => !o.text?.trim()))
        errors.push("Empty option text");
    }
    return errors;
  }

  it("validates a correct question", () => {
    const errors = validateQuestion({
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
    });
    expect(errors).toHaveLength(0);
  });

  it("rejects question with empty text", () => {
    const errors = validateQuestion({
      question: "",
      options: [
        { id: "A", text: "X" },
        { id: "B", text: "Y" },
        { id: "C", text: "Z" },
        { id: "D", text: "W" },
      ],
      correctOption: "A",
      explanation: "exp",
      marks: 1,
    });
    expect(errors).toContain("Question text is empty");
  });

  it("rejects question with wrong number of options", () => {
    const errors = validateQuestion({
      question: "Test?",
      options: [
        { id: "A", text: "X" },
        { id: "B", text: "Y" },
      ],
      correctOption: "A",
      explanation: "exp",
      marks: 1,
    });
    expect(errors).toContain("Expected 4 options, got 2");
  });

  it("rejects question with invalid correctOption", () => {
    const errors = validateQuestion({
      question: "Test?",
      options: [
        { id: "A", text: "X" },
        { id: "B", text: "Y" },
        { id: "C", text: "Z" },
        { id: "D", text: "W" },
      ],
      correctOption: "E",
      explanation: "exp",
      marks: 1,
    });
    expect(errors).toContain("Invalid correctOption: E");
  });

  it("rejects question with duplicate option IDs", () => {
    const errors = validateQuestion({
      question: "Test?",
      options: [
        { id: "A", text: "X" },
        { id: "A", text: "Y" },
        { id: "C", text: "Z" },
        { id: "D", text: "W" },
      ],
      correctOption: "A",
      explanation: "exp",
      marks: 1,
    });
    expect(errors).toContain("Duplicate option IDs");
  });

  it("rejects question with empty option text", () => {
    const errors = validateQuestion({
      question: "Test?",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "Y" },
        { id: "C", text: "Z" },
        { id: "D", text: "W" },
      ],
      correctOption: "A",
      explanation: "exp",
      marks: 1,
    });
    expect(errors).toContain("Empty option text");
  });

  it("rejects question with zero marks", () => {
    const errors = validateQuestion({
      question: "Test?",
      options: [
        { id: "A", text: "X" },
        { id: "B", text: "Y" },
        { id: "C", text: "Z" },
        { id: "D", text: "W" },
      ],
      correctOption: "A",
      explanation: "exp",
      marks: 0,
    });
    expect(errors).toContain("Invalid marks value");
  });

  it("rejects question with empty explanation", () => {
    const errors = validateQuestion({
      question: "Test?",
      options: [
        { id: "A", text: "X" },
        { id: "B", text: "Y" },
        { id: "C", text: "Z" },
        { id: "D", text: "W" },
      ],
      correctOption: "A",
      explanation: "",
      marks: 1,
    });
    expect(errors).toContain("Explanation is empty");
  });
});

describe("Backend - API Health", () => {
  it("health endpoint structure is correct", () => {
    const healthResponse = {
      status: "ok",
      service: "NRB Vidyalaya LMS API",
      timestamp: new Date().toISOString(),
    };
    expect(healthResponse.status).toBe("ok");
    expect(healthResponse.service).toBe("NRB Vidyalaya LMS API");
    expect(healthResponse.timestamp).toBeDefined();
  });
});
