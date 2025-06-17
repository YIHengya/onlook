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

/**
 * 初始化语言模型
 * @param provider 模型提供商
 * @param model 模型名称
 * @param apiKey 可选的API密钥
 * @returns 初始化后的语言模型
 */
export async function initModel(
    provider: LLMProvider,
    model: string,
    apiKey?: string,
): Promise<LanguageModelV1> {
    switch (provider) {
        case LLMProvider.ANTHROPIC:
            return await getAnthropicProvider(model as CLAUDE_MODELS, apiKey);
        case LLMProvider.OPENAI:
            return await getOpenAIProvider(model as OPENAI_MODELS, apiKey);
        case LLMProvider.GOOGLE:
            return await getGoogleProvider(model as GOOGLE_MODELS, apiKey);
        case LLMProvider.BEDROCK:
            return await getBedrockProvider(model as BEDROCK_MODELS, apiKey);
        default:
            assertNever(provider);
    }
}

/**
 * 获取Anthropic提供商的模型
 */
async function getAnthropicProvider(
    model: CLAUDE_MODELS,
    apiKey?: string,
): Promise<LanguageModelV1> {
    const anthropic = createAnthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    return anthropic(model, {
        cacheControl: true,
    });
}

/**
 * 获取OpenAI提供商的模型
 */
async function getOpenAIProvider(model: OPENAI_MODELS, apiKey?: string): Promise<LanguageModelV1> {
    const openai = createOpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY,
    });

    // For custom models, use the model name directly; for predefined models, use the mapping
    const modelName = Object.values(OPENAI_MODELS).includes(model) ? model : model;
    return openai(modelName);
}

/**
 * 获取Google提供商的模型
 */
async function getGoogleProvider(model: GOOGLE_MODELS, apiKey?: string): Promise<LanguageModelV1> {
    const google = createGoogleGenerativeAI({
        apiKey: apiKey || process.env.GOOGLE_API_KEY,
    });

    // For custom models, use the model name directly; for predefined models, use the mapping
    const modelName = Object.values(GOOGLE_MODELS).includes(model) ? model : model;
    return google(modelName);
}

/**
 * 获取Amazon Bedrock提供商的模型
 */
async function getBedrockProvider(
    model: BEDROCK_MODELS,
    apiKey?: string,
): Promise<LanguageModelV1> {
    // 注意：Bedrock通常使用AWS凭证而不是API密钥
    // 这里我们假设apiKey是AWS访问密钥，但实际应用中可能需要更复杂的处理

    // 如果提供了API密钥，可以考虑设置AWS环境变量
    if (apiKey) {
        process.env.AWS_ACCESS_KEY_ID = apiKey.split(':')[0];
        process.env.AWS_SECRET_ACCESS_KEY = apiKey.split(':')[1];
    }

    // Use the Bedrock model mapping to get the full model ID
    const modelId = BEDROCK_MODEL_MAP[model] || model;
    return bedrock(modelId);
}
