import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

// GET ALL SPORTS

router.get("/", async (req, res) => {

  try {

    const sports = await prisma.sport.findMany({
      include: {
        gears: true,
        resources: true,
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

export default router;
