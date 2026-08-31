/**
 * Cleans AI-generated JSON output by handling common mistakes.
 * Supports JSON wrapped in markdown code fences, with BOM, trailing commas, etc.
 */
export function cleanAIJsonOutput(raw: string): string {
  let cleaned = raw.trim();

  // Remove BOM (Byte Order Mark)
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.slice(1);
  }

  // Remove markdown code fences: ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
  cleaned = cleaned.replace(/\n?```\s*$/i, "");

  // Remove any leading/trailing explanatory text before { or after }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  // Remove single-line comments (// ...)
  cleaned = cleaned.replace(/\/\/.*$/gm, "");

  // Remove control characters except newlines and tabs
  // eslint-disable-next-line no-control-regex
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return cleaned;
}

/**
 * Attempts to parse AI-generated JSON with cleanup.
 * Returns the parsed object or throws with a descriptive error.
 */
export function parseAIJson<T>(raw: string): T {
  const cleaned = cleanAIJsonOutput(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      "Invalid JSON output. The AI response could not be parsed. Please try again or fix the JSON manually."
    );
  }
}
