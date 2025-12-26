# Environment Configuration Guide

This guide explains how to set up and configure all environment variables required for the Equine Oracle Admin Dashboard.

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values (see sections below)

3. Restart the development server:
   ```bash
   pnpm dev
   ```

---

## Environment Variables Reference

### Manus Platform Configuration

#### `VITE_APP_ID`
- **Description**: Your application ID from Manus Dashboard
- **Required**: Yes
- **Where to find**: Manus Dashboard → Settings → General
- **Example**: `app_123456789`
- **Used for**: OAuth authentication, API identification

#### `OAUTH_SERVER_URL`
- **Description**: The OAuth server endpoint for Manus authentication
- **Required**: Yes
- **Default (Manus)**: `https://oauth.manus.io` (automatically injected)
- **Used for**: OAuth token exchange, user info retrieval
- **Note**: This should be automatically set by Manus platform

#### `JWT_SECRET`
- **Description**: Secret key for signing session tokens
- **Required**: Yes
- **Length**: Minimum 32 characters (recommended 64+)
- **How to generate**: 
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Used for**: Session token signing and verification
- **Security**: Keep this secret! Never commit to version control

#### `OWNER_OPEN_ID`
- **Description**: The OpenID of the admin/owner user
- **Required**: Yes
- **Where to find**: Obtained after first OAuth login
- **Used for**: Admin user identification, access control
- **How to get**: 
  1. Log in with your account
  2. Check the database or logs for your OpenID
  3. Add it to this configuration

---

### Database Configuration

#### `DATABASE_URL`
- **Description**: MySQL database connection string
- **Required**: Yes
- **Format**: `mysql://username:password@host:port/database_name`
- **Examples**:
  - Local: `mysql://root:password@localhost:3306/equine_oracle`
  - Remote: `mysql://user:pass@db.example.com:3306/equine_oracle`
- **Setup steps**:
  1. Create MySQL database: `CREATE DATABASE equine_oracle;`
  2. Run migrations: `pnpm db:push`
  3. Verify connection: `pnpm check`

---

### Manus Forge API Configuration

#### `BUILT_IN_FORGE_API_URL`
- **Description**: Endpoint for Manus Forge API services
- **Required**: Yes (for LLM and advanced features)
- **Default (Manus)**: `https://api.manus.io/forge` (automatically injected)
- **Used for**: AI features, LLM integration

#### `BUILT_IN_FORGE_API_KEY`
- **Description**: Authentication key for Forge API
- **Required**: Yes (for LLM and advanced features)
- **Where to find**: Manus Dashboard → Settings → Secrets
- **Used for**: Authenticating requests to Forge API
- **Security**: Keep this secret!

---

### Racing API Configuration

#### `RACING_API_USERNAME`
- **Description**: Username for The Racing API
- **Required**: Yes (for live race data)
- **Where to get**: https://www.theracingapi.com → Account Settings
- **Used for**: Authenticating with The Racing API

#### `RACING_API_PASSWORD`
- **Description**: Password for The Racing API
- **Required**: Yes (for live race data)
- **Where to get**: https://www.theracingapi.com → Account Settings
- **Used for**: Authenticating with The Racing API
- **Security**: Keep this secret!

---

### Analytics Configuration (Optional)

#### `VITE_ANALYTICS_ENDPOINT`
- **Description**: URL of your Umami analytics instance
- **Required**: No (optional for analytics)
- **Example**: `https://analytics.example.com`
- **Used for**: Tracking user interactions and page views

#### `VITE_ANALYTICS_WEBSITE_ID`
- **Description**: Website ID in your Umami instance
- **Required**: No (optional for analytics)
- **Example**: `550e8400-e29b-41d4-a716-446655440000`
- **Used for**: Identifying which website to track

---

### Runtime Configuration

#### `NODE_ENV`
- **Description**: Application environment mode
- **Values**: `development` or `production`
- **Default**: `development`
- **Used for**: Conditional logic, logging levels, optimization

---

## Setup by Environment

### Local Development

1. **Create `.env.local`**:
   ```bash
   cp .env.example .env.local
   ```

2. **Generate JWT_SECRET**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Set up local MySQL**:
   ```bash
   # Install MySQL if not already installed
   brew install mysql  # macOS
   # or
   sudo apt-get install mysql-server  # Linux

   # Start MySQL
   mysql.server start  # macOS
   # or
   sudo systemctl start mysql  # Linux

   # Create database
   mysql -u root -p -e "CREATE DATABASE equine_oracle;"
   ```

4. **Configure `.env.local`**:
   ```env
   VITE_APP_ID=local_dev_app
   OAUTH_SERVER_URL=https://oauth.manus.io
   JWT_SECRET=your_generated_secret_here
   DATABASE_URL=mysql://root:password@localhost:3306/equine_oracle
   OWNER_OPEN_ID=your_open_id
   BUILT_IN_FORGE_API_URL=https://api.manus.io/forge
   BUILT_IN_FORGE_API_KEY=your_forge_key
   RACING_API_USERNAME=your_racing_username
   RACING_API_PASSWORD=your_racing_password
   NODE_ENV=development
   ```

5. **Run migrations**:
   ```bash
   pnpm db:push
   ```

6. **Start development server**:
   ```bash
   pnpm dev
   ```

### Manus Platform (Production)

1. **Navigate to Management UI** → Settings → Secrets

2. **Add the following secrets**:
   - `VITE_APP_ID`: Your app ID
   - `JWT_SECRET`: Strong random string (64+ characters)
   - `DATABASE_URL`: Your production database URL
   - `OWNER_OPEN_ID`: Admin user's OpenID
   - `RACING_API_USERNAME`: Your Racing API username
   - `RACING_API_PASSWORD`: Your Racing API password

3. **Verify automatic injection**:
   - `OAUTH_SERVER_URL` - Automatically set by Manus
   - `BUILT_IN_FORGE_API_URL` - Automatically set by Manus
   - `BUILT_IN_FORGE_API_KEY` - Automatically set by Manus

4. **Restart the application**:
   - Click "Restart" in the Management UI
   - Or redeploy the application

---

## Troubleshooting

### `[Auth] Missing session cookie`
- **Cause**: `OAUTH_SERVER_URL` not set
- **Solution**: 
  1. Check Manus Dashboard for correct OAuth server URL
  2. Verify environment variables in Settings → Secrets
  3. Restart the development server

### `[OAuth] ERROR: OAUTH_SERVER_URL is not configured`
- **Cause**: `OAUTH_SERVER_URL` environment variable is empty
- **Solution**: 
  1. In Manus: Settings → Secrets → Add `OAUTH_SERVER_URL`
  2. In local dev: Add to `.env.local`
  3. Restart the server

### Database connection errors
- **Cause**: `DATABASE_URL` is incorrect or database is not running
- **Solution**:
  1. Verify MySQL is running: `mysql -u root -p -e "SELECT 1;"`
  2. Check connection string format
  3. Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`
  4. Run migrations: `pnpm db:push`

### Racing API authentication fails
- **Cause**: `RACING_API_USERNAME` or `RACING_API_PASSWORD` is incorrect
- **Solution**:
  1. Verify credentials at https://www.theracingapi.com
  2. Check for special characters in password (may need escaping)
  3. Test credentials manually with API

### Forge API errors
- **Cause**: `BUILT_IN_FORGE_API_KEY` is invalid or expired
- **Solution**:
  1. Regenerate key in Manus Dashboard
  2. Update in Settings → Secrets
  3. Restart the application

---

## Security Best Practices

1. **Never commit secrets to version control**
   - `.env.local` should be in `.gitignore`
   - Use `.env.example` for documentation only

2. **Use strong secrets**
   - JWT_SECRET: 64+ random characters
   - API keys: Use generated keys from providers
   - Passwords: Use strong, unique passwords

3. **Rotate secrets regularly**
   - Change JWT_SECRET every 90 days
   - Rotate API keys when compromised
   - Update Racing API credentials periodically

4. **Use a secrets manager in production**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Manus Secrets Management (Settings → Secrets)

5. **Audit access**
   - Log who accesses secrets
   - Monitor for suspicious activity
   - Review access logs regularly

---

## Verification Checklist

Before deploying, verify:

- [ ] All required variables are set
- [ ] Database connection works: `pnpm check`
- [ ] OAuth login works
- [ ] Racing API data fetches correctly
- [ ] No console errors on startup
- [ ] Application loads without auth errors
- [ ] Admin user can access dashboard

---

## Additional Resources

- [Manus Documentation](https://docs.manus.io)
- [The Racing API Documentation](https://www.theracingapi.com/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Environment Variables Best Practices](https://12factor.net/config)

---

## Support

If you encounter issues:

1. Check the logs: `pnpm dev` shows detailed error messages
2. Review this guide for your specific error
3. Check Manus Dashboard for service status
4. Contact support with error logs and configuration details
