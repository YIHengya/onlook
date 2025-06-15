import { bedrock } from '@ai-sdk/amazon-bedrock';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { CLAUDE_MODELS, GOOGLE_MODELS, LLMProvider, OPENAI_MODELS } from '@onlook/models';
import { assertNever } from '@onlook/utility';
import { type LanguageModelV1 } from 'ai';

export interface AIConfig {
    apiKey?: string;
    baseUrl?: string;
}

export async function initModel(
    provider: LLMProvider,
    model: string,
    config?: AIConfig,
): Promise<LanguageModelV1> {
    switch (provider) {
        case LLMProvider.ANTHROPIC:
            return await getAnthropicProvider(model as CLAUDE_MODELS, config);
        case LLMProvider.OPENAI:
            return await getOpenAIProvider(model as OPENAI_MODELS, config);
        case LLMProvider.GOOGLE:
            return await getGoogleProvider(model as GOOGLE_MODELS, config);
        default:
            assertNever(provider);
    }
}

async function getAnthropicProvider(
    model: CLAUDE_MODELS,
    config?: AIConfig,
): Promise<LanguageModelV1> {
    const anthropic = createAnthropic();
    return anthropic(model, {
        cacheControl: true,
    });
}

async function getOpenAIProvider(
    model: OPENAI_MODELS,
    config?: AIConfig,
): Promise<LanguageModelV1> {
    // Use custom config if provided, otherwise fall back to environment variables or defaults
    const apiKey =
        config?.apiKey || process.env.OPENAI_API_KEY || 'sk-08adcbca84834e0483aa2ee3f768f4c0';
    const baseURL =
        config?.baseUrl ||
        process.env.OPENAI_BASE_URL ||
        'https://dashscope.aliyuncs.com/compatible-mode/v1';

    const openai = createOpenAI({
        apiKey,
        baseURL,
    });

    // For custom models, use the model name directly; for predefined models, use the mapping
    const modelName = Object.values(OPENAI_MODELS).includes(model) ? model : model;
    return openai(modelName);
}

async function getGoogleProvider(
    model: GOOGLE_MODELS,
    config?: AIConfig,
): Promise<LanguageModelV1> {
    const google = createGoogleGenerativeAI();

    // For custom models, use the model name directly; for predefined models, use the mapping
    const modelName = Object.values(GOOGLE_MODELS).includes(model) ? model : model;
    return google(modelName);
}
