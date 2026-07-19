-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL DEFAULT 'Court',
    "hasSlotSystem" BOOLEAN NOT NULL DEFAULT false,
    "slotDurationMinutes" INTEGER NOT NULL DEFAULT 30,
    "totalCourts" INTEGER NOT NULL DEFAULT 1,
    "availableCourts" INTEGER NOT NULL DEFAULT 1,
    "maintenance" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasDynamicBooking" BOOLEAN NOT NULL DEFAULT true,
    "slotCapacity" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Sport" ("availableCourts", "createdAt", "hasDynamicBooking", "hasSlotSystem", "id", "maintenance", "maintenanceMessage", "name", "slotCapacity", "slotDurationMinutes", "totalCourts") SELECT "availableCourts", "createdAt", "hasDynamicBooking", "hasSlotSystem", "id", "maintenance", "maintenanceMessage", "name", "slotCapacity", "slotDurationMinutes", "totalCourts" FROM "Sport";
DROP TABLE "Sport";
ALTER TABLE "new_Sport" RENAME TO "Sport";
CREATE UNIQUE INDEX "Sport_name_key" ON "Sport"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
