import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

/* GET SPORTS */

router.get("/", async (req, res) => {
  try {
    const sports = await prisma.sport.findMany({
      include: {
        gears: true,
        resourceUnits: {
          orderBy: { id: "asc" },
        },
        slots: true,
        bookings: true,
        notices: true,
      },
    });

    const formatted = sports.map((sport) => ({
      ...sport,
      resources: sport.resourceUnits || [],
      totalBookings: sport.bookings ? sport.bookings.length : 0,
      totalStudents: sport.bookings
        ? new Set(sport.bookings.map((b: any) => b.userId)).size
        : 0,
    }));

    res.json(formatted);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch sports",
    });
  }
});

/* CREATE SPORT */

router.post("/", async (req, res) => {
  try {
    const {
      name,
      hasDynamicBooking,
      slotDurationMinutes,
      slotCapacity,
      resourceType,
      quantity,
      totalCourts,
      resources,
      availableCourts,
    } = req.body;

    const sport = await prisma.sport.create({
      data: {
        name,
        resourceType: resourceType || "Court",
        hasDynamicBooking: hasDynamicBooking ?? false,
        slotDurationMinutes: slotDurationMinutes ?? 30,
        totalCourts: totalCourts ?? 1,
        availableCourts: availableCourts ?? quantity ?? totalCourts ?? 1,
      },
    });

    if (resources?.length) {
      // Create Resource Units for this sport
      await prisma.resourceUnit.createMany({
        data: resources.map((r: any) => ({
          sportId: sport.id,
          name: r.name,
          type: resourceType || "Court",
          status: r.status || "available",
        })),
      });
    }

    const full = await prisma.sport.findUnique({
      where: { id: sport.id },
      include: { resourceUnits: true, gears: true, slots: true, bookings: true, notices: true },
    });

    res.json({
      ...full,
      resources: full?.resourceUnits ?? [],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to create sport",
    });
  }
});

export default router;