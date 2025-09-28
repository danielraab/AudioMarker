# Audio Marker

An audio annotation and marker application built with the [T3 Stack](https://create.t3.gg/).

## Features

- Upload and manage audio files
- Add time-based markers to audio tracks
- Share audio files with public/private visibility
- User authentication with NextAuth.js
- Responsive web interface

## Docker Deployment

This project includes Docker support and automated CI/CD pipelines. All Docker-related files are located in the [`docker/`](docker/) directory.

### Quick Start with Docker

```bash
# Using docker-compose (recommended)
docker-compose -f docker/docker-compose.yml up -d

# Or build and run manually
docker build -f docker/Dockerfile -t audio-marker .
docker run -p 3000:3000 audio-marker
```

### Automated Docker Builds

The project includes GitHub Actions workflows that automatically build and push Docker images:

- **GitHub Container Registry**: Automatically builds on push to main/develop branches
- **Docker Hub**: Optional workflow for Docker Hub deployment

For detailed setup instructions, see [Docker Documentation](./docker/README.Docker.md).

### Known issues

#### File upload problem with nginx

add nginx conf to solve this issue:

```conf
client_max_body_size 50M;
proxy_request_buffering off;
proxy_buffering off;
```

## Development

```bash
# Install dependencies
npm install

# Set up the database
npm run db:push

# Start development server
npm run dev
```
