import { db } from "../src/server/db";

/**
 * Migration script to update database records:
 * - Changes filePath from full paths (/uploads/filename.mp3) to just filenames (filename.mp3)
 * 
 * Note: This does NOT move files. Files remain in their current location.
 * Docker volumes should be remounted to point to the correct location.
 */

async function migrateAudioStorage() {
  console.log("Starting audio storage database migration...");

  // Get all audio records from database
  const audios = await db.audio.findMany({
    select: {
      id: true,
      filePath: true,
    },
  });

  console.log(`Found ${audios.length} audio records to migrate`);

  let successCount = 0;
  let skippedCount = 0;

  for (const audio of audios) {
    try {
      // Extract filename from current path
      // Handle both "/uploads/filename.mp3" and "filename.mp3" formats
      const filename = audio.filePath.replace(/^\/uploads\//, "");

      // Check if already migrated (filename only, no path)
      if (!audio.filePath.includes("/") && !audio.filePath.startsWith("/")) {
        console.log(`⊘ Skipping ${audio.id} - already migrated`);
        skippedCount++;
        continue;
      }

      // Update database to store only filename
      await db.audio.update({
        where: { id: audio.id },
        data: { filePath: filename },
      });

      console.log(`✓ Updated: ${audio.id} -> ${filename}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Error migrating ${audio.id}:`, error);
    }
  }

  console.log("\n=== Migration Summary ===");
  console.log(`Total records: ${audios.length}`);
  console.log(`✓ Successfully migrated: ${successCount}`);
  console.log(`⊘ Already migrated (skipped): ${skippedCount}`);
  console.log("\n=== Next Steps ===");
  console.log("1. Verify audio playback works");
  console.log("2. Files remain in their current location - Docker volume handles the mounting");
}

// Run the migration
migrateAudioStorage()
  .then(() => {
    console.log("\nMigration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nMigration failed:", error);
    process.exit(1);
  });
