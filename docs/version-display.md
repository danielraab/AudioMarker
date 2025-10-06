# Version Display Implementation

This document describes how the application displays version information in the footer using git tags or commit hashes.

## Overview

The footer displays version information with the following priority:
1. **Git Tag** (if on a tagged commit) - e.g., `v0.2.3`
2. **Git Describe** (tag + commits + hash) - e.g., `v0.2.3-5-g1abc234`
3. **Commit Hash** (short) - e.g., `1abc234`
4. **Fallback** - `dev` (if git is unavailable)

## Implementation Details

### 1. Build-Time Version Detection (`next.config.js`)

The [`getGitVersion()`](../next.config.js:8-44) function determines the version at build time:

```javascript
const getGitVersion = () => {
  // Priority: environment variable > git tag > git describe > commit hash > fallback
  
  if (process.env.NEXT_PUBLIC_GIT_HASH) {
    return process.env.NEXT_PUBLIC_GIT_HASH;
  }
  
  try {
    // Try exact tag match first
    const tag = execSync('git describe --exact-match --tags HEAD').toString().trim();
    if (tag) return tag;
  } catch {
    // Try git describe with tags
    const describe = execSync('git describe --tags --always --dirty').toString().trim();
    if (describe) return describe;
  }
  
  // Fallback to commit hash
  return execSync('git rev-parse --short HEAD').toString().trim();
};
```

### 2. Docker Build Integration

The [`.github/workflows/docker-hub-push.yml`](../.github/workflows/docker-hub-push.yml:44-56) workflow passes version information to Docker builds:

- **For tag pushes**: Uses the tag name (e.g., `v0.2.3`)
- **For branch pushes**: Uses `git describe` output or short SHA

The version is passed as a build argument:
```yaml
build-args: |
  GIT_VERSION_LABEL=${{ steps.version.outputs.version }}
```

### 3. Footer Display (`Footer.tsx`)

The [`Footer`](../src/app/_components/Footer.tsx:3-21) component displays the version:

```typescript
const displayVersion = process.env.NEXT_PUBLIC_GIT_VERSION_LABEL ?? "dev";
```

Features:
- Automatically prefixes with `v` if not present
- Shows full version string on hover (via `title` attribute)
- Displays in monospace font for better readability

## Version Format Examples

| Scenario | Display | Description |
|----------|---------|-------------|
| Tagged release | `v0.2.3` | Exact tag match |
| Post-release commits | `v0.2.3-5-g1abc234` | 5 commits after v0.2.3 |
| Uncommitted changes | `v0.2.3-dirty` | Working directory has changes |
| No tags | `v1abc234` | Short commit hash |
| Development | `vdev` | Fallback when git unavailable |

## Testing

To test version detection locally:

```bash
# Check current version
git describe --tags --always --dirty

# Simulate exact tag
git tag v0.2.4
git describe --exact-match --tags HEAD

# Build and check
npm run build
```

## Docker Build

The Dockerfile receives the version via build arg:

```dockerfile
ARG GIT_VERSION_LABEL
ENV NEXT_PUBLIC_GIT_VERSION_LABEL=${GIT_VERSION_LABEL}
```

Build with custom version:
```bash
docker build --build-arg GIT_VERSION_LABEL=v0.2.3 -f docker/Dockerfile .
```

## Benefits

1. **Automatic versioning**: No manual version updates needed
2. **Traceability**: Easy to identify deployed version
3. **Git integration**: Leverages existing git workflow
4. **Docker support**: Works in containerized environments
5. **Fallback handling**: Graceful degradation when git unavailable