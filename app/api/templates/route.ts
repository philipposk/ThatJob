import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get system templates (user_id is NULL)
    const { data: systemTemplates } = await supabase
      .from('document_templates')
      .select('*')
      .is('user_id', null);

    // Get user templates if logged in
    let userTemplates: any[] = [];
    if (user) {
      const { data } = await supabase
        .from('document_templates')
        .select('*')
        .eq('user_id', user.id);
      userTemplates = data || [];
    }

    return NextResponse.json({
      success: true,
      system_templates: systemTemplates || [],
      user_templates: userTemplates,
    });
  } catch (error: any) {
    logger.error('Error fetching templates', { error });
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
    const { name, type, template_data, is_default } = body;

    if (!name || !type || !template_data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await supabase
        .from('document_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('type', type);
    }

    const { data, error } = await supabase
      .from('document_templates')
      .insert({
        user_id: user.id,
        name,
        type,
        template_data,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error saving template', { error });
      return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in templates route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
