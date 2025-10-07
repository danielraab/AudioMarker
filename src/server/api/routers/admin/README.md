# Admin Router Structure

This directory contains the admin router split into multiple focused modules for better maintainability and organization.

## Files Overview

### `index.ts`
Main entry point that combines all admin sub-routers and exposes them as a unified `adminRouter`.

### `utils.ts`
Shared utility functions for admin operations:
- `requireAdmin()` - Validates admin permissions for general operations
- `requireAdminForUserManagement()` - Validates admin permissions for user management operations

### `userManagement.ts`
Handles all user-related admin operations:
- `getAllUsers` - Fetch all users with statistics
- `createUser` - Create new users
- `updateUser` - Update existing users (with validation for self-modification)
- `deleteUser` - Delete users (with protection against self-deletion)

### `systemSettings.ts`
Manages system-wide settings and configuration:
- `getRegistrationStatus` - Get current registration enabled/disabled status

### `softDeletedContent.ts`
Manages soft-deleted content recovery and permanent deletion:
- `getSoftDeletedAudios` - List soft-deleted audio files
- `getSoftDeletedPlaylists` - List soft-deleted playlists
- `recoverAudio` - Restore soft-deleted audio
- `recoverPlaylist` - Restore soft-deleted playlist
- `permanentlyDeleteAudio` - Permanently delete audio
- `permanentlyDeletePlaylist` - Permanently delete playlist

## Benefits of This Structure

1. **Separation of Concerns**: Each file handles a specific domain of admin functionality
2. **Maintainability**: Easier to locate and modify specific admin features
3. **Reusability**: Shared utilities can be used across different admin modules
4. **Scalability**: New admin features can be easily added as new modules
5. **Testing**: Each module can be tested independently

## Usage

The admin router maintains the same external API, so existing client code doesn't need to change:

```typescript
// Still works the same way
trpc.admin.getAllUsers.useQuery()
trpc.admin.createUser.useMutation()
// etc.
```