/*
  Warnings:

  - You are about to drop the column `resourceUnitId` on the `TeamReservation` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TeamReservationResource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reservationId" INTEGER NOT NULL,
    "resourceUnitId" INTEGER NOT NULL,
    CONSTRAINT "TeamReservationResource_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "TeamReservation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamReservationResource_resourceUnitId_fkey" FOREIGN KEY ("resourceUnitId") REFERENCES "ResourceUnit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    CONSTRAINT "TeamReservation_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamReservation_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TeamReservation" ("bookedById", "createdAt", "endTime", "id", "purpose", "reservationMessage", "sportId", "startTime", "teamName") SELECT "bookedById", "createdAt", "endTime", "id", "purpose", "reservationMessage", "sportId", "startTime", "teamName" FROM "TeamReservation";
DROP TABLE "TeamReservation";
ALTER TABLE "new_TeamReservation" RENAME TO "TeamReservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TeamReservationResource_reservationId_resourceUnitId_key" ON "TeamReservationResource"("reservationId", "resourceUnitId");
