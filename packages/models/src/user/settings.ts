export interface UserSettings {
    id: string;
    chat: ChatSettings;
    ai?: AISettings;
}

export interface ChatSettings {
    showSuggestions: boolean;
    autoApplyCode: boolean;
    expandCodeBlocks: boolean;
    showMiniChat: boolean;
}

export interface AISettings {
    provider: string;
    baseUrl?: string;
    apiKey?: string;
    customModels: string;
    selectedModel: string;
    temperature: number;
    topP: number;
    maxTokens: number;
    presencePenalty: number;
    frequencyPenalty: number;
    enableCustomInterface: boolean;
}
