# API Reference - Equine Oracle Admin Dashboard

## Overview

All API endpoints are accessed through tRPC. The base URL is `/api/trpc`.

## Authentication Endpoints

### `auth.me`

Get the current authenticated user.

**Type**: Query**Authentication**: Required**Returns**: User object or null

```bash
const user = await trpc.auth.me.useQuery();
// Returns: { id, openId, email, name, role, ... }
```

### `auth.logout`

Logout the current user and clear session.

**Type**: Mutation**Authentication**: Required**Returns**: { success: boolean }

```typescript
await trpc.auth.logout.useMutation();
// Returns: { success: true }
```

## Prediction Endpoints

### `predictions.create`

Create a single horse race prediction.

**Type**: Mutation**Authentication**: Required**Rate Limited**: Yes**Input**:

```typescript
{
  horseName: string;
  track: string;
  raceType: string;
  distance: number;
  raceDate: string;
  daysSinceLastRace?: number;
  winningStreak?: number;
  losingStreak?: number;
  details?: string;
  stakes?: string;
  historicalWinRate?: number;
  recentFormScore?: number;
  trackSpecificWinRate?: number;
}
```

**Returns**:

```typescript
{
  id: number;
  userId: number;
  horseName: string;
  track: string;
  raceType: string;
  distance: number;
  raceDate: string;
  lightgbmProbability: number;      // 0-10000
  randomForestProbability: number;
  gradientBoostingProbability: number;
  logisticRegressionProbability: number;
  ensembleProbability: number;      // Average of all models
  confidence: string;               // "Very High", "High", etc.
  modelExplanation: string;
  createdAt: Date;
}
```

**Example**:

```typescript
const prediction = await trpc.predictions.create.useMutation({
  horseName: "Lucky Strike",
  track: "Ellerslie",
  raceType: "Thoroughbred",
  distance: 1400,
  raceDate: "2024-12-28",
  daysSinceLastRace: 14,
  winningStreak: 2,
  losingStreak: 0,
});
```

### `predictions.list`

Get user's prediction history.

**Type**: Query**Authentication**: Required**Input**:

```typescript
{
  limit?: number; // Default: 50
}
```

**Returns**: Array of Prediction objects

```typescript
const predictions = await trpc.predictions.list.useQuery({ limit: 100 });
```

### `predictions.batch`

Create multiple predictions at once.

**Type**: Mutation**Authentication**: Required**Rate Limited**: Yes (checks total quota)**Input**: Array of prediction objects (same as `create`)

**Returns**: Array of created Prediction objects

```typescript
const predictions = await trpc.predictions.batch.useMutation([
  { horseName: "Horse 1", track: "Ellerslie", ... },
  { horseName: "Horse 2", track: "Cambridge", ... },
]);
```

### `predictions.analytics`

Get prediction analytics for the current user.

**Type**: Query**Authentication**: Required**Returns**:

```typescript
{
  totalPredictions: number;
  averageEnsembleScore: number;     // 0-1 scale
  highConfidenceCount: number;      // Count of "High" or "Very High" predictions
  topHorses: Array<{ name: string; count: number }>;
  topTracks: Array<{ name: string; count: number }>;
}
```

```typescript
const analytics = await trpc.predictions.analytics.useQuery();
```

### `predictions.filtered`

Get filtered predictions.

**Type**: Query**Authentication**: Required**Input**:

```typescript
{
  track?: string;
  horseName?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}
```

**Returns**: Array of Prediction objects

```typescript
const predictions = await trpc.predictions.filtered.useQuery({
  track: "Ellerslie",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-12-31"),
  limit: 50,
});
```

### `predictions.export`

Export predictions as CSV.

**Type**: Query**Authentication**: Required**Returns**:

```typescript
{
  csv: string;      // CSV formatted data
  filename: string; // e.g., "predictions-2024-12-28.csv"
}
```

```typescript
const { csv, filename } = await trpc.predictions.export.useQuery();
// Download CSV file
const blob = new Blob([csv], { type: "text/csv" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();
```

## Subscription Endpoints

### `subscriptions.getCurrent`

Get the current user's subscription tier.

**Type**: Query**Authentication**: Required**Returns**:

```typescript
{
  id: number;
  userId: number;
  tierName: "free" | "basic" | "premium" | "elite";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

```typescript
const subscription = await trpc.subscriptions.getCurrent.useQuery();
```

### `subscriptions.rateLimit`

Get rate limit information for the current user.

**Type**: Query**Authentication**: Required**Returns**:

```typescript
{
  tier: string;
  dailyLimit: number;
  hourlyLimit: number;
  predictionsToday: number;
  remainingToday: number;
}
```

```typescript
const rateLimit = await trpc.subscriptions.rateLimit.useQuery();
```

## Live Predictor Endpoints

### `livePredictor.meets`

Get today's racing meets.

**Type**: Query**Authentication**: Not required**Returns**: Array of Meet objects

```typescript
const meets = await trpc.livePredictor.meets.useQuery();
// Returns: [
//   { id: "meet-1", name: "Matamata", venue: "...", date: "2024-12-28" },
//   ...
// ]
```

### `livePredictor.races`

Get races for a specific meet.

**Type**: Query**Authentication**: Not required**Input**:

```typescript
{
  meetId: string;
}
```

**Returns**: Array of Race objects

```typescript
const races = await trpc.livePredictor.races.useQuery({ meetId: "meet-1" });
```

### `livePredictor.runners`

Get runners for a specific race.

**Type**: Query**Authentication**: Not required**Input**:

```typescript
{
  meetId: string;
  raceNumber: number;
}
```

**Returns**: Array of Runner objects

```typescript
const runners = await trpc.livePredictor.runners.useQuery({
  meetId: "meet-1",
  raceNumber: 1,
});
```

## Analytics Endpoints

### `analytics.dashboard`

Get analytics dashboard data.

**Type**: Query**Authentication**: Required**Returns**: Same as `predictions.analytics`

```typescript
const dashboard = await trpc.analytics.dashboard.useQuery();
```

## Error Handling

All endpoints can throw errors. Handle them appropriately:

```typescript
try {
  const prediction = await trpc.predictions.create.useMutation({
    horseName: "Test",
    track: "Ellerslie",
    raceType: "Thoroughbred",
    distance: 1400,
    raceDate: "2024-12-28",
  });
} catch (error) {
  if (error.message.includes("Rate limit exceeded")) {
    // Handle rate limit
  } else if (error.message.includes("validation")) {
    // Handle validation error
  } else {
    // Handle other errors
  }
}
```

## Rate Limiting

Rate limits are enforced per subscription tier:

| Tier | Daily | Hourly |
| --- | --- | --- |
| Free | 5 | 2 |
| Basic | 50 | 10 |
| Premium | 500 | 50 |
| Elite | 5000 | 500 |

When rate limit is exceeded, the endpoint returns an error:

```
"Daily limit of 5 predictions exceeded for free tier"
```

## Data Types

### Prediction

```typescript
interface Prediction {
  id: number;
  userId: number;
  horseName: string;
  track: string;
  raceType: string;
  distance: number;
  raceDate: string;
  daysSinceLastRace?: number;
  winningStreak?: number;
  losingStreak?: number;
  lightgbmProbability?: number;
  xgboostProbability?: number;
  randomForestProbability?: number;
  gradientBoostingProbability?: number;
  logisticRegressionProbability?: number;
  ensembleProbability?: number;
  confidence?: string;
  modelExplanation?: string;
  createdAt: Date;
}
```

### User

```typescript
interface User {
  id: number;
  openId: string;
  name?: string;
  email?: string;
  loginMethod?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

### SubscriptionTier

```typescript
interface SubscriptionTier {
  id: number;
  name: "free" | "basic" | "premium" | "elite";
  displayName: string;
  price: number; // in cents
  predictionsPerDay: number;
  features: string; // JSON array
  createdAt: Date;
}
```

## Client Integration Example

```typescript
import { trpc } from "@/lib/trpc";

export function PredictionForm() {
  const createPrediction = trpc.predictions.create.useMutation();
  const rateLimit = trpc.subscriptions.rateLimit.useQuery();

  const handleSubmit = async (data) => {
    try {
      if (!rateLimit.data?.remainingToday) {
        alert("Rate limit exceeded");
        return;
      }

      const result = await createPrediction.mutateAsync(data);
      console.log("Prediction created:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Pagination

For endpoints that return lists, use the `limit` parameter:

```typescript
// Get first 50 predictions
const page1 = await trpc.predictions.list.useQuery({ limit: 50 });

// Get next 50 (implement offset in future)
const page2 = await trpc.predictions.list.useQuery({ limit: 50 });
```

## Caching

tRPC automatically caches query results. To invalidate cache:

```typescript
const utils = trpc.useUtils();

// After mutation
await createPrediction.mutateAsync(data);
utils.predictions.list.invalidate();
utils.predictions.analytics.invalidate();
```

## Webhooks (Future)

Webhook support coming soon for:

- Prediction created

- Race completed

- Accuracy updated

- Subscription changed

