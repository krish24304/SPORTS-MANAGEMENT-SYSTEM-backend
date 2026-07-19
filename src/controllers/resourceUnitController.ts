import { Request, Response } from "express";
import prisma from "../lib/prisma";
export const createResourceUnit = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      sportId,
      name,
      type
    } = req.body;

    const resource =
      await prisma.resourceUnit.create({
        data: {
          sportId,
          name,
          type
        }
      });

    res.json(resource);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getSportResources = async (
  req: Request,
  res: Response
) => {
  try {
    const sportId =
      Number(req.params.sportId);

    const resources =
      await prisma.resourceUnit.findMany({
        where: {
          sportId
        }
      });

    res.json(resources);
  } catch (error) {
    res.status(500).json(error);
  }
};