import { DefaultSettings } from '@onlook/constants';
import type { UserMetadata, UserSettings, AISettings } from '@onlook/models';
import { get } from 'lodash';
import type { AuthUser, UserSettings as DbUserSettings } from '../schema';

export const toUserSettings = (settings: DbUserSettings): UserSettings => {
    const aiSettings: AISettings = {
        provider: settings.aiProvider ?? 'openai',
        baseUrl: settings.aiBaseUrl ?? undefined,
        apiKey: settings.aiApiKey ?? undefined,
        customModels: settings.aiCustomModels ?? '',
        selectedModel: settings.aiSelectedModel ?? '',
        temperature: settings.aiTemperature ?? 0.7,
        topP: settings.aiTopP ?? 1.0,
        maxTokens: settings.aiMaxTokens ?? 4000,
        presencePenalty: settings.aiPresencePenalty ?? 0.0,
        frequencyPenalty: settings.aiFrequencyPenalty ?? 0.0,
        enableCustomInterface: settings.aiEnableCustomInterface ?? true,
    };

    return {
        id: settings.id,
        chat: {
            autoApplyCode: settings.autoApplyCode ?? DefaultSettings.CHAT_SETTINGS.autoApplyCode,
            expandCodeBlocks:
                settings.expandCodeBlocks ?? DefaultSettings.CHAT_SETTINGS.expandCodeBlocks,
            showSuggestions:
                settings.showSuggestions ?? DefaultSettings.CHAT_SETTINGS.showSuggestions,
            showMiniChat: settings.showMiniChat ?? DefaultSettings.CHAT_SETTINGS.showMiniChat,
        },
        editor: {
            shouldWarnDelete: settings.shouldWarnDelete ?? DefaultSettings.EDITOR_SETTINGS.shouldWarnDelete,
        },
        ai: aiSettings,
    };
};

export const fromUserSettings = (userId: string, settings: UserSettings): DbUserSettings => {
    return {
        id: settings.id,
        userId,
        // Chat settings
        autoApplyCode: settings.chat.autoApplyCode,
        expandCodeBlocks: settings.chat.expandCodeBlocks,
        showSuggestions: settings.chat.showSuggestions,
        showMiniChat: settings.chat.showMiniChat,
        shouldWarnDelete: settings.editor.shouldWarnDelete,
        // AI settings
        aiProvider: settings.ai?.provider ?? 'openai',
        aiBaseUrl: settings.ai?.baseUrl ?? null,
        aiApiKey: settings.ai?.apiKey ?? null,
        aiCustomModels: settings.ai?.customModels ?? '',
        aiSelectedModel: settings.ai?.selectedModel ?? '',
        aiTemperature: settings.ai?.temperature ?? 0.7,
        aiTopP: settings.ai?.topP ?? 1.0,
        aiMaxTokens: settings.ai?.maxTokens ?? 4000,
        aiPresencePenalty: settings.ai?.presencePenalty ?? 0.0,
        aiFrequencyPenalty: settings.ai?.frequencyPenalty ?? 0.0,
        aiEnableCustomInterface: settings.ai?.enableCustomInterface ?? true,
    };
};

export const fromAuthUser = (authUser: AuthUser): UserMetadata => {
    return {
        id: authUser.id,
        name: get(authUser.rawUserMetaData, 'full_name'),
        email: authUser.email,
        avatarUrl: get(authUser.rawUserMetaData, 'avatar_url'),
    };
};
