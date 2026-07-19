/*
  Warnings:

  - You are about to drop the column `duration` on the `TeamReservation` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `TeamReservation` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `TeamReservation` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `TeamReservation` table. All the data in the column will be lost.
  - Added the required column `durationMinutes` to the `TeamReservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDateTime` to the `TeamReservation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TeamReservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamName" TEXT NOT NULL,
    "purpose" TEXT,
    "sportId" INTEGER NOT NULL,
    "startDateTime" DATETIME NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "reservationMessage" TEXT,
    "bookedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamReservation_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamReservation_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TeamReservation" ("bookedById", "createdAt", "id", "purpose", "reservationMessage", "sportId", "teamName") SELECT "bookedById", "createdAt", "id", "purpose", "reservationMessage", "sportId", "teamName" FROM "TeamReservation";
DROP TABLE "TeamReservation";
ALTER TABLE "new_TeamReservation" RENAME TO "TeamReservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
