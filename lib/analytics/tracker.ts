import { createClient } from '../supabase/server';
import { logger } from '../logger';

export type AnalyticsEventType = 
  | 'material_uploaded'
  | 'document_generated'
  | 'download'
  | 'feedback'
  | 'chat_message'
  | 'preference_created'
  | 'batch_generated';

export async function trackEvent(
  userId: string,
  eventType: AnalyticsEventType,
  eventData: Record<string, any> = {}
): Promise<void> {
  try {
    const supabase = await createClient();
    
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
    });
  } catch (error) {
    logger.error('Error tracking analytics event', { error, userId, eventType });
    // Don't throw - analytics failures shouldn't break the app
  }
}
