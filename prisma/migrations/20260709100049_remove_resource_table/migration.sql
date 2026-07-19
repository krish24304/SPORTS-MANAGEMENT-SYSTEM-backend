/*
  Warnings:

  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `ResourceUnit` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Resource";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResourceUnit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sportId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "maintenanceMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResourceUnit_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ResourceUnit" ("createdAt", "id", "name", "sportId", "status", "type") SELECT "createdAt", "id", "name", "sportId", "status", "type" FROM "ResourceUnit";
DROP TABLE "ResourceUnit";
ALTER TABLE "new_ResourceUnit" RENAME TO "ResourceUnit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
