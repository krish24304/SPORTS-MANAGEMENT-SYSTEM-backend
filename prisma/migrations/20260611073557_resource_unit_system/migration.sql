/*
  Warnings:

  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `resourceUnitId` to the `TeamReservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Resource";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ResourceUnit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sportId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResourceUnit_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "sportId" INTEGER NOT NULL,
    "slotId" INTEGER,
    "bookingType" TEXT NOT NULL DEFAULT 'slot',
    "gearsBooked" JSONB,
    "resourcesBooked" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "bookedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "cancelledAt" DATETIME,
    "returnRequestedAt" DATETIME,
    "returnedAt" DATETIME,
    "returnedById" INTEGER,
    "notes" TEXT,
    "resourceUnitId" INTEGER,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_resourceUnitId_fkey" FOREIGN KEY ("resourceUnitId") REFERENCES "ResourceUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("active", "bookedAt", "bookingType", "cancelledAt", "endTime", "gearsBooked", "id", "notes", "resourcesBooked", "returnRequestedAt", "returnedAt", "returnedById", "slotId", "sportId", "startTime", "status", "userId") SELECT "active", "bookedAt", "bookingType", "cancelledAt", "endTime", "gearsBooked", "id", "notes", "resourcesBooked", "returnRequestedAt", "returnedAt", "returnedById", "slotId", "sportId", "startTime", "status", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_TeamReservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamName" TEXT NOT NULL,
    "sportId" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "reservedCourts" INTEGER NOT NULL DEFAULT 1,
    "reservationMessage" TEXT,
    "bookedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resourceUnitId" INTEGER NOT NULL,
    CONSTRAINT "TeamReservation_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamReservation_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TeamReservation_resourceUnitId_fkey" FOREIGN KEY ("resourceUnitId") REFERENCES "ResourceUnit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TeamReservation" ("bookedById", "createdAt", "endTime", "id", "reservationMessage", "reservedCourts", "sportId", "startTime", "teamName") SELECT "bookedById", "createdAt", "endTime", "id", "reservationMessage", "reservedCourts", "sportId", "startTime", "teamName" FROM "TeamReservation";
DROP TABLE "TeamReservation";
ALTER TABLE "new_TeamReservation" RENAME TO "TeamReservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
