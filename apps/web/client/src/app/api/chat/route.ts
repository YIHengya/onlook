import { getBaseUrl } from '@/trpc/helpers';
import { chatToolSet, getCreatePageSystemPrompt, getSystemPrompt, initModel } from '@onlook/ai';
import { AVAILABLE_MODELS, CLAUDE_MODELS, LLMProvider } from '@onlook/models';
import { generateObject, NoSuchToolError, streamText } from 'ai';
import { db } from '@onlook/db/src/client';
import { apiKeys } from '@onlook/db';
import { eq, and, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export enum ChatType {
    ASK = 'ask',
    CREATE = 'create',
    EDIT = 'edit',
    FIX = 'fix',
}

/**
 * Infer the provider from a custom model name based on common prefixes
 */
function inferProviderFromModelName(modelName: string): LLMProvider {
    const lowerModelName = modelName.toLowerCase();

    // Google/Gemini models - check for gemini prefix
    if (lowerModelName.startsWith('gemini')) {
        return LLMProvider.GOOGLE;
    }

    // OpenAI models - check for gpt prefix and other OpenAI model patterns
    if (lowerModelName.startsWith('gpt') ||
        lowerModelName.includes('turbo') ||
        lowerModelName.startsWith('text-') ||
        lowerModelName.startsWith('davinci') ||
        lowerModelName.startsWith('curie') ||
        lowerModelName.startsWith('babbage') ||
        lowerModelName.startsWith('ada') ||
        lowerModelName.startsWith('o1') ||
        lowerModelName.includes('chatgpt')) {
        return LLMProvider.OPENAI;
    }

    // Anthropic models - check for claude prefix and model names
    if (lowerModelName.startsWith('claude') ||
        lowerModelName.includes('sonnet') ||
        lowerModelName.includes('haiku') ||
        lowerModelName.includes('opus')) {
        return LLMProvider.ANTHROPIC;
    }

    // Bedrock models - check for bedrock-specific patterns
    if (lowerModelName.includes('bedrock') ||
        lowerModelName.startsWith('us.anthropic') ||
        lowerModelName.startsWith('amazon.')) {
        return LLMProvider.BEDROCK;
    }

    // Default to OpenAI for unknown models (most compatible)
    return LLMProvider.OPENAI;
}

export async function POST(req: Request) {
    console.log('=== CHAT API ROUTE CALLED ===');

    const body = await req.json();
    console.log('Full request body:', JSON.stringify(body, null, 2));

    const { messages, maxSteps, chatType, aiSettings } = body;

    // Get selected model from AI settings
    const selectedModel = aiSettings?.selectedModel || 'claude-sonnet-4';

    // Find the model configuration from AVAILABLE_MODELS
    const modelConfig = AVAILABLE_MODELS.find(m => m.id === selectedModel);

    let provider = LLMProvider.ANTHROPIC;
    let modelName: string = CLAUDE_MODELS.SONNET_4;

    if (modelConfig && modelConfig.available) {
        // Use predefined model configuration
        provider = modelConfig.provider;
        modelName = modelConfig.model; // Remove incorrect type casting
        console.log(`Using predefined model: ${modelConfig.name} (${provider})`);
    } else if (selectedModel) {
        // For custom models, infer the provider from the model name
        provider = inferProviderFromModelName(selectedModel);
        modelName = selectedModel; // Use the custom model name directly
        console.log(`Using custom model: ${selectedModel} with inferred provider: ${provider}`);
    } else {
        console.log('No model selected, using default Claude Sonnet 4');
    }

    // 通过内部 API 获取 API Key
    let selectedApiKey: string | null = null;
    try {
        console.log(`Attempting to get API key from database for provider: ${provider}`);

        const response = await fetch(`${getBaseUrl()}/api/keys/get-optimal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ provider: provider.toLowerCase() }),
        });

        if (response.ok) {
            const data = await response.json();
            selectedApiKey = data.apiKey;
            console.log(`Retrieved API key from database for provider: ${provider}`);
        } else {
            console.log(`Failed to get API key from database (status: ${response.status}), falling back to environment variables`);
        }
    } catch (error) {
        console.error('Failed to fetch API key:', error);
        console.log('Falling back to environment variables for API key');
    }

    // 初始化模型，传入API密钥
    const model = await initModel(provider, modelName, selectedApiKey || undefined);
 
    const systemPrompt = chatType === ChatType.CREATE ? getCreatePageSystemPrompt() : getSystemPrompt();

    const result = streamText({
        model,
        system: systemPrompt,
        messages,
        maxSteps,
        tools: chatToolSet,
        toolCallStreaming: true,
        maxTokens: 64000,
        experimental_repairToolCall: async ({ toolCall, tools, parameterSchema, error }) => {
            if (NoSuchToolError.isInstance(error)) {
                throw new Error(
                    `Tool "${toolCall.toolName}" not found. Available tools: ${Object.keys(tools).join(', ')}`,
                );
            }
            const tool = tools[toolCall.toolName as keyof typeof tools];

            console.warn(
                `Invalid parameter for tool ${toolCall.toolName} with args ${JSON.stringify(toolCall.args)}, attempting to fix`,
            );

            const { object: repairedArgs } = await generateObject({
                model,
                schema: tool?.parameters,
                prompt: [
                    `The model tried to call the tool "${toolCall.toolName}"` +
                    ` with the following arguments:`,
                    JSON.stringify(toolCall.args),
                    `The tool accepts the following schema:`,
                    JSON.stringify(parameterSchema(toolCall)),
                    'Please fix the arguments.',
                ].join('\n'),
            });

            return { ...toolCall, args: JSON.stringify(repairedArgs) };
        },
        onError: (error) => {
            console.error('Error in chat', error);
        },
    });

    return result.toDataStreamResponse();
}
