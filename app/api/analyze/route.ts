import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractUserProfile } from '@/lib/ai/learning';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { material_id } = await request.json();

    // If material_id provided, analyze that specific material
    // Otherwise, analyze all materials and update profile
    const profile = await extractUserProfile(user.id);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    logger.error('Error in analyze route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
