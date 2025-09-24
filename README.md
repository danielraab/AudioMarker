# Audio Marker

An audio annotation and marker application built with the [T3 Stack](https://create.t3.gg/).

## Features

- Upload and manage audio files
- Add time-based markers to audio tracks
- Share audio files with public/private visibility
- User authentication with NextAuth.js
- Responsive web interface

## Docker Deployment

This project includes Docker support and automated CI/CD pipelines.

### Quick Start with Docker

```bash
# Using docker-compose (recommended)
docker-compose up -d

# Or build and run manually
docker build -t audio-marker .
docker run -p 3000:3000 audio-marker
```

### Automated Docker Builds

The project includes GitHub Actions workflows that automatically build and push Docker images:

- **GitHub Container Registry**: Automatically builds on push to main/develop branches
- **Docker Hub**: Optional workflow for Docker Hub deployment

For detailed setup instructions, see [Docker CI/CD Documentation](./docs/docker-ci-cd.md).

## Development

```bash
# Install dependencies
npm install

# Set up the database
npm run db:push

# Start development server
npm run dev
```

## Deployment Options

- **Docker**: See [Docker CI/CD Documentation](./docs/docker-ci-cd.md)
- **Vercel**: Follow the [T3 Vercel deployment guide](https://create.t3.gg/en/deployment/vercel)
- **Other platforms**: Follow the [T3 deployment guides](https://create.t3.gg/en/deployment/docker)
