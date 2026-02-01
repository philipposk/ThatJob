import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  console.warn('GROQ_API_KEY not set - Groq backup will not be available');
}

export const groq = process.env.GROQ_API_KEY
  ? new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  : null;

export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
