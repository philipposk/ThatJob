import { logger } from '../logger';

// Lazy load pdf-parse to avoid __dirname issues at module load
let pdfParse: any = null;

async function getPdfParse() {
  if (!pdfParse) {
    // Dynamic import to avoid __dirname issues
    const pdfParseModule = await import('pdf-parse');
    pdfParse = pdfParseModule.default || pdfParseModule;
  }
  return pdfParse;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParseFn = await getPdfParse();
    const data = await pdfParseFn(buffer);
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
    const pdfParseFn = await getPdfParse();
    const data = await pdfParseFn(buffer);
    return {
      pages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    logger.error('Error extracting PDF metadata', { error });
    throw new Error('Failed to extract PDF metadata');
  }
}
