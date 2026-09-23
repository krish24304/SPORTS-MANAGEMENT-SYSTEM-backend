import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const sportIdParam = req.query.sportId;
    const sportId = sportIdParam ? Number(sportIdParam) : undefined;

    if (sportIdParam !== undefined && !Number.isInteger(sportId)) {
      return res.status(400).json({ message: "Invalid sportId" });
    }

    const resourceUnits = await prisma.resourceUnit.findMany({
      where: sportId !== undefined ? { sportId } : undefined,
      orderBy: { id: "asc" },
    });

    return res.json(
      resourceUnits.map((resource) => ({
        id: resource.id,
        sportId: resource.sportId,
        name: resource.name,
        type: resource.type,
        status: resource.status,
        maintenanceMessage: resource.maintenanceMessage,
      }))
    );
  } catch (error) {
    console.error("GET RESOURCES ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch resources" });
  }
});

export default router;