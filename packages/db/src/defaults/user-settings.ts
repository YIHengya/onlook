import { DefaultSettings } from '@onlook/constants';
import type { UserSettings as DbUserSettings } from '@onlook/db';
import { v4 as uuid } from 'uuid';

export const createDefaultUserSettings = (userId: string): DbUserSettings => {
    return {
        id: uuid(),
        userId,
        // Chat settings
        autoApplyCode: DefaultSettings.CHAT_SETTINGS.autoApplyCode,
        expandCodeBlocks: DefaultSettings.CHAT_SETTINGS.expandCodeBlocks,
        showSuggestions: DefaultSettings.CHAT_SETTINGS.showSuggestions,
        showMiniChat: DefaultSettings.CHAT_SETTINGS.showMiniChat,
        // AI settings with defaults
        aiProvider: 'openai',
        aiBaseUrl: null,
        aiApiKey: null,
        aiCustomModels: '',
        aiSelectedModel: '',
        aiTemperature: 0.7,
        aiTopP: 1.0,
        aiMaxTokens: 4000,
        aiPresencePenalty: 0.0,
        aiFrequencyPenalty: 0.0,
        aiEnableCustomInterface: true,
        shouldWarnDelete: DefaultSettings.EDITOR_SETTINGS.shouldWarnDelete,
    };
};
