import { relations } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { boolean, pgTable, uuid, text, real, integer } from 'drizzle-orm/pg-core';
import { users } from './user';

export const userSettings = pgTable("user_settings", {
    id: uuid("id")
        .primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
        .unique(),
    // Chat settings
    autoApplyCode: boolean("auto_apply_code").notNull().default(true),
    expandCodeBlocks: boolean("expand_code_blocks").notNull().default(true),
    showSuggestions: boolean("show_suggestions").notNull().default(true),
    showMiniChat: boolean("show_mini_chat").notNull().default(true),
    shouldWarnDelete: boolean("should_warn_delete").notNull().default(true),
    // AI settings
    aiProvider: text("ai_provider").default("openai"),
    aiBaseUrl: text("ai_base_url"),
    aiApiKey: text("ai_api_key"),
    aiCustomModels: text("ai_custom_models").default(""),
    aiSelectedModel: text("ai_selected_model").default(""),
    aiTemperature: real("ai_temperature").default(0.7),
    aiTopP: real("ai_top_p").default(1.0),
    aiMaxTokens: integer("ai_max_tokens").default(4000),
    aiPresencePenalty: real("ai_presence_penalty").default(0.0),
    aiFrequencyPenalty: real("ai_frequency_penalty").default(0.0),
    aiEnableCustomInterface: boolean("ai_enable_custom_interface").default(true),
}).enableRLS();

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
    user: one(users, {
        fields: [userSettings.userId],
        references: [users.id],
    }),
}));

export const userSettingsInsertSchema = createInsertSchema(userSettings);
export const userSettingsUpdateSchema = createUpdateSchema(userSettings);
export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
