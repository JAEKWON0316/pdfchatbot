import { z } from 'zod';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const GeminiRequestSchema = z.object({
  contents: z.array(
    z.object({
      parts: z.array(
        z.object({
          text: z.string(),
        }),
      ),
    }),
  ),
});

export type GeminiRequest = z.infer<typeof GeminiRequestSchema>;

export async function fetchGeminiApi(
  body: GeminiRequest,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GEMINI_API_KEY is not set' };
    }
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'Gemini API error' };
    }
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}
