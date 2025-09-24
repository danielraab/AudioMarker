-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Audio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "readonlyToken" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Audio_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Audio" ("createdAt", "createdById", "deletedAt", "filePath", "id", "name", "originalFileName", "readonlyToken", "updatedAt") SELECT "createdAt", "createdById", "deletedAt", "filePath", "id", "name", "originalFileName", "readonlyToken", "updatedAt" FROM "Audio";
DROP TABLE "Audio";
ALTER TABLE "new_Audio" RENAME TO "Audio";
CREATE UNIQUE INDEX "Audio_readonlyToken_key" ON "Audio"("readonlyToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
