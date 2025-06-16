import { relations } from 'drizzle-orm';
import { date, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { apiKeys } from './api-keys';

// API 密钥每日使用统计表
export const apiKeyDailyUsage = pgTable('api_key_daily_usage', {
    id: uuid('id').primaryKey().defaultRandom(),
    apiKeyId: uuid('api_key_id')
        .notNull()
        .references(() => apiKeys.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    
    // 统计信息
    usageDate: date('usage_date').notNull(),
    requestCount: integer('request_count').default(0).notNull(),
    
    // 时间戳
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    // 唯一约束：每个API密钥每天只能有一条记录
    uniqueKeyDate: {
        columns: [table.apiKeyId, table.usageDate],
        name: 'api_key_daily_usage_unique'
    }
}));

// 关系定义
export const apiKeyDailyUsageRelations = relations(apiKeyDailyUsage, ({ one }) => ({
    apiKey: one(apiKeys, {
        fields: [apiKeyDailyUsage.apiKeyId],
        references: [apiKeys.id],
    }),
}));

// Zod 验证模式
export const insertApiKeyDailyUsageSchema = createInsertSchema(apiKeyDailyUsage);
export const selectApiKeyDailyUsageSchema = createSelectSchema(apiKeyDailyUsage);

// 类型导出
export type ApiKeyDailyUsage = typeof apiKeyDailyUsage.$inferSelect;
export type NewApiKeyDailyUsage = typeof apiKeyDailyUsage.$inferInsert;
