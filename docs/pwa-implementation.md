# PWA Implementation Guide

## Overview

This application has been configured as a Progressive Web App (PWA) with advanced audio file caching capabilities. The PWA allows users to install the app on their devices and access audio files offline.

## Features

### 1. **Installable App**
- Users can install the app on their devices (desktop and mobile)
- Appears as a standalone application
- Custom app icon and splash screen

### 2. **Audio File Caching**
- Automatic caching of audio files when accessed
- Cache-first strategy for audio files (instant playback from cache)
- Network fallback if audio not in cache
- Supports multiple audio formats: MP3, WAV, OGG, M4A, AAC, FLAC, WEBM

### 3. **Offline Support**
- Static assets cached on installation
- API responses cached for offline access
- Graceful degradation when offline

### 4. **Automatic Updates**
- Service worker checks for updates every minute
- User notification when new version is available
- Seamless update process

## Files Created/Modified

### 1. `/public/manifest.json`
The PWA manifest file that defines:
- App name and description
- Display mode (standalone)
- Theme colors
- App icons
- Start URL

### 2. `/public/sw.js` (excluded from type checking)
The service worker JavaScript file that handles:
- Audio file caching (cache-first strategy)
- Static asset caching
- API response caching (network-first with fallback)
- Cache management and cleanup
- Update notifications

**Note:** This file is excluded from TypeScript checking and ESLint via `.eslintignore` and `tsconfig.json` because service workers run in a different context with different global APIs.

### 3. `/src/app/_components/ServiceWorkerRegistration.tsx`
React component that:
- Registers the service worker
- Handles service worker updates
- Manages update notifications
- Works in both development and production modes
- Includes detailed console logging for debugging

### 4. Updated `/src/app/layout.tsx`
Added:
- PWA manifest link
- Apple Web App meta tags
- Open Graph tags
- Twitter card tags
- Viewport configuration
- Service worker registration component

### 5. Updated `/next.config.js`
Added headers for:
- Service worker proper caching
- Manifest content type
- Service worker scope

### 6. `/src/app/sw.js/route.ts`
Next.js API route that serves the service worker with proper headers, ensuring it's accessible in all environments.

### 7. `.eslintignore`
Excludes the service worker from ESLint checking.

### 8. Updated `tsconfig.json`
Excludes `public/sw.js` from TypeScript compilation.

## Caching Strategies

### Audio Files (Cache First)
1. Check cache for audio file
2. If found, serve from cache immediately
3. If not found, fetch from network
4. Cache the fetched audio for future use

### Static Assets (Cache First)
1. Check cache for asset
2. If found, serve from cache
3. If not found, fetch and cache

### API Requests (Network First)
1. Try to fetch from network
2. Cache successful responses
3. If network fails, serve from cache

### Dynamic Content (Network First)
1. Fetch from network
2. Cache successful responses
3. Fallback to cache if offline

## Testing the PWA

### Development Mode
The service worker now registers in both development and production modes. You should see console logs when it registers:

```bash
npm run dev
```

Look for these logs in the browser console:
- `[PWA] Attempting to register service worker...`
- `[PWA] Registering service worker from /sw.js`
- `[PWA] Service Worker registered successfully!`
- `[Service Worker] Installing...`
- `[Service Worker] Caching static assets`
- `[Service Worker] Activating...`

### Production Mode
```bash
npm run build
npm start
```

### Installation
1. Open the app in a supported browser (Chrome, Edge, Safari)
2. Look for the install prompt in the address bar
3. Click "Install" to add the app to your device

### Testing Offline
1. Open the app and navigate to some audio files
2. Open DevTools > Application > Service Workers
3. Check "Offline" mode
4. Refresh the page - cached content should still work
5. Play previously accessed audio files - they should play from cache

### Checking Cache
1. Open DevTools > Application > Cache Storage
2. You should see three caches:
   - `audio-marker-static-v1` - Static assets
   - `audio-marker-audio-v1` - Audio files
   - `audio-marker-v1` - Dynamic content

### Debugging
If the service worker doesn't register:
1. Check the browser console for error messages
2. Verify the service worker is accessible at `/sw.js`
3. Check DevTools > Application > Service Workers for registration status
4. Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
5. Clear browser cache and try again

## Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Samsung Internet
- ✅ Opera

## Clearing Cache

Users can clear the cache by:
1. Opening browser settings
2. Clearing site data for the app
3. Or uninstalling and reinstalling the PWA

Developers can clear cache programmatically by sending a message to the service worker:

```javascript
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
}
```

## Performance Benefits

1. **Faster Load Times**: Cached assets load instantly
2. **Reduced Bandwidth**: Audio files only downloaded once
3. **Offline Access**: Previously accessed content available offline
4. **Better UX**: Instant playback of cached audio files

## Maintenance

### Updating the Service Worker
When you make changes to the service worker:
1. Update the `CACHE_NAME` version in `sw.js`
2. Deploy the changes
3. Users will be prompted to update on next visit

### Cache Size Management
The browser automatically manages cache size, but you can:
- Monitor cache size in DevTools
- Implement custom cache size limits
- Add cache expiration logic if needed

## Security Considerations

- Service workers only work over HTTPS (or localhost)
- Service worker has access to all same-origin requests
- Cache is origin-specific and isolated
- Service worker updates are automatic and secure

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify `/sw.js` is accessible
- Check that you're on HTTPS or localhost
- Try clearing browser cache

### Audio Not Caching
- Check DevTools > Application > Cache Storage
- Verify audio file extensions are supported
- Check network tab to see if files are being fetched
- Look for service worker console logs

### Type Checking Errors
The service worker file (`public/sw.js`) is intentionally excluded from TypeScript checking because it runs in a Service Worker context with different global APIs. This is normal and expected.

## Future Enhancements

Potential improvements:
1. Background sync for offline actions
2. Push notifications for updates
3. Periodic background sync
4. Advanced cache strategies per route
5. Cache size limits and cleanup policies
6. Offline queue for failed requests
7. Pre-caching of critical audio files