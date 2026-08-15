import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/* GET SPORTS */

router.get("/", async (req, res) => {
  try {
    const sports = await prisma.sport.findMany({
      include: {
        gears: true,
        resources: true,
        resourceUnits: true,
      },
    });

    res.json(sports);
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
    } = req.body;

    const sport = await prisma.sport.create({
      data: {
        name,
        resourceType,
        hasDynamicBooking,
        slotDurationMinutes,
        slotCapacity,
        totalCourts,
        
        availableCourts: quantity,
      },
    });

    if (resources?.length) {
      await prisma.resource.createMany({
        data: resources.map((resource: any) => ({
          sportId: sport.id,
          name: resource.name,
          type: resourceType,
          totalAvailable: 1,
          currentlyAvailable: 1,
        })),
      });

      await prisma.resourceUnit.createMany({
        data: resourceUnits.map((resource: any) => ({
          sportId: sport.id,
          name: resource.name,
          type: resourceType,
        })),
      });
    }

    res.json(sport);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to create sport",
    });
  }
});

export default router;