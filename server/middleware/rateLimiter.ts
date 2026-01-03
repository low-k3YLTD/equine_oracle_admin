/**
 * Rate Limiting Middleware
 * Enforces subscription tier-based rate limits on predictions
 */

import { getUserSubscription, getSubscriptionTier, getPredictionCountToday } from "../db";

interface RateLimitConfig {
  free: { perDay: number; perHour: number };
  basic: { perDay: number; perHour: number };
  premium: { perDay: number; perHour: number };
  elite: { perDay: number; perHour: number };
}

const RATE_LIMITS: RateLimitConfig = {
  free: { perDay: 5, perHour: 2 },
  basic: { perDay: 50, perHour: 10 },
  premium: { perDay: 500, perHour: 50 },
  elite: { perDay: 5000, perHour: 500 },
};

/**
 * Check if a user has exceeded their rate limit
 */
export async function checkRateLimit(userId: number): Promise<{ allowed: boolean; remaining: number; tier: string; message?: string }> {
  try {
    const userSubscription = await getUserSubscription(userId);
    const tierName = userSubscription?.tierName || "free";
    
    const tier = await getSubscriptionTier(tierName);
    if (!tier) {
      return {
        allowed: false,
        remaining: 0,
        tier: tierName,
        message: "Subscription tier not found",
      };
    }

    const predictionsToday = await getPredictionCountToday(userId);
    const limit = RATE_LIMITS[tierName as keyof RateLimitConfig]?.perDay || 5;

    if (predictionsToday >= limit) {
      return {
        allowed: false,
        remaining: 0,
        tier: tierName,
        message: `Daily limit of ${limit} predictions exceeded for ${tierName} tier`,
      };
    }

    return {
      allowed: true,
      remaining: limit - predictionsToday,
      tier: tierName,
    };
  } catch (error) {
    console.error("[RateLimiter] Error checking rate limit:", error);
    return {
      allowed: false,
      remaining: 0,
      tier: "unknown",
      message: "Error checking rate limit",
    };
  }
}

/**
 * Get rate limit info for a user
 */
export async function getRateLimitInfo(userId: number) {
  try {
    const userSubscription = await getUserSubscription(userId);
    const tierName = userSubscription?.tierName || "free";
    
    const predictionsToday = await getPredictionCountToday(userId);
    const limits = RATE_LIMITS[tierName as keyof RateLimitConfig] || RATE_LIMITS.free;

    return {
      tier: tierName,
      dailyLimit: limits.perDay,
      hourlyLimit: limits.perHour,
      predictionsToday,
      remainingToday: Math.max(0, limits.perDay - predictionsToday),
    };
  } catch (error) {
    console.error("[RateLimiter] Error getting rate limit info:", error);
    return {
      tier: "free",
      dailyLimit: 5,
      hourlyLimit: 2,
      predictionsToday: 0,
      remainingToday: 5,
    };
  }
}
