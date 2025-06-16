import { relations } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { apiKeyDailyUsage } from './daily-usage';

// API 提供商枚举
export const apiProviderEnum = pgEnum('api_provider', [
    'anthropic',
    'openai', 
    'google',
    'morph',
    'relace',
    'codesandbox'
]);

// API 密钥表
export const apiKeys = pgTable('api_keys', {
    id: uuid('id').primaryKey().defaultRandom(),
    
    // 基本信息
    provider: apiProviderEnum('provider').notNull(),
    apiKey: text('api_key').notNull(),
    
    // 状态管理
    isActive: boolean('is_active').default(true).notNull(),
    
    // 使用统计（简单计数）
    usageCount: integer('usage_count').default(0).notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    
    // 时间戳
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 关系定义
export const apiKeysRelations = relations(apiKeys, ({ many }) => ({
    dailyUsage: many(apiKeyDailyUsage),
}));

// Zod 验证模式
export const insertApiKeySchema = createInsertSchema(apiKeys);
export const selectApiKeySchema = createSelectSchema(apiKeys);

// 类型导出
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
