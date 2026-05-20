-- Create AI conversations table
CREATE TABLE
    IF NOT EXISTS "AT".ai_conversations (
        id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
        tesis_id UUID NOT NULL,
        user_message TEXT NOT NULL,
        assistant_message TEXT NOT NULL,
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT now (),
            updated_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT now (),
            -- Constraints
            FOREIGN KEY (tesis_id) REFERENCES "AT".tesis (id) ON DELETE CASCADE,
            -- Indexes
            INDEX idx_ai_conversations_tesis_id (tesis_id),
            INDEX idx_ai_conversations_created_at (created_at DESC)
    );

-- Add comments
COMMENT ON TABLE "AT".ai_conversations IS 'Stores the conversation history between students and the Deepseek AI assistant';

COMMENT ON COLUMN "AT".ai_conversations.tesis_id IS 'Reference to the thesis this conversation belongs to';

COMMENT ON COLUMN "AT".ai_conversations.user_message IS 'The message sent by the user';

COMMENT ON COLUMN "AT".ai_conversations.assistant_message IS 'The response from the Deepseek AI assistant';