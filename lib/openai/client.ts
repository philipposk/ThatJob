import OpenAI from 'openai';
import { groq, GROQ_MODEL } from '../ai/groq';
import { logger } from '../logger';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
