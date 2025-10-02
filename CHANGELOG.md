# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-10-02

### Added
- **PWA functionality**: install Audio Marker as Progressive Web App
  - cache audio and static files

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