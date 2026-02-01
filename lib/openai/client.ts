import OpenAI from 'openai';
import { groq, GROQ_MODEL } from '../ai/groq';
import { logger } from '../logger';

// Don't throw on module load - will fail gracefully when actually used
const openaiApiKey = process.env.OPENAI_API_KEY || '';

export const openai = openaiApiKey
  ? new OpenAI({
      apiKey: openaiApiKey,
    })
  : ({
      chat: {
        completions: {
          create: async () => {
            throw new Error('OPENAI_API_KEY environment variable is not set');
          },
        },
      },
    } as any);

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

// Fallback to Groq if OpenAI fails
export async function callAIWithFallback(
  messages: any[],
  options: {
    model?: string;
    temperature?: number;
    response_format?: any;
  } = {}
) {
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  try {
    const response = await openai.chat.completions.create({
      model: options.model || OPENAI_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      response_format: options.response_format,
    });
    return response;
  } catch (error: any) {
    logger.warn('OpenAI call failed, trying Groq fallback', { error: error.message });
    
    if (groq) {
      try {
        const response = await groq.chat.completions.create({
          model: GROQ_MODEL,
          messages,
          temperature: options.temperature ?? 0.7,
        });
        return response;
      } catch (groqError: any) {
        logger.error('Both OpenAI and Groq failed', { 
          openaiError: error.message,
          groqError: groqError.message 
        });
        throw error; // Throw original OpenAI error
      }
    }
    
    throw error;
  }
}
