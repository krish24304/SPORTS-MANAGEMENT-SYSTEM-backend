// import express from "express";
// import bcrypt from "bcryptjs";
// import { prisma } from "../lib/prisma";

// const router = express.Router();
// // SIGNUP
// router.post("/signup", async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       rollNo,
//       role,
//     } = req.body;
  // console.log("REQ BODY =", req.body);
  // console.log("FILE =", req.file);
//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         message: "User already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         rollNo,
//         role,
//       },
//     });

//     res.json(user);

//   } catch (error: any) {

//   console.error("SIGNUP ERROR:");
//   console.error(error);

//   res.status(500).json({
//     message: "Signup failed",
//     error: error?.message,
//   });

// }
// });
// // LOGIN
// router.post("/login", async (req, res) => {
//   try {

//     const { email, password } = req.body;

//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       return res.status(400).json({
//         message: "Invalid email",
//       });
//     }

//     const validPassword =
//       await bcrypt.compare(password, user.password);

//     if (!validPassword) {
//       return res.status(400).json({
//         message: "Invalid password",
//       });
//     }

//     res.json({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });

//   } catch (error) {

//     console.log(error);

//     res.status(500).json({
//       message: "Login failed",
//     });

//   }
// });

// export default router;