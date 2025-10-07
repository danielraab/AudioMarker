# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Listen statistics for audios and playlists**
  - Listen counter and last listened date are now tracked for each audio and playlist
  - Display listen count and last listened date in audio and playlist lists
  - Listen count increments only once per 2 hours per browser/tab
  - API and database support for listen statistics
  - UI updates to show listen stats
- **Spacebar keyboard shortcut for audio player**
  - Press spacebar to toggle play/pause in the audio player
  - Smart filtering prevents interference with text input fields
  - Prevents page scrolling when spacebar is pressed in audio player context

## [0.2.3] - 2025-10-06

### Added

- **User management**: Admin functionality for managing users
  - View and manage all registered users
  - Enable/disable user accounts
  - Grant/revoke admin privileges
  - User list with status indicators
  - Settings page with user management section
- **Footer component**: Added site-wide footer to all pages
  - Displays author name "draab" with copyright year
  - Shows current git commit hash for version tracking
  - Includes cookie information notice
  - Responsive design with dark mode support
  - Automatic git hash injection at build time via Next.js config
  - Docker build support via GIT_VERSION_LABEL build argument
  - GitHub Actions workflows updated to pass git hash during builds

## [0.2.2] - 2025-10-02

### Changed

- double click on speed icon or text resets the playback rate to 1 (on audio player)

### Fixed

- overview does not overflow on mobile anymore


## [0.2.1] - 2025-10-02

### Added
- **PWA functionality**: install Audio Marker as Progressive Web App
  - cache audio and static files
- add speed slider for audio player


## [0.2.0] - 2025-10-02

### Added
- **Playlist functionality**: Complete playlist system implementation
  - Create, edit, and manage playlists
  - Add/remove audio files to/from playlists
  - Playlist-specific UI components and forms
  - Database schema for playlist relationships
- **Email magic link authentication**: Alternative authentication method using Nodemailer
  - SMTP configuration support
  - Magic link email delivery
  - Optional authentication providers based on environment variables

### Changed
- Reorganized environment variables in `.env.example` with logical grouping
- Updated authentication configuration to support multiple providers conditionally
- Enhanced audio management with playlist integration

### Fixed
- GitHub Actions workflow for tag-based builds
- Documentation improvements for nginx upload configuration
- Added troubleshooting hints for nginx-related issues

### Security


## [0.1.1] - 2025-09-25

### Fixed

- Try to fix github action


## [0.1.0] - 2025-09-25

### Added
- Initial release of the audio marker application
- Audio upload and editing features
- Core audio playback functionality
- Marker creation and management
- User authentication (Authentik & magic link)
- Database schema and migrations
- Docker containerization
- API endpoints for audio and marker operations