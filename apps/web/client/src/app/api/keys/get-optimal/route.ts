import { db } from '@onlook/db/src/client';
import { apiKeys } from '@onlook/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    console.log('=== API KEYS GET-OPTIMAL ENDPOINT CALLED ===');

    try {
        const { provider } = await req.json();

        if (!provider) {
            console.log('Error: Provider is required');
            return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
        }

        console.log(`Getting optimal API key for provider: ${provider}`);

        // 添加超时处理的数据库查询
        console.log('Starting database query...');
        const queryStart = Date.now();

        // 获取活跃的API密钥
        const availableApiKeys = await Promise.race([
            db.query.apiKeys.findMany({
                where: and(
                    eq(apiKeys.provider, provider as any),
                    eq(apiKeys.isActive, true)
                ),
                orderBy: [desc(apiKeys.lastUsedAt), desc(apiKeys.createdAt)],
                limit: 10, // 增加限制以获取更多候选密钥
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database query timeout')), 5000)
            )
        ]) as any[];

        const queryTime = Date.now() - queryStart;
        console.log(`Database query completed in ${queryTime}ms`);
        console.log(`Found ${availableApiKeys.length} API keys for provider: ${provider}`);

        if (availableApiKeys.length === 0) {
            console.log('No API keys found in database');
            return NextResponse.json({
                error: 'No API keys found',
                apiKey: null
            }, { status: 404 });
        }

        // 选择使用次数最少或最近最少使用的 key
        const optimalKey = availableApiKeys.reduce((prev, current) => {
            if (prev.usageCount < current.usageCount) return prev;
            if (prev.usageCount === current.usageCount) {
                return new Date(prev.lastUsedAt || 0) < new Date(current.lastUsedAt || 0) ? prev : current;
            }
            return current;
        });

        console.log(`Selected API key: ${optimalKey.id} (usage: ${optimalKey.usageCount})`);

        // 更新使用统计
        await db.update(apiKeys)
            .set({
                usageCount: optimalKey.usageCount + 1,
                lastUsedAt: new Date(),
            })
            .where(eq(apiKeys.id, optimalKey.id));

        console.log('Updated API key usage statistics');

        // 获取今天的日期字符串
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0]; // 格式化为YYYY-MM-DD

        // 尝试更新今日使用记录
        try {
            // 使用原生SQL，避免类型问题，并使用字符串日期
            await db.execute(sql`
                WITH upsert AS (
                    UPDATE api_key_daily_usage
                    SET request_count = request_count + 1, updated_at = NOW()
                    WHERE api_key_id = ${optimalKey.id}
                    AND usage_date = ${todayStr}::date
                    RETURNING *
                )
                INSERT INTO api_key_daily_usage (api_key_id, usage_date, request_count)
                SELECT ${optimalKey.id}, ${todayStr}::date, 1
                WHERE NOT EXISTS (SELECT * FROM upsert)
            `);
            
            console.log('Updated daily usage statistics');
        } catch (err) {
            console.error('Failed to update daily usage:', err);
            // 继续执行，不要因为统计更新失败而中断主流程
        }

        return NextResponse.json({
            apiKey: optimalKey.apiKey,
            keyId: optimalKey.id,
            usageCount: optimalKey.usageCount + 1
        });

    } catch (error) {
        console.error('Database operation failed:', error);
        return NextResponse.json({ 
            error: 'Database operation failed',
            apiKey: null 
        }, { status: 500 });
    }
}
