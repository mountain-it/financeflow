-- Check if user_role type exists and create if not
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_type WHERE typname = 'user_role') THEN
      CREATE TYPE public.user_role AS ENUM ('admin', 'member');
   END IF;
END $$;

-- AI Conversations and Messages Schema

-- 1. Conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Messages table
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' | 'ai'
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  quick_actions JSONB,
  provider TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated ON public.ai_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON public.ai_messages(conversation_id);

-- 4. Triggers to update conversation updated_at
CREATE OR REPLACE FUNCTION public.update_ai_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ai_conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_messages_update_conversation ON public.ai_messages;
CREATE TRIGGER trg_ai_messages_update_conversation
AFTER INSERT ON public.ai_messages
FOR EACH ROW EXECUTE FUNCTION public.update_ai_conversation_updated_at();

-- 5. RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- User can manage own conversations
CREATE POLICY ai_conversations_own_policy ON public.ai_conversations
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User can manage own messages via conversation ownership
CREATE POLICY ai_messages_via_conversation ON public.ai_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );