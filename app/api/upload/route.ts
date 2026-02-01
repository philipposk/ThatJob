import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadFile } from '@/lib/storage/upload';
import { extractTextFromPDF } from '@/lib/pdf/parser';
import { extractTextFromRTF } from '@/lib/pdf/rtf-parser';
import { materialUploadSchema } from '@/lib/validation/schemas';
import { trackEvent } from '@/lib/analytics/tracker';
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;

    // Validate
    const validation = materialUploadSchema.safeParse({ type, title });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload file
    const fileUrl = await uploadFile(user.id, file, 'user-materials');

    // Extract text content
    let content = '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type === 'application/pdf') {
      content = await extractTextFromPDF(buffer);
    } else if (file.name.endsWith('.rtf')) {
      content = await extractTextFromRTF(buffer);
    } else if (file.type.startsWith('text/')) {
      content = buffer.toString('utf-8');
    }

    // Save to database
    const { data, error } = await supabase
      .from('user_materials')
      .insert({
        user_id: user.id,
        type: validation.data.type,
        title: validation.data.title || file.name,
        content,
        file_url: fileUrl,
        file_name: file.name,
        file_type: file.type === 'application/pdf' ? 'pdf' : file.name.split('.').pop() || 'txt',
      })
      .select()
      .single();

    if (error) {
      logger.error('Error saving material', { error, userId: user.id });
      return NextResponse.json({ error: 'Failed to save material' }, { status: 500 });
    }

    // Track event
    await trackEvent(user.id, 'material_uploaded', {
      material_id: data.id,
      type: validation.data.type,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in upload route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
