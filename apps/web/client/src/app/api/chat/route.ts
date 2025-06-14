import { chatToolSet, getCreatePageSystemPrompt, getSystemPrompt, initModel } from '@onlook/ai';
import { AVAILABLE_MODELS, CLAUDE_MODELS, LLMProvider } from '@onlook/models';
import { generateObject, NoSuchToolError, streamText } from 'ai';

export enum ChatType {
    ASK = 'ask',
    CREATE = 'create',
    EDIT = 'edit',
    FIX = 'fix',
}

export async function POST(req: Request) {
    console.log('=== CHAT API ROUTE CALLED ===');

    const body = await req.json();
    console.log('Full request body:', JSON.stringify(body, null, 2));

    const { messages, maxSteps, chatType, selectedModel } = body;

    console.log('API received selectedModel:', selectedModel);
    console.log('API received chatType:', chatType);
    console.log('API received messages count:', messages?.length);
    console.log('API received maxSteps:', maxSteps);

    // Find the model configuration from AVAILABLE_MODELS
    const modelConfig = AVAILABLE_MODELS.find(m => m.id === selectedModel);

    let provider = LLMProvider.ANTHROPIC;
    let modelName = CLAUDE_MODELS.SONNET_4;

    if (modelConfig && modelConfig.available) {
        provider = modelConfig.provider;
        modelName = modelConfig.model as CLAUDE_MODELS;
    } else if (selectedModel) {
        console.warn(`Model ${selectedModel} is not available or not found, falling back to Claude Sonnet 4`);
    }

    const model = await initModel(provider, modelName);
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
