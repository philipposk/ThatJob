import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error fetching profile', { error });
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: data || null,
    });
  } catch (error: any) {
    logger.error('Error in profile GET route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: user.id,
          email: body.email,
          full_name: body.full_name,
          phone: body.phone,
          linkedin_url: body.linkedin_url,
          github_url: body.github_url,
          portfolio_url: body.portfolio_url,
          address: body.address,
          city: body.city,
          country: body.country,
          postal_code: body.postal_code,
          birthday: body.birthday || null,
          photo_url: body.photo_url,
          languages: body.languages || [],
          education_details: body.education_details || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      logger.error('Error saving profile', { error });
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: data,
    });
  } catch (error: any) {
    logger.error('Error in profile POST route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
