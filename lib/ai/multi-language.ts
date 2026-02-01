import { callAIWithFallback, OPENAI_MODEL } from '../openai/client';
import { logger } from '../logger';

export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await callAIWithFallback(
      [
        {
          role: 'system',
          content: 'Detect the language of the following text. Return only the ISO 639-1 language code (e.g., en, es, fr, de).',
        },
        {
          role: 'user',
          content: text.substring(0, 1000), // Sample first 1000 chars
        },
      ],
      {
        model: OPENAI_MODEL,
        temperature: 0.1,
      }
    );

    const language = response.choices[0].message.content?.trim().toLowerCase() || 'en';
    return language;
  } catch (error) {
    logger.error('Error detecting language', { error });
    return 'en'; // Default to English
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (targetLanguage === 'en') {
    return text; // No translation needed
  }

  try {
    const response = await callAIWithFallback(
      [
        {
          role: 'system',
          content: `Translate the following text to ${targetLanguage}. Maintain professional tone and formatting.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      {
        model: OPENAI_MODEL,
        temperature: 0.3,
      }
    );

    return response.choices[0].message.content || text;
  } catch (error) {
    logger.error('Error translating text', { error });
    return text; // Return original on error
  }
}
