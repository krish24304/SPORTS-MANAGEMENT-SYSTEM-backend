import express from "express";

import {
  createResourceUnit,
  getSportResources
} from "../controllers/resourceUnitController";

const router = express.Router();

router.post("/", createResourceUnit);

router.get(
  "/sport/:sportId",
  getSportResources
);

export default router;