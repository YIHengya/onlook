-- Add AI settings columns to user_settings table
ALTER TABLE "user_settings" 
ADD COLUMN "ai_provider" text DEFAULT 'openai',
ADD COLUMN "ai_base_url" text,
ADD COLUMN "ai_api_key" text,
ADD COLUMN "ai_custom_models" text DEFAULT '',
ADD COLUMN "ai_selected_model" text DEFAULT '',
ADD COLUMN "ai_temperature" real DEFAULT 0.7,
ADD COLUMN "ai_top_p" real DEFAULT 1.0,
ADD COLUMN "ai_max_tokens" integer DEFAULT 4000,
ADD COLUMN "ai_presence_penalty" real DEFAULT 0.0,
ADD COLUMN "ai_frequency_penalty" real DEFAULT 0.0,
ADD COLUMN "ai_enable_custom_interface" boolean DEFAULT true;
