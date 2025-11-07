-- Step 1: Create listen records for each audio based on their listenCounter
-- We'll create records distributed over the past, with the most recent one at lastListenAt if it exists
INSERT INTO AudioListenRecord (id, audioId, listenedAt)
SELECT 
    lower(hex(randomblob(16))) as id,
    id as audioId,
    COALESCE(datetime(lastListenAt), CURRENT_TIMESTAMP, '2024-01-01 00:00:00') as listenedAt
FROM Audio
WHERE listenCounter > 0 AND deletedAt IS NULL;

-- For audios with listenCounter > 1, create additional historical records
-- These will be spread out over the past (rough approximation)
INSERT INTO AudioListenRecord (id, audioId, listenedAt)
WITH RECURSIVE counter(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM counter WHERE n < (SELECT MAX(listenCounter) FROM Audio)
)
SELECT 
    lower(hex(randomblob(16))) as id,
    a.id as audioId,
    COALESCE(
        datetime(
            COALESCE(a.lastListenAt, CURRENT_TIMESTAMP, '2024-01-01 00:00:00'),
            '-' || (c.n * 3) || ' hours'
        ),
        datetime('now', '-' || (c.n * 3) || ' hours'),
        '2024-01-01 00:00:00'
    ) as listenedAt
FROM Audio a
CROSS JOIN counter c
WHERE c.n <= a.listenCounter - 1
    AND a.listenCounter > 1
    AND a.deletedAt IS NULL;

-- Step 2: Create listen records for each playlist based on their listenCounter
INSERT INTO PlaylistListenRecord (id, playlistId, listenedAt)
SELECT 
    lower(hex(randomblob(16))) as id,
    id as playlistId,
    COALESCE(datetime(lastListenAt), CURRENT_TIMESTAMP, '2024-01-01 00:00:00') as listenedAt
FROM Playlist
WHERE listenCounter > 0 AND deletedAt IS NULL;

-- For playlists with listenCounter > 1, create additional historical records
INSERT INTO PlaylistListenRecord (id, playlistId, listenedAt)
WITH RECURSIVE counter(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM counter WHERE n < (SELECT MAX(listenCounter) FROM Playlist)
)
SELECT 
    lower(hex(randomblob(16))) as id,
    p.id as playlistId,
    COALESCE(
        datetime(
            COALESCE(p.lastListenAt, CURRENT_TIMESTAMP, '2024-01-01 00:00:00'),
            '-' || (c.n * 3) || ' hours'
        ),
        datetime('now', '-' || (c.n * 3) || ' hours'),
        '2024-01-01 00:00:00'
    ) as listenedAt
FROM Playlist p
CROSS JOIN counter c
WHERE c.n <= p.listenCounter - 1
    AND p.listenCounter > 1
    AND p.deletedAt IS NULL;

-- Step 3: Remove listenCounter and lastListenAt columns from Audio and Playlist tables
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Audio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Audio_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Audio" ("createdAt", "createdById", "deletedAt", "filePath", "id", "isPublic", "name", "originalFileName", "updatedAt")
SELECT "createdAt", "createdById", "deletedAt", "filePath", "id", "isPublic", "name", "originalFileName", "updatedAt" FROM "Audio";

DROP TABLE "Audio";
ALTER TABLE "new_Audio" RENAME TO "Audio";

CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Playlist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Playlist" ("createdAt", "createdById", "deletedAt", "id", "isPublic", "name", "updatedAt")
SELECT "createdAt", "createdById", "deletedAt", "id", "isPublic", "name", "updatedAt" FROM "Playlist";

DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
