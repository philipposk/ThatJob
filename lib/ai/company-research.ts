import { callAIWithFallback, OPENAI_MODEL } from '../openai/client';
import { cache, CacheKeys } from '../cache/redis';
import { logger } from '../logger';
import type { CompanyInfo } from '@/types/job';

export async function researchCompany(companyName: string): Promise<CompanyInfo> {
  // Check cache first
  const cached = cache.get<CompanyInfo>(CacheKeys.companyInfo(companyName));
  if (cached) {
    return cached;
  }

  const prompt = `Research the company "${companyName}" and extract the following information:

1. Company values (array of strings)
2. Company culture (array of strings describing culture)
3. Mission statement (single string or null)
4. Recent news (array of recent news headlines/topics)
5. Ethics and sustainability initiatives (array of strings)
6. Website URL (if found)
7. LinkedIn company page URL (if found)

Use web browsing to find current information. Return ONLY valid JSON in this format:
{
  "name": "${companyName}",
  "values": ["value1", "value2"],
  "culture": ["culture point 1", "culture point 2"],
  "mission": "mission statement or null",
  "recent_news": ["news 1", "news 2"],
  "ethics": ["ethics point 1"],
  "sustainability": ["sustainability initiative 1"],
  "website": "https://...",
  "linkedin": "https://linkedin.com/company/..."
}`;

  try {
    const response = await callAIWithFallback(
      [
        {
          role: 'system',
          content: 'You are a research assistant. Use web browsing to find current, accurate information about companies. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: OPENAI_MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }
    );

    const companyInfo: CompanyInfo = JSON.parse(
      response.choices[0].message.content || '{}'
    );

    // Cache for 24 hours
    cache.set(CacheKeys.companyInfo(companyName), companyInfo, 86400);

    return companyInfo;
  } catch (error: any) {
    logger.error('Error researching company', { error, companyName });
    // Return minimal info if research fails
    return {
      name: companyName,
      values: [],
      culture: [],
      mission: null,
      recent_news: [],
      ethics: [],
    };
  }
}
