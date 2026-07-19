/*
  Warnings:

  - You are about to drop the column `reservedCourts` on the `TeamReservation` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Resource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sportId" INTEGER NOT NULL,
    "totalAvailable" INTEGER NOT NULL,
    "currentlyAvailable" INTEGER NOT NULL,
    CONSTRAINT "Resource_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TeamReservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamName" TEXT NOT NULL,
    "sportId" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "reservationMessage" TEXT,
    "bookedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resourceUnitId" INTEGER NOT NULL,
    CONSTRAINT "TeamReservation_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamReservation_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TeamReservation_resourceUnitId_fkey" FOREIGN KEY ("resourceUnitId") REFERENCES "ResourceUnit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TeamReservation" ("bookedById", "createdAt", "endTime", "id", "reservationMessage", "resourceUnitId", "sportId", "startTime", "teamName") SELECT "bookedById", "createdAt", "endTime", "id", "reservationMessage", "resourceUnitId", "sportId", "startTime", "teamName" FROM "TeamReservation";
DROP TABLE "TeamReservation";
ALTER TABLE "new_TeamReservation" RENAME TO "TeamReservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
