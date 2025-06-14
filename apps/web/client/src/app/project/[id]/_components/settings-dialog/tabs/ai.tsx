'use client';

import { useUserManager } from '@/components/store/user';
import { Button } from '@onlook/ui/button';
import { Input } from '@onlook/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@onlook/ui/select';
import { Switch } from '@onlook/ui/switch';
import { AVAILABLE_MODELS, LLMProvider, type ModelConfig, type AISettings } from '@onlook/models';
import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';

export const AITab = observer(() => {
    const userManager = useUserManager();
    const [showApiKey, setShowApiKey] = useState(false);

    // Get AI settings from user manager
    const aiSettings = userManager.settings.settings?.ai;

    const [provider, setProvider] = useState(aiSettings?.provider || 'openai');
    const [baseUrl, setBaseUrl] = useState(aiSettings?.baseUrl || '');
    const [apiKey, setApiKey] = useState(aiSettings?.apiKey || '');
    const [customModels, setCustomModels] = useState(aiSettings?.customModels || '');
    const [selectedModel, setSelectedModel] = useState(aiSettings?.selectedModel || (() => {
        // Default to the first available model
        const defaultModel = AVAILABLE_MODELS.find(m => m.available);
        return defaultModel?.id || '';
    })());
    const [temperature, setTemperature] = useState(aiSettings?.temperature || 0.7);
    const [topP, setTopP] = useState(aiSettings?.topP || 1.0);
    const [maxTokens, setMaxTokens] = useState(aiSettings?.maxTokens || 4000);
    const [presencePenalty, setPresencePenalty] = useState(aiSettings?.presencePenalty || 0.0);
    const [frequencyPenalty, setFrequencyPenalty] = useState(aiSettings?.frequencyPenalty || 0.0);
    const [enableCustomInterface, setEnableCustomInterface] = useState(aiSettings?.enableCustomInterface ?? true);

    // Save settings function
    const saveAISettings = async (updates: Partial<AISettings>) => {
        await userManager.settings.updateAI(updates);
    };

    const providers = [
        { value: LLMProvider.OPENAI, label: 'OpenAI' },
        { value: LLMProvider.ANTHROPIC, label: 'Anthropic (Claude)' },
        { value: LLMProvider.GOOGLE, label: 'Google (Gemini)' },
        { value: 'azure', label: 'Azure OpenAI' },
        { value: 'custom', label: 'Custom Provider' }
    ];

    // Get models by provider from AVAILABLE_MODELS
    const getModelsByProvider = (provider: LLMProvider): ModelConfig[] => {
        return AVAILABLE_MODELS.filter(model => model.provider === provider);
    };

    const parseCustomModels = (modelsString: string): string[] => {
        return modelsString
            .split(',')
            .map(model => model.trim())
            .filter(model => model.length > 0);
    };

    // Reset selected model when custom models change
    useEffect(() => {
        // Only reset if the current selected model is no longer available
        const customModelsList = parseCustomModels(customModels);
        const availableModelIds = AVAILABLE_MODELS.map(model => model.id);

        if (selectedModel &&
            !availableModelIds.includes(selectedModel) &&
            !customModelsList.includes(selectedModel)) {
            setSelectedModel('');
        }
    }, [customModels, selectedModel]);

    return (
        <div className="space-y-6">
            {/* Custom Interface Section */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">自定义接口</h2>

                {/* Enable Custom Interface */}
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div>
                        <div className="text-sm font-medium text-gray-300">自定义接口</div>
                        <div className="text-xs text-gray-400">是否使用自定义 Azure 或 OpenAI 服务</div>
                    </div>
                    <Switch
                        checked={enableCustomInterface}
                        onCheckedChange={(checked) => {
                            setEnableCustomInterface(checked);
                            saveAISettings({ enableCustomInterface: checked });
                        }}
                    />
                </div>

                {/* Conditionally render the configuration options based on enableCustomInterface */}
                {enableCustomInterface && (
                    <>
                        {/* Model Provider */}
                        <div className="flex items-center justify-between py-4 border-b border-gray-700">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-300">模型服务商</div>
                                <div className="text-xs text-gray-400">切换不同的服务商</div>
                            </div>
                            <div className="w-[300px] ml-auto">
                                <Select value={provider} onValueChange={(value) => {
                                    setProvider(value);
                                    saveAISettings({ provider: value });
                                }}>
                                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-gray-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                        {providers.map((p) => (
                                            <SelectItem
                                                key={p.value}
                                                value={p.value}
                                                className="text-white hover:bg-gray-700"
                                            >
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Base URL */}
                        <div className="flex items-center justify-between py-4 border-b border-gray-700">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-300">接口地址</div>
                                <div className="text-xs text-gray-400">自定义 API 接口地址</div>
                            </div>
                            <div className="w-[300px] ml-auto">
                                <Input
                                    value={baseUrl}
                                    onChange={(e) => {
                                        setBaseUrl(e.target.value);
                                        saveAISettings({ baseUrl: e.target.value });
                                    }}
                                    placeholder={
                                        provider === 'openai' ? 'https://api.openai.com/v1' :
                                        provider === 'anthropic' ? 'https://api.anthropic.com' :
                                        provider === 'google' ? 'https://generativelanguage.googleapis.com/v1' :
                                        provider === 'azure' ? 'https://your-resource.openai.azure.com' :
                                        'https://your-custom-api.com/v1'
                                    }
                                    className="bg-gray-800 border-gray-600 text-white focus:border-gray-500"
                                />
                            </div>
                        </div>

                        {/* API Key */}
                        <div className="flex items-center justify-between py-4 border-b border-gray-700">
                            <div>
                                <div className="text-sm font-medium text-gray-300">接口密钥</div>
                                <div className="text-xs text-gray-400">使用自定义 API Key</div>
                            </div>
                            <div className="min-w-[300px] relative">
                                <Input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        saveAISettings({ apiKey: e.target.value });
                                    }}
                                    placeholder="Enter your API key"
                                    className="bg-gray-800 border-gray-600 text-white focus:border-gray-500 pr-10"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                >
                                    {showApiKey ? '🙈' : '👁️'}
                                </Button>
                            </div>
                        </div>

                        {/* Custom Models */}
                        <div className="py-4">
                            <div className="mb-3">
                                <div className="text-sm font-medium text-gray-300">自定义模型名</div>
                                <div className="text-xs text-gray-400">增加自定义模型可选项，使用英文逗号隔开 model1,model2,model3</div>
                            </div>
                            <div>
                                <Input
                                    value={customModels}
                                    onChange={(e) => {
                                        setCustomModels(e.target.value);
                                        saveAISettings({ customModels: e.target.value });
                                    }}
                                    placeholder="model1,model2,model3"
                                    className="bg-gray-800 border-gray-600 text-white focus:border-gray-500"
                                />
                                {customModels && (
                                    <div className="text-xs text-blue-400 mt-1">
                                        ({parseCustomModels(customModels).length} model{parseCustomModels(customModels).length !== 1 ? 's' : ''} detected)
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Model Settings Section */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">模型设置</h2>

                {/* Model Selection */}
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-300">模型 (model)</div>
                        <div className="text-xs text-gray-400">选择要使用的AI模型</div>
                    </div>
                    <div className="w-[300px] ml-auto">
                        <Select value={selectedModel} onValueChange={(value) => {
                            setSelectedModel(value);
                            saveAISettings({ selectedModel: value });
                        }}>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-gray-500">
                                <SelectValue placeholder="选择模型" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                                {/* Available Models */}
                                {AVAILABLE_MODELS.map((model) => (
                                    <SelectItem
                                        key={model.id}
                                        value={model.id}
                                        disabled={!model.available}
                                        className="text-white hover:bg-gray-700"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={model.available ? 'text-white' : 'text-gray-400'}>
                                                {model.name}
                                            </span>
                                            {!model.available && (
                                                <span className="text-xs text-gray-400">
                                                    (Coming Soon)
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}

                                {/* Custom Models */}
                                {parseCustomModels(customModels).map((model) => (
                                    <SelectItem
                                        key={`custom-${model}`}
                                        value={model}
                                        className="text-blue-300 hover:bg-gray-700"
                                    >
                                        {model} <span className="text-xs text-gray-400">(自定义)</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Temperature */}
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div>
                        <div className="text-sm font-medium text-gray-300">随机性 (temperature)</div>
                        <div className="text-xs text-gray-400">值越大，回复越随机</div>
                    </div>
                    <div className="min-w-[300px] flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setTemperature(value);
                                saveAISettings({ temperature: value });
                            }}
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-10 text-center text-sm text-gray-300">{temperature}</div>
                    </div>
                </div>

                {/* Top P */}
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div>
                        <div className="text-sm font-medium text-gray-300">核采样 (top_p)</div>
                        <div className="text-xs text-gray-400">与随机性类似，但不要和随机性一起更改</div>
                    </div>
                    <div className="min-w-[300px] flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            defaultValue="1.0"
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-10 text-center text-sm text-gray-300">1.0</div>
                    </div>
                </div>

                {/* Max Tokens */}
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div>
                        <div className="text-sm font-medium text-gray-300">单次回复限制 (max_tokens)</div>
                        <div className="text-xs text-gray-400">单次交互所用的最大 Token 数</div>
                    </div>
                    <div className="min-w-[100px]">
                        <Input
                            type="number"
                            value={maxTokens}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setMaxTokens(value);
                                saveAISettings({ maxTokens: value });
                            }}
                            className="bg-gray-800 border-gray-600 text-white focus:border-gray-500 text-center"
                        />
                    </div>
                </div>

                {/* Presence Penalty */}
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div>
                        <div className="text-sm font-medium text-gray-300">话题新鲜度 (presence_penalty)</div>
                        <div className="text-xs text-gray-400">值越大，越有可能扩展到新话题</div>
                    </div>
                    <div className="min-w-[300px] flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            defaultValue="0.0"
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-10 text-center text-sm text-gray-300">0.0</div>
                    </div>
                </div>

                {/* Frequency Penalty */}
                <div className="flex items-center justify-between py-4">
                    <div>
                        <div className="text-sm font-medium text-gray-300">频率惩罚度 (frequency_penalty)</div>
                        <div className="text-xs text-gray-400">值越大，越有可能降低重复字词</div>
                    </div>
                    <div className="min-w-[300px] flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            defaultValue="0.0"
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-10 text-center text-sm text-gray-300">0.0</div>
                    </div>
                </div>
            </div>
        </div>
    );
});
