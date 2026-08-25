import type { Request, Response } from "express";
import { getSupabaseClient } from "../config/database.js";
import {
  isOpenAIConfigured,
  generateChatCompletion,
  generateJSON,
} from "../services/ai/openai.js";
import {
  buildQuestionGenerationPrompt,
  buildHindiTutorPrompt,
  buildGrammarCorrectionPrompt,
} from "../services/ai/prompts/question-generator.js";
import {
  chatSchema,
  correctWritingSchema,
  generateQuestionsSchema,
} from "../validators/ai.validators.js";
import { sendSuccess, sendError } from "../utils/response.js";
import type { AuthenticatedRequest } from "../types/express.js";

interface AIQuestionOption {
  id: string;
  text: string;
}

interface AIQuestion {
  question: string;
  options: AIQuestionOption[];
  correctOption: string;
  explanation: string;
  marks: number;
}

interface QuestionGenerationResponse {
  questions: AIQuestion[];
}

interface GrammarCorrectionResponse {
  original: string;
  corrected: string;
  errors: Array<{
    original: string;
    corrected: string;
    explanation: string;
    category: string;
  }>;
  improvedVersion: string;
}

function validateQuestion(q: AIQuestion): string[] {
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
    if (q.options.some((o) => !o.text?.trim())) errors.push("Empty option text");
  }
  return errors;
}

export async function chat(req: Request, res: Response): Promise<void> {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validation failed: " + parsed.error.flatten().fieldErrors, 400);
      return;
    }

    if (!isOpenAIConfigured()) {
      sendError(
        res,
        "AI service not configured. Set OPENAI_API_KEY environment variable.",
        503
      );
      return;
    }

    const { message, level, conversationId } = parsed.data;
    const supabase = getSupabaseClient();
    const user = (req as AuthenticatedRequest).user;

    let conversationHistory: Array<{ role: string; content: string }> = [];
    let activeConversationId = conversationId;

    if (activeConversationId) {
      const { data: messages } = await supabase
        .from("ai_messages")
        .select("role, content")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (messages) {
        conversationHistory = messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        }));
      }
    } else {
      const { data: conversation, error: convError } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          topic: "hindi-tutor",
          level,
        })
        .select("id")
        .single();

      if (convError || !conversation) {
        sendError(res, "Failed to create conversation", 500);
        return;
      }
      activeConversationId = conversation.id;
    }

    const promptMessages = JSON.parse(
      buildHindiTutorPrompt({ message, level, conversationHistory })
    ) as Array<{ role: string; content: string }>;

    const reply = await generateChatCompletion(
      promptMessages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      }))
    );

    await supabase.from("ai_messages").insert([
      {
        conversation_id: activeConversationId,
        role: "user",
        content: message,
      },
      {
        conversation_id: activeConversationId,
        role: "assistant",
        content: reply,
      },
    ]);

    sendSuccess(res, { reply, conversationId: activeConversationId });
  } catch (error) {
    console.error("AI chat error:", error);
    const message =
      error instanceof Error ? error.message : "AI service unavailable";
    sendError(res, message, 500);
  }
}

export async function correctWriting(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsed = correctWritingSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validation failed: " + parsed.error.flatten().fieldErrors, 400);
      return;
    }

    if (!isOpenAIConfigured()) {
      sendError(
        res,
        "AI service not configured. Set OPENAI_API_KEY environment variable.",
        503
      );
      return;
    }

    const { text } = parsed.data;

    const prompt = buildGrammarCorrectionPrompt(text);
    const result = await generateJSON<GrammarCorrectionResponse>([
      { role: "system", content: "You are a Hindi grammar expert." },
      { role: "user", content: prompt },
    ]);

    sendSuccess(res, {
      original: text,
      corrected: result.corrected || text,
      errors: result.errors || [],
      improvedVersion: result.improvedVersion || text,
    });
  } catch (error) {
    console.error("AI grammar correction error:", error);
    const message =
      error instanceof Error ? error.message : "AI service unavailable";
    sendError(res, message, 500);
  }
}

export async function generateQuestions(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsed = generateQuestionsSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validation failed: " + parsed.error.flatten().fieldErrors, 400);
      return;
    }

    if (!isOpenAIConfigured()) {
      sendError(
        res,
        "AI service not configured. Set OPENAI_API_KEY environment variable.",
        503
      );
      return;
    }

    const params = parsed.data;
    const prompt = buildQuestionGenerationPrompt(params);
    const result = await generateJSON<QuestionGenerationResponse>([
      { role: "system", content: "You are an expert Hindi teacher." },
      { role: "user", content: prompt },
    ]);

    if (!result.questions || !Array.isArray(result.questions)) {
      sendError(res, "AI did not return valid questions", 502);
      return;
    }

    const validationErrors: string[] = [];
    const validQuestions: AIQuestion[] = [];

    for (let i = 0; i < result.questions.length; i++) {
      const q = result.questions[i];
      const errors = validateQuestion(q);
      if (errors.length > 0) {
        validationErrors.push(`Question ${i + 1}: ${errors.join("; ")}`);
      } else {
        validQuestions.push(q);
      }
    }

    if (validQuestions.length === 0) {
      sendError(
        res,
        `All generated questions failed validation: ${validationErrors.join(
          "; "
        )}`,
        502
      );
      return;
    }

    sendSuccess(res, { questions: validQuestions });
  } catch (error) {
    console.error("AI question generation error:", error);
    const message =
      error instanceof Error ? error.message : "AI service unavailable";
    sendError(res, message, 500);
  }
}

export async function verifyCertificate(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { certificateNumber } = req.params;
    if (!certificateNumber) {
      sendError(res, "Certificate number is required", 400);
      return;
    }

    const supabase = getSupabaseClient();
    const { data: certificate, error } = await supabase
      .from("certificates")
      .select("id, certificate_number, student_name, course_name, issue_date, status")
      .eq("certificate_number", certificateNumber)
      .single();

    if (error || !certificate) {
      sendSuccess(res, {
        valid: false,
        message: "Certificate not found",
      });
      return;
    }

    sendSuccess(res, {
      valid: true,
      certificate: {
        institution: "NRB Vidyalaya",
        studentName: certificate.student_name,
        course: certificate.course_name,
        completionDate: certificate.issue_date,
        certificateNumber: certificate.certificate_number,
        status: certificate.status,
      },
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    sendError(res, "Verification failed", 500);
  }
}
