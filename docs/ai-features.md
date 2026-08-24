# AI Features Documentation

## Overview

NRB Vidyalaya LMS integrates AI capabilities to enhance Hindi language learning. All AI requests are processed server-side to protect API keys.

## AI Question Generator

### Input Parameters
- **Subject**: Hindi, English, Mathematics, etc.
- **Topic**: Grammar, Vocabulary, Literature, etc.
- **Class/Level**: 1-12
- **Difficulty**: easy, medium, hard
- **Language**: Hindi, English
- **Number of Questions**: 1-50
- **Marks per Question**: 1-10
- **Negative Marks**: 0-5

### Processing Pipeline
1. Validate admin input with Zod
2. Construct AI prompt with topic context
3. Call OpenAI API
4. Parse JSON response
5. Validate response schema with Zod
6. Check for duplicate questions
7. Preview for admin review
8. Save to question bank on approval

### Output Schema
```typescript
interface AIQuestionResponse {
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  language: string;
  questions: {
    question: string;
    options: { id: string; text: string }[];
    correctOption: string;
    explanation: string;
    marks: number;
  }[];
}
```

## AI Hindi Tutor

### Conversation Levels
- **Beginner**: Simple sentences, basic vocabulary
- **Intermediate**: Complex sentences, grammar focus
- **Advanced**: Literature, idioms, cultural context

### Conversation Topics
Introduction, School, Home, Shopping, Restaurant, Travel, Hospital, Workplace, Daily Life

### Capabilities
- Natural Hindi conversation
- Grammar correction
- Mistake explanation
- English translation on request
- Difficulty adaptation

## AI Writing Correction

### Input
- Hindi text (sentence or paragraph)

### Output
- Corrected text
- List of errors with explanations
- Grammar category for each error
- Improved version of the text

## Security

- All AI prompts constructed server-side
- API keys never exposed to frontend
- Response validation prevents injection
- Rate limiting on AI endpoints
- Conversation history stored encrypted
