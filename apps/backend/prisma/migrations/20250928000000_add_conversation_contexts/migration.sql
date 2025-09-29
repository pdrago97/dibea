-- CreateTable for conversation contexts
CREATE TABLE IF NOT EXISTS "conversation_contexts" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    "session_id" TEXT NOT NULL UNIQUE,
    "user_id" TEXT,
    "context_data" TEXT NOT NULL DEFAULT '{}',
    "last_intent" TEXT,
    "last_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversation_contexts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "conversation_contexts_session_id_idx" ON "conversation_contexts"("session_id");
CREATE INDEX IF NOT EXISTS "conversation_contexts_user_id_idx" ON "conversation_contexts"("user_id");
CREATE INDEX IF NOT EXISTS "conversation_contexts_updated_at_idx" ON "conversation_contexts"("updated_at");
