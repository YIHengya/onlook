import { createClient } from '@/utils/supabase/request-server';
import { chatToolSet, getCreatePageSystemPrompt, getSystemPrompt, initModel } from '@onlook/ai';
import { AVAILABLE_MODELS, LLMProvider } from '@onlook/models';
import { generateObject, NoSuchToolError, streamText } from 'ai';
import { getProviderApiKey } from '@/utils/api';

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

    // Anthropic models - check for claude prefix and model names
    if (lowerModelName.startsWith('claude') ||
        lowerModelName.includes('sonnet') ||
        lowerModelName.includes('haiku') ||
        lowerModelName.includes('opus')) {
        return LLMProvider.ANTHROPIC;
    }

    // Bedrock models - temporarily disabled
    // if (lowerModelName.includes('bedrock') ||
    //     lowerModelName.startsWith('us.anthropic') ||
    //     lowerModelName.startsWith('amazon.')) {
    //     return LLMProvider.BEDROCK;
    // }

    // Default to Anthropic for unknown models (most compatible with current setup)
    return LLMProvider.ANTHROPIC;
}

/**
 * Get model configuration based on AI settings
 */
function getModelConfiguration(aiSettings: any): { provider: LLMProvider; modelName: string } {
    // Get selected model from AI settings
    const selectedModel = aiSettings?.selectedModel || 'gemini-2.5-flash-preview-04-17';

    // Find the model configuration from AVAILABLE_MODELS
    const modelConfig = AVAILABLE_MODELS.find(m => m.id === selectedModel);

    let provider = LLMProvider.GOOGLE;
    let modelName: string = 'gemini-2.5-flash-preview-04-17';

    if (modelConfig && modelConfig.available) {
        // Use predefined model configuration
        provider = modelConfig.provider;
        modelName = modelConfig.model;
        console.log(`Using predefined model: ${modelConfig.name} (${provider})`);
    } else if (selectedModel) {
        // For custom models, infer the provider from the model name
        provider = inferProviderFromModelName(selectedModel);
        modelName = selectedModel; // Use the custom model name directly
        console.log(`Using custom model: ${selectedModel} with inferred provider: ${provider}`);
    } else {
        console.log('No model selected, using default Gemini 2.5 Flash Preview (04-17)');
    }

    return { provider, modelName };
}

export async function POST(req: Request) {
    console.log('=== CHAT API ROUTE CALLED ===');

    const body = await req.json();
    console.log('Full request body:', JSON.stringify(body, null, 2));

    const { messages, maxSteps, chatType, aiSettings } = body;

    // Get model configuration using the dedicated method
    const { provider, modelName } = getModelConfiguration(aiSettings);

    // 获取API密钥
    const selectedApiKey = await getProviderApiKey(provider.toLowerCase());

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