import { callAIWithFallback, OPENAI_MODEL } from '../openai/client';
import type { AlignmentLevel } from '@/types/document';
import type { CompanyInfo } from '@/types/job';
import { logger } from '../logger';

export async function calculateAlignmentScore(
  documentContent: string,
  companyInfo: CompanyInfo,
  targetAlignment: AlignmentLevel
): Promise<number> {
  try {
    const prompt = `Analyze how well the following document aligns with the company's ethics and values.

Document:
${documentContent}

Company Values: ${companyInfo.values.join(', ')}
Company Culture: ${companyInfo.culture.join(', ')}
Company Mission: ${companyInfo.mission || 'Not specified'}

Target Alignment Level: ${targetAlignment}%

Rate the actual alignment on a scale of 0-100, where:
- 0-20: No alignment, generic content
- 21-40: Minimal alignment, some references
- 41-60: Moderate alignment, balanced approach
- 61-80: Strong alignment, clear value connections
- 81-100: Deep alignment, cultural integration

Return ONLY a number between 0-100.`;

    const response = await callAIWithFallback(
      [
        {
          role: 'system',
          content: 'You are an expert at analyzing document alignment with company values. Return only a number.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: OPENAI_MODEL,
        temperature: 0.3,
      }
    );

    const score = parseInt(response.choices[0].message.content || '0');
    return Math.max(0, Math.min(100, score));
  } catch (error: any) {
    logger.error('Error calculating alignment score', { error });
    return targetAlignment; // Return target as fallback
  }
}
