export interface AIConversation {
  id: string;
  userId: string;
  topic?: string;
  level?: "beginner" | "intermediate" | "advanced";
  createdAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AICorrection {
  original: string;
  corrected: string;
  errors: AIGrammarError[];
  improvedVersion: string;
}

export interface AIGrammarError {
  original: string;
  corrected: string;
  explanation: string;
  category: string;
}
