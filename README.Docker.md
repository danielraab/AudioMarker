# Docker Setup for Audio Marker

This document provides instructions for running the Audio Marker application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually included with Docker Desktop)

## Quick Start

1. **Clone the repository and navigate to the project directory**

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and set your environment variables:
   ```env
   DATABASE_URL="file:/app/data/db.sqlite"
   AUTH_URL="http://localhost:3000"
   AUTH_SECRET="your-secure-secret-here"
   AUTH_AUTHENTIK_ID="your-authentik-id"
   AUTH_AUTHENTIK_SECRET="your-authentik-secret"
   AUTH_AUTHENTIK_ISSUER="your-authentik-issuer"
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Docker Configuration

### Volumes

The application uses two persistent volumes:

- **`audio_uploads`**: Stores uploaded audio files (`/app/public/uploads`)
- **`database_data`**: Stores the SQLite database (`/app/data`)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:/app/data/db.sqlite` |
| `AUTH_URL` | Application URL for authentication | `http://localhost:3000` |
| `AUTH_SECRET` | Secret key for NextAuth.js | Required |
| `AUTH_AUTHENTIK_ID` | Authentik OAuth client ID | Required |
| `AUTH_AUTHENTIK_SECRET` | Authentik OAuth client secret | Required |
| `AUTH_AUTHENTIK_ISSUER` | Authentik issuer URL | Required |

## Docker Commands

### Build the image
```bash
docker build -t audio-marker .
```

### Run with Docker Compose
```bash
# Start in foreground
docker-compose up

# Start in background
docker-compose up -d

# Build and start
docker-compose up --build

# Stop the application
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

### Run manually with Docker
```bash
# Create volumes
docker volume create audio_uploads
docker volume create database_data

# Run the container
docker run -d \
  --name audio-marker \
  -p 3000:3000 \
  -v audio_uploads:/app/public/uploads \
  -v database_data:/app/data \
  -e DATABASE_URL="file:/app/data/db.sqlite" \
  -e AUTH_URL="http://localhost:3000" \
  -e AUTH_SECRET="your-secret-here" \
  audio-marker
```

## Database Migrations

Database migrations are automatically executed when the container starts. The startup script (`docker-entrypoint.sh`) handles:

1. Creating necessary directories
2. Running Prisma migrations (`prisma migrate deploy`)
3. Generating Prisma client
4. Starting the application

## Data Persistence

### Audio Files
All uploaded audio files are stored in the `audio_uploads` volume, which maps to `/app/public/uploads` inside the container.

### Database
The SQLite database is stored in the `database_data` volume, which maps to `/app/data` inside the container.

### Backup and Restore

To backup your data:
```bash
# Backup audio files
docker run --rm -v audio_uploads:/data -v $(pwd):/backup alpine tar czf /backup/audio_backup.tar.gz -C /data .

# Backup database
docker run --rm -v database_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz -C /data .
```

To restore your data:
```bash
# Restore audio files
docker run --rm -v audio_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/audio_backup.tar.gz -C /data

# Restore database
docker run --rm -v database_data:/data -v $(pwd):/backup alpine tar xzf /backup/db_backup.tar.gz -C /data
```

## Troubleshooting

### Container won't start
1. Check the logs: `docker-compose logs`
2. Ensure all required environment variables are set
3. Verify that ports are not already in use

### Database issues
1. Check if migrations ran successfully in the logs
2. Ensure the database volume has proper permissions
3. Try recreating the database volume (WARNING: This will delete all data)

### Audio upload issues
1. Verify the uploads volume is properly mounted
2. Check container logs for permission errors
3. Ensure the uploads directory has write permissions

## Development

For development with Docker:

```bash
# Use the development docker-compose file (if you create one)
docker-compose -f docker-compose.dev.yml up

# Or run in development mode
docker run -it --rm \
  -v $(pwd):/app \
  -v /app/node_modules \
  -p 3000:3000 \
  -e NODE_ENV=development \
  audio-marker npm run dev
```

## Security Considerations

1. **Change default secrets**: Always use strong, unique values for `AUTH_SECRET`
2. **Use HTTPS in production**: Update `AUTH_URL` to use HTTPS
3. **Secure your Authentik instance**: Ensure your OAuth provider is properly configured
4. **Regular backups**: Implement regular backup procedures for your data
5. **Update regularly**: Keep the Docker image updated with security patches

## Production Deployment

For production deployment:

1. Use a reverse proxy (nginx, Traefik, etc.)
2. Enable HTTPS/TLS
3. Set up proper logging and monitoring
4. Configure automated backups
5. Use Docker secrets for sensitive environment variables
6. Consider using a managed database instead of SQLite for better performance and reliability