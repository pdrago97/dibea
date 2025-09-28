-- Tabela para persistir contextos de conversação
CREATE TABLE IF NOT EXISTS conversation_contexts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  session_id TEXT NOT NULL,
  user_id TEXT,
  context_data TEXT NOT NULL DEFAULT '{}',
  last_intent TEXT,
  last_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_session_id ON conversation_contexts(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_user_id ON conversation_contexts(user_id);
