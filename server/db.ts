import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, predictions, userSubscriptions, subscriptionTiers, InsertPrediction, Prediction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createPrediction(prediction: InsertPrediction): Promise<Prediction | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create prediction: database not available");
    return null;
  }

  try {
    const result = await db.insert(predictions).values(prediction);
    const newPrediction = await db.select().from(predictions).where(eq(predictions.id, result[0].insertId as any)).limit(1);
    return newPrediction.length > 0 ? newPrediction[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create prediction:", error);
    throw error;
  }
}

export async function getPredictionsByUserId(userId: number, limit: number = 50): Promise<Prediction[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get predictions: database not available");
    return [];
  }

  try {
    return await db.select().from(predictions).where(eq(predictions.userId, userId)).orderBy(desc(predictions.createdAt)).limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get predictions:", error);
    return [];
  }
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get subscription: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get subscription:", error);
    return undefined;
  }
}

export async function getSubscriptionTier(tierName: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tier: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(subscriptionTiers).where(eq(subscriptionTiers.name, tierName as any)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get tier:", error);
    return undefined;
  }
}
