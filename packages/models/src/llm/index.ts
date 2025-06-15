export enum LLMProvider {
    ANTHROPIC = 'anthropic',
    OPENAI = 'openai',
    GOOGLE = 'google',
    BEDROCK = 'bedrock',
}

export enum CLAUDE_MODELS {
    SONNET_4 = 'claude-sonnet-4-20250514',
    SONNET_3_7 = 'claude-3-7-sonnet-20250219',
    HAIKU = 'claude-3-5-haiku-20241022',
}

export enum OPENAI_MODELS {
    GPT_4O = 'gpt-4o',
    GPT_4O_MINI = 'gpt-4o-mini',
    GPT_4_TURBO = 'gpt-4-turbo',
    GPT_4 = 'gpt-4',
    GPT_3_5_TURBO = 'gpt-3.5-turbo',
}

export enum GOOGLE_MODELS {
    GEMINI_PRO = 'gemini-pro',
    GEMINI_1_5_PRO = 'gemini-1.5-pro',
    GEMINI_1_5_FLASH = 'gemini-1.5-flash',
    GEMINI_2_0_FLASH = 'gemini-2.0-flash',
}

export enum BEDROCK_MODELS {
    CLAUDE_SONNET_4 = 'claude-sonnet-4-20250514',
    CLAUDE_SONNET_3_7 = 'claude-3-7-sonnet-20250219',
    CLAUDE_HAIKU = 'claude-3-5-haiku-20241022',
}

// Bedrock model mapping to full model IDs
export const BEDROCK_MODEL_MAP = {
    [BEDROCK_MODELS.CLAUDE_SONNET_4]: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    [BEDROCK_MODELS.CLAUDE_SONNET_3_7]: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    [BEDROCK_MODELS.CLAUDE_HAIKU]: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
} as const;

// Model display configuration
export interface ModelConfig {
    id: string;
    name: string;
    provider: LLMProvider;
    model: string;
    available: boolean; // Whether this model is currently supported
}

// Available models for the UI
export const AVAILABLE_MODELS: ModelConfig[] = [
    {
        id: 'claude-sonnet-4',
        name: 'Claude Sonnet 4',
        provider: LLMProvider.ANTHROPIC,
        model: CLAUDE_MODELS.SONNET_4,
        available: true,
    },
    {
        id: 'claude-haiku',
        name: 'Claude Haiku',
        provider: LLMProvider.ANTHROPIC,
        model: CLAUDE_MODELS.HAIKU,
        available: true,
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: LLMProvider.OPENAI,
        model: OPENAI_MODELS.GPT_4O,
        available: true,
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: LLMProvider.OPENAI,
        model: OPENAI_MODELS.GPT_4O_MINI,
        available: true,
    },
    {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: LLMProvider.OPENAI,
        model: OPENAI_MODELS.GPT_4,
        available: true,
    },
    {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: LLMProvider.OPENAI,
        model: OPENAI_MODELS.GPT_3_5_TURBO,
        available: true,
    },
    {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: LLMProvider.GOOGLE,
        model: GOOGLE_MODELS.GEMINI_PRO,
        available: false, // Not implemented yet
    },
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: LLMProvider.GOOGLE,
        model: GOOGLE_MODELS.GEMINI_2_0_FLASH,
        available: true,
    },
    {
        id: 'bedrock-claude-sonnet-4',
        name: 'Claude Sonnet 4 (Bedrock)',
        provider: LLMProvider.BEDROCK,
        model: BEDROCK_MODELS.CLAUDE_SONNET_4,
        available: true,
    },
    {
        id: 'bedrock-claude-sonnet-3-7',
        name: 'Claude Sonnet 3.7 (Bedrock)',
        provider: LLMProvider.BEDROCK,
        model: BEDROCK_MODELS.CLAUDE_SONNET_3_7,
        available: true,
    },
    {
        id: 'bedrock-claude-haiku',
        name: 'Claude Haiku (Bedrock)',
        provider: LLMProvider.BEDROCK,
        model: BEDROCK_MODELS.CLAUDE_HAIKU,
        available: true,
    },
];
