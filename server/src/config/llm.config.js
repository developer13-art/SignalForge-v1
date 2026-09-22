/**
 * LLM Configuration
 *
 * Configures the LLM gateway that abstracts over providers such as
 * OpenAI, Anthropic, and Google. The gateway is used for signal
 * classification, parsing, and Provider DNA learning.
 *
 * @module signalforge/server/config/llm
 */

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

const llmConfig = Object.freeze({
  defaultProvider: process.env.LLM_PROVIDER || 'openai',

  providers: {
    openai: {
      enabled: toBoolean(process.env.OPENAI_ENABLED, true),
      apiKey: process.env.OPENAI_API_KEY || null,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      organization: process.env.OPENAI_ORG_ID || null,
      timeoutMs: toNumber(process.env.OPENAI_TIMEOUT_MS, 30000),
    },

    anthropic: {
      enabled: toBoolean(process.env.ANTHROPIC_ENABLED, false),
      apiKey: process.env.ANTHROPIC_API_KEY || null,
      baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      timeoutMs: toNumber(process.env.ANTHROPIC_TIMEOUT_MS, 30000),
    },

    google: {
      enabled: toBoolean(process.env.GOOGLE_AI_ENABLED, false),
      apiKey: process.env.GOOGLE_AI_API_KEY || null,
      baseUrl: process.env.GOOGLE_AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1',
      model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-pro',
      timeoutMs: toNumber(process.env.GOOGLE_AI_TIMEOUT_MS, 30000),
    },

    local: {
      enabled: toBoolean(process.env.LOCAL_LLM_ENABLED, false),
      baseUrl: process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1',
      model: process.env.LOCAL_LLM_MODEL || 'llama3',
      apiKey: process.env.LOCAL_LLM_API_KEY || null,
      timeoutMs: toNumber(process.env.LOCAL_LLM_TIMEOUT_MS, 60000),
    },
  },

  defaults: {
    maxTokens: toNumber(process.env.LLM_MAX_TOKENS, 2000),
    temperature: toNumber(process.env.LLM_TEMPERATURE, 0.1),
    topP: toNumber(process.env.LLM_TOP_P, 1.0),
    frequencyPenalty: toNumber(process.env.LLM_FREQUENCY_PENALTY, 0),
    presencePenalty: toNumber(process.env.LLM_PRESENCE_PENALTY, 0),
    timeoutMs: toNumber(process.env.LLM_TIMEOUT_MS, 30000),
    maxRetries: toNumber(process.env.LLM_RETRY_ATTEMPTS, 3),
  },

  routing: {
    strategy: process.env.LLM_ROUTING_STRATEGY || 'primary_fallback',
    primary: process.env.LLM_PRIMARY_PROVIDER || 'openai',
    fallback: process.env.LLM_FALLBACK_PROVIDER || 'anthropic',
    costOptimization: toBoolean(process.env.LLM_COST_OPTIMIZATION, true),
  },

  rateLimit: {
    requestsPerMinute: toNumber(process.env.LLM_RATE_LIMIT_PER_MINUTE, 500),
    tokensPerMinute: toNumber(process.env.LLM_TOKENS_PER_MINUTE, 90000),
    concurrentRequests: toNumber(process.env.LLM_CONCURRENT_REQUESTS, 20),
  },

  cost: {
    trackUsage: toBoolean(process.env.LLM_TRACK_USAGE, true),
    dailyBudgetUsd: toNumber(process.env.LLM_DAILY_BUDGET_USD, 100),
    monthlyBudgetUsd: toNumber(process.env.LLM_MONTHLY_BUDGET_USD, 2000),
    alertThresholdPercent: toNumber(process.env.LLM_ALERT_THRESHOLD_PERCENT, 80),
  },

  promptManagement: {
    versioning: toBoolean(process.env.LLM_PROMPT_VERSIONING, true),
    directory: './src/modules/ai-signal-intelligence/llm/prompts',
    cacheEnabled: true,
  },

  safety: {
    enabled: true,
    moderationEndpoint: toBoolean(process.env.LLM_MODERATION_ENABLED, true),
    blockHarmful: true,
  },
});

export default llmConfig;