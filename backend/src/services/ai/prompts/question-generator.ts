export function buildQuestionGenerationPrompt(params: {
  subject: string;
  topic: string;
  classLevel: string;
  difficulty: string;
  language: string;
  numberOfQuestions: number;
  marks: number;
  negativeMarks: number;
  questionType: string;
}): string {
  return `You are an expert Hindi language teacher creating a quiz for students at NRB Vidyalaya.

Generate exactly ${params.numberOfQuestions} ${params.questionType} questions about "${params.topic}" in the subject "${params.subject}".

Parameters:
- Subject: ${params.subject}
- Topic: ${params.topic}
- Class Level: ${params.classLevel}
- Difficulty: ${params.difficulty}
- Language: ${params.language}
- Number of Questions: ${params.numberOfQuestions}
- Marks per Question: ${params.marks}
- Negative Marks: ${params.negativeMarks}

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Exactly one correct answer per question
- Questions should be appropriate for the class level
- Use ${params.language} language for questions and options
- Provide clear explanations for each correct answer
- Mark the correct option using "A", "B", "C", or "D"

Respond ONLY with valid JSON in this exact format:
{
  "questions": [
    {
      "question": "The question text",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctOption": "A",
      "explanation": "Explanation of the correct answer",
      "marks": ${params.marks}
    }
  ]
}`;
}

export function buildHindiTutorPrompt(params: {
  message: string;
  level: string;
  conversationHistory: Array<{ role: string; content: string }>;
}): string {
  const systemPrompt = `You are a friendly and encouraging Hindi language tutor at NRB Vidyalaya.
Your role is to help students learn Hindi through conversation, grammar exercises, and vocabulary practice.

Student Level: ${params.level}

Guidelines:
- Speak primarily in ${params.level === 'beginner' ? 'simple Hindi with English translations' : params.level === 'intermediate' ? 'Hindi with occasional English explanations' : 'advanced Hindi with cultural context'}
- Correct grammar mistakes naturally in conversation
- Introduce new vocabulary when appropriate
- Be encouraging and patient
- Use examples from daily life in India
- If the student writes in English, respond in Hindi with translation
- If the student writes in Hindi, respond in Hindi and note any corrections needed
- When correcting, explain the rule briefly

When you detect a grammar or vocabulary mistake, provide:
1. The corrected version
2. A brief explanation of the rule
3. An example of correct usage`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...params.conversationHistory,
    { role: "user", content: params.message },
  ];

  return JSON.stringify(messages);
}

export function buildGrammarCorrectionPrompt(text: string): string {
  return `You are a Hindi grammar expert. Analyze the following Hindi text and correct any grammar, spelling, or punctuation errors.

Text to correct:
"${text}"

Respond ONLY with valid JSON in this exact format:
{
  "original": "${text.replace(/"/g, '\\"')}",
  "corrected": "The corrected text",
  "errors": [
    {
      "original": "Incorrect text",
      "corrected": "Correct text",
      "explanation": "Explanation of the error",
      "category": "grammar|spelling|punctuation|vocabulary"
    }
  ],
  "improvedVersion": "A polished, natural-sounding version of the text"
}

If the text is already correct, return the same text for "corrected" and "improvedVersion", and return an empty "errors" array.`;
}
