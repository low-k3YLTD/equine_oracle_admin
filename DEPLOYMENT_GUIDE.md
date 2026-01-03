# Deployment Guide - Equine Oracle Admin Dashboard

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm

- MySQL 8.0+ database

- Manus OAuth credentials

### Installation

1. **Clone and install dependencies**

```bash
cd equine_oracle_admin
pnpm install
```

1. **Configure environment variables** Create a `.env.local` file:

```
DATABASE_URL=mysql://user:password@localhost:3306/equine_oracle
JWT_SECRET=your-secret-key-here
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
```

1. **Set up the database**

```bash
pnpm db:push
```

1. **Start development server**

```bash
pnpm dev
```

The application will be available at `http://localhost:3001`

## Database Setup

### MySQL Database Creation

```sql
CREATE DATABASE equine_oracle;
US
E equine_oracle;
```

### Initialize Schema

The schema is automatically created when you run:

```bash
pnpm db:push
```

This creates the following tables:

- `users` - User authentication

- `subscriptionTiers` - Subscription tier definitions

- `userSubscriptions` - User subscription assignments

- `predictions` - Prediction history

### Seed Subscription Tiers

```sql
INSERT INTO subscriptionTiers (name, displayName, price, predictionsPerDay, features ) VALUES
('free', 'Free', 0, 5, '["single_prediction", "basic_analytics"]'),
('basic', 'Basic', 999, 50, '["single_prediction", "batch_predictions", "analytics"]'),
('premium', 'Premium', 4999, 500, '["single_prediction", "batch_predictions", "advanced_analytics", "csv_export"]'),
('elite', 'Elite', 9999, 5000, '["all_features", "priority_support", "api_access"]');
```

## Development

### Available Commands

```bash
# Start development server
pnpm dev

# Type checking
pnpm check

# Run tests
pnpm test

# Format code
pnpm format

# Build for production
pnpm build

# Start production server
pnpm start
```

### Project Structure

```
equine_oracle_admin/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── App.tsx        # Main app component
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── server/                # Backend
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database queries
│   ├── services/          # Business logic
│   │   ├── mlPredictionService.ts
│   │   └── racingApiService.ts
│   ├── middleware/        # Middleware
│   │   └── rateLimiter.ts
│   └── utils/             # Utilities
│       └── csvExport.ts
├── drizzle/               # Database schema
│   └── schema.ts
└── vitest.config.ts       # Test configuration
```

## Production Deployment

### Build

```bash
pnpm build
```

This creates:

- `dist/` - Production build

### Environment Setup

For production, ensure these environment variables are set:

```bash
export NODE_ENV=production
export DATABASE_URL=mysql://prod_user:prod_password@prod_host:3306/equine_oracle
export JWT_SECRET=your-production-secret-key
export VITE_APP_ID=production-app-id
export OAUTH_SERVER_URL=https://api.manus.im
```

### Start Production Server

```bash
pnpm start
```

Or with Gunicorn/PM2:

```bash
# Using PM2
pm2 start dist/index.js --name "equine-oracle"

# Or with Node directly
node dist/index.js
```

### Docker Deployment

Create a `Dockerfile`:

```
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:

```bash
docker build -t equine-oracle .
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  -e JWT_SECRET=... \
  equine-oracle
```

## API Integration

### Racing API Configuration

The system supports live race data integration. Configure in `server/services/racingApiService.ts`:

```typescript
// Set your racing API credentials
export const ENV = {
  racingApiUsername: process.env.RACING_API_USERNAME,
  racingApiPassword: process.env.RACING_API_PASSWORD,
};
```

### ML Model Integration

The ML prediction service uses ensemble models. To integrate with external ML APIs:

1. Update `server/services/mlPredictionService.ts`

1. Add API client for your ML service

1. Modify `makePrediction( )` function to call external API

## Monitoring and Logging

### Health Check

Add a health endpoint to `server/routers.ts`:

```typescript
health: publicProcedure.query(async () => {
  const db = await getDb();
  return {
    status: db ? 'healthy' : 'unhealthy',
    timestamp: new Date(),
  };
}),
```

### Logging

All major operations log to console. For production logging:

1. Install Winston or Pino

1. Configure in `server/_core/index.ts`

1. Send logs to centralized service (ELK, Datadog, etc.)

## Performance Optimization

### Database Optimization

Add indexes for frequently queried fields:

```sql
CREATE INDEX idx_predictions_userId_createdAt ON predictions(userId, createdAt DESC);
CREATE INDEX idx_predictions_track ON predictions(track);
CREATE INDEX idx_userSubscriptions_userId ON userSubscriptions(userId);
```

### Caching

Implement Redis caching for:

- Racing API responses

- User subscription data

- Analytics results

### Load Balancing

For high traffic:

1. Use multiple server instances

1. Configure load balancer (Nginx, HAProxy)

1. Use sticky sessions for WebSocket support

1. Database connection pooling

## Security Checklist

- [ ] Use HTTPS in production

- [ ] Set strong JWT_SECRET

- [ ] Enable CORS properly

- [ ] Validate all user inputs

- [ ] Use environment variables for secrets

- [ ] Keep dependencies updated

- [ ] Enable database SSL/TLS

- [ ] Set up firewall rules

- [ ] Monitor for suspicious activity

- [ ] Regular security audits

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
mysql -h localhost -u user -p database_name

# Check DATABASE_URL format
# mysql://username:password@host:port/database
```

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 pnpm dev
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules .next dist
pnpm install
pnpm build
```

### Test Failures

```bash
# Run tests with verbose output
pnpm test -- --reporter=verbose

# Run specific test file
pnpm test server/routers.test.ts
```

## Support and Resources

- **Documentation**: See `BACKEND_INTEGRATION_COMPLETE.md`

- **API Reference**: See `server/routers.ts`

- **Database Schema**: See `drizzle/schema.ts`

- **ML Models**: See `server/services/mlPredictionService.ts`

## Rollback Procedures

If deployment fails:

1. Check logs for errors

1. Verify database migrations

1. Rollback to previous version

1. Check environment variables

1. Restart services

## Next Steps

1. Deploy to staging environment

1. Run integration tests

1. Performance testing

1. Security audit

1. Deploy to production

1. Monitor system health

