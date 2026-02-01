import pdfParse from 'pdf-parse';
import { logger } from '../logger';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    logger.error('Error parsing PDF', { error });
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractMetadataFromPDF(buffer: Buffer): Promise<{
  pages: number;
  info: any;
}> {
  try {
    const data = await pdfParse(buffer);
    return {
      pages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    logger.error('Error extracting PDF metadata', { error });
    throw new Error('Failed to extract PDF metadata');
  }
}
