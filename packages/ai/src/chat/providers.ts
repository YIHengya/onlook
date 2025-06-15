import { bedrock } from '@ai-sdk/amazon-bedrock';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import {
    BEDROCK_MODELS,
    BEDROCK_MODEL_MAP,
    CLAUDE_MODELS,
    GOOGLE_MODELS,
    LLMProvider,
    OPENAI_MODELS,
} from '@onlook/models';
import { assertNever } from '@onlook/utility';
import { type LanguageModelV1 } from 'ai';

export async function initModel(provider: LLMProvider, model: string): Promise<LanguageModelV1> {
    switch (provider) {
        case LLMProvider.ANTHROPIC:
            return await getAnthropicProvider(model as CLAUDE_MODELS);
        case LLMProvider.OPENAI:
            return await getOpenAIProvider(model as OPENAI_MODELS);
        case LLMProvider.GOOGLE:
            return await getGoogleProvider(model as GOOGLE_MODELS);
        case LLMProvider.BEDROCK:
            return await getBedrockProvider(model as BEDROCK_MODELS);
        default:
            assertNever(provider);
    }
}

async function getAnthropicProvider(model: CLAUDE_MODELS): Promise<LanguageModelV1> {
    const anthropic = createAnthropic();
    return anthropic(model, {
        cacheControl: true,
    });
}

async function getOpenAIProvider(model: OPENAI_MODELS): Promise<LanguageModelV1> {
    // Use environment variables or defaults
    const apiKey = process.env.OPENAI_API_KEY || 'sk-08adcbca84834e0483aa2ee3f768f4c0';
    const baseURL =
        process.env.OPENAI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

    const openai = createOpenAI({
        apiKey,
        baseURL,
    });

    // For custom models, use the model name directly; for predefined models, use the mapping
    const modelName = Object.values(OPENAI_MODELS).includes(model) ? model : model;
    return openai(modelName);
}

async function getGoogleProvider(model: GOOGLE_MODELS): Promise<LanguageModelV1> {
    const google = createGoogleGenerativeAI();

    // For custom models, use the model name directly; for predefined models, use the mapping
    const modelName = Object.values(GOOGLE_MODELS).includes(model) ? model : model;
    return google(modelName);
}

async function getBedrockProvider(model: BEDROCK_MODELS): Promise<LanguageModelV1> {
    // Use the Bedrock model mapping to get the full model ID
    const modelId = BEDROCK_MODEL_MAP[model] || model;
    return bedrock(modelId);
}
