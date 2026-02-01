export interface ChatConversation {
  id: string;
  user_id: string;
  title: string | null;
  document_id: string | null;
  context: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface ChatAction {
  id: string;
  conversation_id: string;
  message_id: string;
  action_type: 'edit_document' | 'create_similar' | 'regenerate' | 'export';
  target_document_id: string | null;
  new_document_id: string | null;
  action_data: Record<string, any> | null;
  created_at: string;
}
