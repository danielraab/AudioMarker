# Docker CI/CD with GitHub Actions

This project includes GitHub Actions workflows to automatically build and push Docker images to container registries when code is pushed to the repository.

## Available Workflows

### 1. GitHub Container Registry (GHCR) - `docker-build-push.yml`

This workflow pushes images to GitHub Container Registry (`ghcr.io`) and is the recommended approach as it requires minimal setup.

**Triggers:**
- Push to `main` or `develop` branches
- Push of version tags (e.g., `v1.0.0`)
- Pull requests to `main` (build only, no push)

**Features:**
- Multi-platform builds (AMD64 and ARM64)
- Automatic tagging based on branch/tag
- Build caching for faster builds
- Artifact attestation for security
- No additional secrets required (uses `GITHUB_TOKEN`)

### 2. Docker Hub - `docker-hub-push.yml`

This workflow pushes images to Docker Hub and requires additional setup.

**Triggers:**
- Push to `main` branch
- Push of version tags (e.g., `v1.0.0`)
- Manual workflow dispatch

**Features:**
- Multi-platform builds (AMD64 and ARM64)
- Automatic Docker Hub description updates
- Build caching for faster builds

## Setup Instructions

### For GitHub Container Registry (Recommended)

1. **Enable GitHub Packages** (if not already enabled):
   - Go to your repository settings
   - Navigate to "Actions" → "General"
   - Ensure "Read and write permissions" are enabled for `GITHUB_TOKEN`

2. **The workflow will automatically**:
   - Build images on pushes to `main`/`develop`
   - Tag images appropriately
   - Push to `ghcr.io/your-username/your-repo`

### For Docker Hub

1. **Create Docker Hub Access Token**:
   - Log in to [Docker Hub](https://hub.docker.com/)
   - Go to Account Settings → Security → New Access Token
   - Create a token with "Read, Write, Delete" permissions
   - Copy the token (you won't see it again)

2. **Add GitHub Secrets**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `DOCKERHUB_USERNAME`: Your Docker Hub username
     - `DOCKERHUB_TOKEN`: The access token you created

3. **Create Docker Hub Repository**:
   - Create a repository on Docker Hub with the name `audio-marker`
   - Or modify the `IMAGE_NAME` in the workflow file

## Image Tags

Both workflows create the following tags:

- `latest` - Latest build from the main branch
- `main` - Latest build from the main branch
- `develop` - Latest build from the develop branch
- `v1.0.0` - Specific version tags
- `v1.0` - Major.minor version
- `v1` - Major version only
- `main-abc1234` - Branch name with commit SHA

## Usage Examples

### Pull from GitHub Container Registry

```bash
# Pull latest version
docker pull ghcr.io/your-username/your-repo:latest

# Pull specific version
docker pull ghcr.io/your-username/your-repo:v1.0.0

# Run the container
docker run -p 3000:3000 ghcr.io/your-username/your-repo:latest
```

### Pull from Docker Hub

```bash
# Pull latest version
docker pull your-dockerhub-username/audio-marker:latest

# Pull specific version
docker pull your-dockerhub-username/audio-marker:v1.0.0

# Run the container
docker run -p 3000:3000 your-dockerhub-username/audio-marker:latest
```

## Environment Variables

When running the Docker container, you'll need to set the following environment variables:

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="file:/app/data/db.sqlite" \
  -e AUTH_URL="http://localhost:3000" \
  -e AUTH_SECRET="your-auth-secret-here" \
  -e AUTH_AUTHENTIK_ID="your-authentik-id" \
  -e AUTH_AUTHENTIK_SECRET="your-authentik-secret" \
  -e AUTH_AUTHENTIK_ISSUER="your-authentik-issuer" \
  -v audio_uploads:/app/public/uploads \
  -v database_data:/app/data \
  ghcr.io/your-username/your-repo:latest
```

## Workflow Customization

### Changing Build Triggers

Edit the `on:` section in the workflow files:

```yaml
on:
  push:
    branches:
      - main
      - staging  # Add more branches
    tags:
      - 'v*'
  schedule:
    - cron: '0 2 * * 0'  # Weekly builds
```

### Adding Build Arguments

Add build arguments to the Docker build step:

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    build-args: |
      NODE_ENV=production
      BUILD_VERSION=${{ github.sha }}
    # ... other options
```

### Changing Image Names

For GHCR, the image name is automatically derived from the repository name. For Docker Hub, modify the `IMAGE_NAME` environment variable:

```yaml
env:
  IMAGE_NAME: my-custom-name
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure `GITHUB_TOKEN` has write permissions to packages
2. **Docker Hub Login Failed**: Verify `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets
3. **Build Failures**: Check the Actions tab for detailed error logs
4. **Multi-platform Build Issues**: Some dependencies might not support ARM64

### Debugging

Enable debug logging by adding this secret to your repository:
- `ACTIONS_STEP_DEBUG`: `true`

## Security Considerations

- The workflows use official GitHub Actions with pinned versions
- Build attestations are generated for supply chain security
- Secrets are properly masked in logs
- Multi-platform builds ensure compatibility across architectures

## Monitoring

Monitor your workflows:
- Check the "Actions" tab in your GitHub repository
- Set up notifications for failed builds
- Monitor image sizes and build times
- Review security advisories for base images