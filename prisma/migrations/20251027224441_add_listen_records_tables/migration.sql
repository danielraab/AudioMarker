-- CreateTable
CREATE TABLE "AudioListenRecord" (
    "audioId" TEXT NOT NULL,
    "listenedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("audioId", "listenedAt"),
    CONSTRAINT "AudioListenRecord_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "Audio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlaylistListenRecord" (
    "playlistId" TEXT NOT NULL,
    "listenedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("playlistId", "listenedAt"),
    CONSTRAINT "PlaylistListenRecord_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
