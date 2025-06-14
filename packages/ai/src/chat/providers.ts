import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { CLAUDE_MODELS, LLMProvider, OPENAI_MODELS } from '@onlook/models';
import { assertNever } from '@onlook/utility';
import { type LanguageModelV1 } from 'ai';

export async function initModel(provider: LLMProvider, model: string): Promise<LanguageModelV1> {
    switch (provider) {
        case LLMProvider.ANTHROPIC:
            return await getAnthropicProvider(model as CLAUDE_MODELS);
        case LLMProvider.OPENAI:
            return await getOpenAIProvider(model as OPENAI_MODELS);
        case LLMProvider.GOOGLE:
            // TODO: Implement Google provider when @ai-sdk/google is available
            console.warn('Google provider not implemented yet, falling back to Anthropic');
            return await getAnthropicProvider(CLAUDE_MODELS.SONNET_4);
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
    const openai = createOpenAI({
        apiKey: 'sk-08adcbca84834e0483aa2ee3f768f4c0',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
    // 使用 DashScope 的模型名称
    return openai('deepseek-r1-distill-llama-70b');
}
