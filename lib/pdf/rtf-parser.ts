import { logger } from '../logger';

// Simple RTF text extraction
// For more complex RTF parsing, consider using a library like 'rtf-parser'
export async function extractTextFromRTF(buffer: Buffer): Promise<string> {
  try {
    const text = buffer.toString('utf-8');
    
    // Remove RTF control words and groups
    let extracted = text
      .replace(/\\[a-z]+\d*\s?/gi, ' ') // Remove control words
      .replace(/\{[^}]*\}/g, '') // Remove groups
      .replace(/\\[{}]/g, '') // Remove escaped braces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return extracted;
  } catch (error) {
    logger.error('Error parsing RTF', { error });
    throw new Error('Failed to extract text from RTF');
  }
}
