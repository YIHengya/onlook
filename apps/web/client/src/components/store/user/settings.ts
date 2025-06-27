import { api } from '@/trpc/client';
import { createDefaultUserSettings, fromUserSettings, toUserSettings } from '@onlook/db';
import type { AISettings, ChatSettings, EditorSettings, UserSettings } from '@onlook/models';
import { makeAutoObservable, reaction } from 'mobx';
import type { UserManager } from './manager';

export class UserSettingsManager {
    settings: UserSettings = toUserSettings(createDefaultUserSettings(''));

    constructor(private userManager: UserManager) {
        makeAutoObservable(this);

        this.restoreSettings();
        reaction(
            () => this.userManager.user,
            () => {
                this.restoreSettings();
            }
        );
    }

    async restoreSettings() {
        const user = this.userManager.user;
        if (!user) {
            console.warn('Cannot restore settings: No user found');
            return;
        }
        const settings = await api.user.settings.get.query({ userId: user.id });
        this.settings = settings;
    }

    async update(newSettings: Partial<UserSettings>) {
        const user = this.userManager.user;
        if (!user) {
            console.error('Cannot update settings: No user found');
            return;
        }

        this.settings = {
            ...this.settings,
            ...newSettings,
        };

        await api.user.settings.upsert.mutate({
            userId: user.id,
            settings: fromUserSettings(user.id, this.settings),
        });
    }

    async updateChat(newSettings: Partial<ChatSettings>) {
        await this.update({ ...this.settings, chat: { ...this.settings.chat, ...newSettings } });
    }
    

    async updateAI(newSettings: Partial<AISettings>) {
        const currentAI = this.settings.ai || {
            provider: 'openai',
            customModels: '',
            selectedModel: '',
            temperature: 0.7,
            topP: 1.0,
            maxTokens: 4000,
            presencePenalty: 0.0,
            frequencyPenalty: 0.0,
            enableCustomInterface: true,
        };

        await this.update({
            ...this.settings,
            ai: { ...currentAI, ...newSettings }
        });
    }

    async updateEditor(newSettings: Partial<EditorSettings>) {
        await this.update({ ...this.settings, editor: { ...this.settings.editor, ...newSettings } });
    }
}
