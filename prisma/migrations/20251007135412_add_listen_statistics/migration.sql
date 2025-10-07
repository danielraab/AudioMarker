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
    "listenCounter" INTEGER NOT NULL DEFAULT 0,
    "lastListenAt" DATETIME,
    CONSTRAINT "Audio_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Audio" ("createdAt", "createdById", "deletedAt", "filePath", "id", "isPublic", "name", "originalFileName", "updatedAt") SELECT "createdAt", "createdById", "deletedAt", "filePath", "id", "isPublic", "name", "originalFileName", "updatedAt" FROM "Audio";
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
    "listenCounter" INTEGER NOT NULL DEFAULT 0,
    "lastListenAt" DATETIME,
    CONSTRAINT "Playlist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Playlist" ("createdAt", "createdById", "deletedAt", "id", "isPublic", "name", "updatedAt") SELECT "createdAt", "createdById", "deletedAt", "id", "isPublic", "name", "updatedAt" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
