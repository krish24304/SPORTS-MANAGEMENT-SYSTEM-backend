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

  res.json([
  {
    id: 1,
    name: "Football",
    totalGear: 30,
    availableGear: 18,
  },
]);

});
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});