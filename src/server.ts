import express from "express";
import cors from "cors";
import { prisma } from "../lib/prisma";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sports Management Backend Running");
});
app.get("/sports", async (req, res) => {

  const sports = await prisma.sport.findMany();

  res.json(sports);

});
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});