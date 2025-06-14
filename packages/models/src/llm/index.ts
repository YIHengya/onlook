export enum LLMProvider {
    ANTHROPIC = 'anthropic',
    OPENAI = 'openai',
    GOOGLE = 'google',
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
}

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
];
