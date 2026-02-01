-- AI Chat conversations
CREATE TABLE IF NOT EXISTS ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chat messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat actions (edits, new documents created from chat)
CREATE TABLE IF NOT EXISTS chat_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('edit_document', 'create_similar', 'regenerate', 'export')),
  target_document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
  new_document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
  action_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON ai_chat_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON ai_chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_actions_conversation ON chat_actions(conversation_id);

ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON ai_chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON ai_chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON ai_chat_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON ai_chat_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in own conversations" ON ai_chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations 
      WHERE ai_chat_conversations.id = ai_chat_messages.conversation_id 
      AND ai_chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations" ON ai_chat_messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations 
      WHERE ai_chat_conversations.id = ai_chat_messages.conversation_id 
      AND ai_chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view actions in own conversations" ON chat_actions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations 
      WHERE ai_chat_conversations.id = chat_actions.conversation_id 
      AND ai_chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert actions in own conversations" ON chat_actions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations 
      WHERE ai_chat_conversations.id = chat_actions.conversation_id 
      AND ai_chat_conversations.user_id = auth.uid()
    )
  );
