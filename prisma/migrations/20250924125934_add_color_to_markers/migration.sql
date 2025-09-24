-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Marker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "timestamp" REAL NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "audioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Marker_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "Audio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Marker" ("audioId", "createdAt", "id", "label", "timestamp", "updatedAt") SELECT "audioId", "createdAt", "id", "label", "timestamp", "updatedAt" FROM "Marker";
DROP TABLE "Marker";
ALTER TABLE "new_Marker" RENAME TO "Marker";
CREATE UNIQUE INDEX "Marker_audioId_timestamp_key" ON "Marker"("audioId", "timestamp");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
