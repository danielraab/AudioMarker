# Admin Scripts

## Migrate Audio Storage

This script updates the database to migrate from full file paths to filenames only.

### Usage

#### Development
```bash
npm run migrate:storage
```

#### Production (Docker Container)
```bash
# Execute inside the running container
docker exec -it <container-name> npm run migrate:storage

# Or using docker-compose
docker-compose -f docker/docker-compose.yml exec audio-marker npm run migrate:storage
```

### What it does

1. Updates all database records to store only filenames (e.g., `abc123.mp3` instead of `/uploads/abc123.mp3`)
2. Does NOT move or copy files - files stay in their current location
3. Docker volumes are mounted to the correct locations automatically

### Migration Context

This migration is necessary when upgrading from versions that stored full paths to the new system that uses:
- Database: stores only filenames
- API route: serves files from `/data/uploads` with permission checks
- Docker volumes: `audio_uploads` mounted at `/app/data/uploads`

---

## Create Admin User

This script allows you to create a new admin user or promote an existing user to admin status.

### Usage

#### Development
```bash
npm run admin:create <email>
```

#### Production (Standalone)
```bash
# Using tsx (recommended)
npx tsx scripts/create-admin.ts <email>

# Or using node with tsx loader
node --loader tsx scripts/create-admin.ts <email>
```

#### Production (Docker Container)
```bash
# Execute inside the running container
docker exec -it <container-name> npm run admin:create <email>

# Or using docker-compose
docker-compose -f docker/docker-compose.yml exec audio-marker npm run admin:create <email>

# Example with actual email
docker exec -it audio-marker npm run admin:create admin@example.com
```

### Examples

Create or promote a user to admin:
```bash
npm run admin:create admin@example.com
```

### Behavior

- **If the user exists**: The script will promote them to admin by setting `isAdmin = true`
- **If the user doesn't exist**: The script will create a new user with admin privileges
  - The user will still need to sign in via the configured authentication provider (Authentik or Email)
  - The email will be marked as verified

### Requirements

- Database must be accessible (check `DATABASE_URL` environment variable)
- Valid email address format

### Output

The script provides clear feedback:
- ✅ Success messages when user is created or promoted
- ℹ️  Information about the user's status
- ❌ Error messages if something goes wrong

### Notes

- The script uses Prisma Client to interact with the database
- It's safe to run multiple times on the same email
- The script will automatically disconnect from the database when finished