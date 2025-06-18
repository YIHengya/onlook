import { getBaseUrl } from '@/trpc/helpers';

/**
 * 从数据库或环境变量获取指定提供商的API密钥
 * @param provider 提供商名称：'anthropic', 'openai', 'google', 'bedrock'
 */
export async function getProviderApiKey(provider: string): Promise<string | null> {
    let selectedApiKey: string | null = null;
    try {
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
    
    return selectedApiKey;
} 