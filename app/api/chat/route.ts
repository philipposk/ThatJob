import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithFallback, OPENAI_MODEL } from '@/lib/openai/client';
import { chatMessageSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Support guest mode
    const isGuest = !user && request.headers.get('x-guest-mode') === 'true';
    const guestId = request.headers.get('x-guest-id');

    if (!user && !isGuest) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user?.id || `guest-${guestId}`;

    const body = await request.json();
    const validation = chatMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error },
        { status: 400 }
      );
    }

    let conversationId = validation.data.conversation_id;

    // For guest mode, use conversation history from request
    if (isGuest) {
      // Use conversation history from request if provided
      const conversationHistory = validation.data.conversation_history || [];
      
      // Get document context if available (for guest mode, from localStorage on client)
      let documentContext = '';
      if (validation.data.document_id) {
        // For guest mode, document context would come from client-side localStorage
        // For now, we'll just mention it in the prompt
        documentContext = '\nNote: You may be discussing a specific document. Ask for details if needed.';
      }
      
      // Get AI response with conversation history
      const systemPrompt = `You are an AI assistant helping users with their CVs and cover letters. 
You can:
- Answer questions about documents
- Suggest edits and improvements
- Create similar documents for different jobs
- Explain alignment scores and citations
${documentContext}

Be helpful, direct, and professional.`;

      const response = await callAIWithFallback(
        [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: validation.data.message },
        ],
        {
          model: OPENAI_MODEL,
          temperature: 0.7,
        }
      );

      const aiMessage = response.choices[0].message.content || '';

      return NextResponse.json({
        success: true,
        conversation_id: conversationId || `guest-conv-${Date.now()}`,
        message: aiMessage,
      });
    }

    // Create conversation if new (for authenticated users)
    if (!conversationId) {
      const { data: conversation, error: convError } = await supabase
        .from('ai_chat_conversations')
        .insert({
          user_id: user!.id,
          document_id: validation.data.document_id || null,
          title: validation.data.message.substring(0, 50),
        })
        .select()
        .single();

      if (convError) {
        logger.error('Error creating conversation', { error: convError });
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }

      conversationId = conversation.id;
    }

    // Get conversation history
    const { data: messages } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    // Get document context if available
    let documentContext = '';
    if (validation.data.document_id) {
      const { data: document } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('id', validation.data.document_id)
        .single();

      if (document) {
        documentContext = `Document Context:
CV: ${document.cv_content || 'N/A'}
Cover Letter: ${document.cover_content || 'N/A'}
Alignment: ${document.alignment_score}%`;
      }
    }

    // Build conversation history
    const conversationHistory = (messages || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add user message
    conversationHistory.push({
      role: 'user',
      content: validation.data.message,
    });

    // Save user message (only for authenticated users)
    if (user) {
      await supabase.from('ai_chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: validation.data.message,
      });
    }

    // Get AI response
    const systemPrompt = `You are an AI assistant helping users with their CVs and cover letters. 
You can:
- Answer questions about documents
- Suggest edits and improvements
- Create similar documents for different jobs
- Explain alignment scores and citations

${documentContext ? `\n${documentContext}` : ''}

Be helpful, direct, and professional.`;

    const response = await callAIWithFallback(
      [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ],
      {
        model: OPENAI_MODEL,
        temperature: 0.7,
      }
    );

    const aiMessage = response.choices[0].message.content || '';

    // Save AI message (only for authenticated users)
    if (user) {
      await supabase.from('ai_chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiMessage,
      });

      // Update conversation timestamp
      await supabase
        .from('ai_chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    return NextResponse.json({
      success: true,
      conversation_id: conversationId,
      message: aiMessage,
    });
  } catch (error: any) {
    logger.error('Error in chat route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
