/*
  Warnings:

  - Made the column `resourceUnitId` on table `TeamReservation` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TeamReservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamName" TEXT NOT NULL,
    "purpose" TEXT,
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
INSERT INTO "new_TeamReservation" ("bookedById", "createdAt", "endTime", "id", "purpose", "reservationMessage", "resourceUnitId", "sportId", "startTime", "teamName") SELECT "bookedById", "createdAt", "endTime", "id", "purpose", "reservationMessage", "resourceUnitId", "sportId", "startTime", "teamName" FROM "TeamReservation";
DROP TABLE "TeamReservation";
ALTER TABLE "new_TeamReservation" RENAME TO "TeamReservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
