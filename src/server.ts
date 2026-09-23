// import express, { Request, Response } from "express";
// import cors from "cors";
// import bcrypt from "bcryptjs";
// import path from "path";
// import { upload } from "./middleware/upload";
// import { PrismaClient } from "@prisma/client";
// import resourceRoutes from "./routes/resource.routes";
// import resourceUnitRoutes from "./routes/resourceUnitRoutes";
// const prisma = new PrismaClient();
// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use("/resources", resourceRoutes);
// app.use("/resource-units", resourceUnitRoutes);
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// // ============================================================
// // FRONTEND ADMIN FEATURES
// // ============================================================

// let announcements: any[] = [
//   {
//     id: Date.now(),
//     title: "🏀 Basketball Tournament",
//     message: "Basketball Tournament starts tomorrow at 9:00 AM.",
//     audience: "Everyone",
//     createdAt: "Just now",
//   },
// ];

// let returnRequests: any[] = [
//   {
//     id: 1,
//     student: "Ali Ahmed",
//     borrowed: "Football",
//     quantity: 2,
//     borrowDate: "31 Jul 2026",
//     borrowTime: "10:15 AM",
//     duration: "1 Hour",
//     status: "Pending",
//     verified: true,
//     requestDate: "Today",
//     idCard: "/uploads/id-card-demo.jpg",
//     requestTime: "10:15 AM",
//   },
// ];

// let anonymousRequests: any[] = [
//   {
//     id: 1,
//     message: "Can we extend badminton court timings during weekends?",
//     date: "Today",
//     time: "10:25 AM",
//     viewed: false,
//   },
// ];

// // ============================================================
// // ANNOUNCEMENTS
// // ============================================================

// app.get("/announcements", (req: Request, res: Response) => {
//   res.json(announcements);
// });

// app.post("/announcements", (req: Request, res: Response) => {
//   const { title, message, audience } = req.body;

//   const announcement = {
//     id: Date.now(),
//     title: title || "Announcement",
//     message,
//     audience: audience || "Everyone",
//     createdAt: new Date().toLocaleString(),
//   };

//   announcements.unshift(announcement);

//   res.json(announcement);
// });

// app.delete("/announcements/:id", (req: Request, res: Response) => {
//   const id = Number(req.params.id);

//   announcements = announcements.filter(
//     (announcement) => announcement.id !== id
//   );

//   res.json({ message: "Deleted" });
// });

// // ============================================================
// // RETURN REQUESTS
// // ============================================================

// app.get("/return-requests", (req: Request, res: Response) => {
//   res.json(returnRequests);
// });

// app.post("/return-requests", (req: Request, res: Response) => {
//   const item = {
//     id: Date.now(),
//     ...req.body,
//   };

//   returnRequests.unshift(item);

//   res.json(item);
// });

// app.put("/return-requests/:id", (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);

//     const index = returnRequests.findIndex(
//       (request) => request.id === id
//     );

//     if (index === -1) {
//       return res.status(404).json({
//         message: "Not found",
//       });
//     }

//     const updated = {
//       ...returnRequests[index],
//       ...req.body,
//     };

//     returnRequests[index] = updated;

//     res.json(updated);
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Failed",
//     });
//   }
// });

// // ============================================================
// // ANONYMOUS REQUESTS
// // ============================================================

// app.get("/anonymous-requests", (req: Request, res: Response) => {
//   res.json(anonymousRequests);
// });

// app.post("/anonymous-requests", (req: Request, res: Response) => {
//   const item = {
//     id: Date.now(),
//     ...req.body,
//   };

//   anonymousRequests.unshift(item);

//   res.json(item);
// });
// // ==================== AUTHENTICATION ====================

// // U
// app.post("/auth/signup", upload.single("profilePicture"), async (req: Request, res: Response) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       role,
//       rollNo,
//     } = req.body;
//     console.log("REQ BODY =", req.body);
//     console.log("FILE =", req.file);
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
//         role,
//         rollNo,
//         idCardPhoto: req.file
//   ? `/uploads/${req.file.filename}`
//   : null,      },
//     });
//     res.json(user);
//   } catch (error: any) {
//     console.error("SIGNUP ERROR:");
//     console.error(error);
//     res.status(500).json({
//       message: "Signup failed",
//       error: error?.message,
//     });
//   }
// });


// // User login
// app.post("/auth/login", async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     res.json({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       rollNo: user.rollNo,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Login failed" });
//   }
// });

// // ==================== SPORTS MANAGEMENT ====================

// // Get all sports
// app.get("/sports", async (req: Request, res: Response) => {
//   try {
//     const sports = await prisma.sport.findMany({
//       include: {
//   gears: true,
//   resourceUnits: {
//     orderBy: {
//       id: "asc",
//     },
//   },
//   slots: true,
//   bookings: true,
// },
//     });

//     const formattedSports = sports.map((sport) => ({
//   ...sport,

//   resources: sport.resourceUnits,

//   totalBookings: sport.bookings.length,

//   totalStudents: new Set(
//     sport.bookings.map((booking) => booking.userId)
//   ).size,

//   totalStaff: 0,
// }));

//     res.json(formattedSports);
//   } catch (error) {
  
//     console.error(error);

//     res.status(500).json({
//       message: "Failed to fetch sports",
//     });
//   }
// });
// app.put("/sports-maintenance/:id",
//   async (req, res) => {

//     try {

//       const sportId =
//         Number(req.params.id);

//       const {
//         maintenance,
//         maintenanceMessage,
//       } = req.body;

//       const sport =
//         await prisma.sport.update({

//           where: {
//             id: sportId,
//           },

//           data: {

//             maintenance,

//             maintenanceMessage,

//           },

//         });

//       res.json(sport);

//     } catch (error) {

//       console.log(error);

//       res.status(500).json({

//         message:
//           "Failed to update maintenance",

//       });

//     }

//   }
// );

// // Admin: Create sport
// app.post("/sports", async (req: Request, res: Response) => {
//   try {
//     const {
//   name,
//   resourceType,
//   hasSlotSystem,
//   slotDurationMinutes,
//   totalCourts,
//   availableCourts,
// } = req.body;
//     if (availableCourts > totalCourts) {
//   return res.status(400).json({
//     message:
//       "Available Courts cannot exceed Total Courts",
//   });
// }
//     const sport = await prisma.sport.create({
//   data: {
//     name,
//     resourceType: resourceType || "Court",
//     hasSlotSystem: hasSlotSystem ?? false,
// slotDurationMinutes: slotDurationMinutes ?? 30,
// totalCourts: totalCourts ?? 1,
// availableCourts: availableCourts ?? 1,
//   },
// });

// // Automatically create Resource Units
// await prisma.resourceUnit.createMany({
//   data: Array.from(
//     { length: totalCourts || 1 },
//     (_, index) => ({
//       sportId: sport.id,
//       name: `${resourceType || "Court"} ${index + 1}`,
//       type: resourceType || "Court",
//       status: "available",
//     })
//   ),
// });

// const updatedSport = await prisma.sport.findUnique({
//   where: {
//     id: sport.id,
//   },
//   include: {
//     resourceUnits: true,
//     gears: true,
//     slots: true,
//     bookings: true,
//   },
// });

// res.json({
//   ...updatedSport,
//   resources: updatedSport?.resourceUnits ?? [],
// });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to create sport" });
//   }
// });
// app.get("/sports/:id", async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);

//     if (!Number.isInteger(id)) {
//       return res.status(400).json({
//         message: "Invalid sport id",
//       });
//     }

//     const sport = await prisma.sport.findUnique({
//       where: { id },
//       include: {
//         gears: true,
//         resourceUnits: {
//           orderBy: {
//             id: "asc",
//           },
//         },
//         slots: {
//           orderBy: {
//             startTime: "asc",
//           },
//         },
//       },
//     });

//     if (!sport) {
//       return res.status(404).json({
//         message: "Sport not found",
//       });
//     }

//     const resources = sport.resourceUnits.map((resource) => ({
//       id: resource.id,
//       name: resource.name,
//       type: resource.type,
//       status: resource.status,
//       maintenanceMessage: resource.maintenanceMessage,
//     }));

//     res.json({
//       id: sport.id,
//       name: sport.name,
//       hasSlotSystem: sport.hasSlotSystem,
//       slotDurationMinutes: sport.slotDurationMinutes,
//       totalCourts: sport.totalCourts,
//       availableCourts: sport.availableCourts,
//       maintenance: sport.maintenance,
//       maintenanceMessage: sport.maintenanceMessage,
//       resourceType: sport.resourceType,
//       hasDynamicBooking: sport.hasDynamicBooking,
//       hasTeamSlots: sport.hasTeamSlots,

//       gears: sport.gears,
//       resources,
//       slots: sport.slots,
//     });
//   } catch (error) {
//     console.error("GET SPORT ERROR:", error);

//     res.status(500).json({
//       message: "Failed to fetch sport",
//     });
//   }
// });
// // Admin: Update sport configuration
// app.put("/sports/:id", async (req, res) => {
//   try {

//     const id = Number(req.params.id);

//     const {
//       name,
//       resourceType,
//       hasSlotSystem,
//       slotDurationMinutes,
//       totalCourts,
//       availableCourts,
//       maintenance,
//       maintenanceMessage,
//     } = req.body;

//     //--------------------------------
//     // Update sport
//     //--------------------------------

//     await prisma.sport.update({
//       where: { id },
//       data: {
//         name,
//         resourceType,
//         hasSlotSystem,
//         slotDurationMinutes,
//         totalCourts,
//         availableCourts,
//         maintenance,
//         maintenanceMessage,
//       },
//     });

//     //--------------------------------
//     // IF TYPE CHANGED
//     //--------------------------------

//     if (resourceType) {

//       await prisma.resourceUnit.deleteMany({
//         where: {
//           sportId: id,
//         },
//       });

//       await prisma.resourceUnit.createMany({
//         data: Array.from(
//           { length: totalCourts },
//           (_, i) => ({
//             sportId: id,
//             name: `${resourceType} ${i + 1}`,
//             type: resourceType,
//             status: "available",
//           })
//         ),
//       });

//     }

//     //--------------------------------

//     const updatedSport =
//       await prisma.sport.findUnique({

//         where: { id },

//         include: {

//           resourceUnits: true,

//           gears: true,

//           slots: true,

//           bookings: true,

//         },

//       });

//     res.json({

//       ...updatedSport,

//       resources: updatedSport?.resourceUnits,

//     });

//   }

//   catch (err) {

//     console.log(err);

//     res.status(500).json({

//       message: "Failed",

//     });

//   }

// });
// // Admin: Delete sport
// app.delete("/sports/:id", async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id as string, 10);

//     await prisma.sport.delete({ where: { id } });

//     res.json({ message: "Sport deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to delete sport" });
//   }
// });

// // ==================== SLOTS MANAGEMENT ====================

// // Admin: Generate slots for a sport
// app.post("/slots/generate", async (req: Request, res: Response) => {
//   try {
//     const { sportId, startDate, endDate, teamReservedTimes } = req.body;

//     const sport = await prisma.sport.findUnique({ where: { id: sportId } });

//     if (!sport || !sport.hasSlotSystem) {
//       return res.status(400).json({ message: "Sport doesn't have slot system enabled" });
//     }

//     const slots = [];
//     const slotDuration = sport.slotDurationMinutes;
//     let currentTime = new Date(startDate);
//     const end = new Date(endDate);

//     // Clear existing slots
//     await prisma.slot.deleteMany({ where: { sportId } });

//     while (currentTime < end) {
//       const slotStart = new Date(currentTime);
//       const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

//       // Check if this time is team reserved
//       const isTeamReserved = teamReservedTimes?.some(
//         (tr: any) =>
//           new Date(tr.start) <= slotStart &&
//           slotEnd <= new Date(tr.end)
//       );

//       const slot = await prisma.slot.create({
//         data: {
//           sportId,
//           startTime: slotStart,
//           endTime: slotEnd,
//           slotType: isTeamReserved ? "team_reserved" : "available",
//         },
//       });

//       slots.push(slot);
//       currentTime = slotEnd;
//     }

//     res.json({ message: `Generated ${slots.length} slots`, slots });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to generate slots" });
//   }
// });
// // Create single slot

// app.post("/slots", async (req: Request, res: Response) => {
//   try {

//   const {
//   startTime,
//   endTime,
//   slotType,
//   sportId,

// } = req.body;

//   const sport = await prisma.sport.findUnique({
//   where: {
//     id: Number(sportId),
//   },
// });
//     const slot = await prisma.slot.create({
//       data: {
//         startTime: new Date(startTime),
//         endTime: new Date(endTime),
//         slotType,
//         sportId,
//         maxCapacity: sport?.totalCourts || 1,
//         bookedCount: 0,
//       },
//     });

//     res.json(slot);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Failed to create slot",
//     });

//   }
// });
// app.get("/slots/:sportId",
//   async (req, res) => {

//     try {

//       const sportId =
//         Number(req.params.sportId);

//       const slots =
//         await prisma.slot.findMany({

//           where: {
//             sportId,
//           },

//           include: {
//             bookedBy: true,
//           },

//           orderBy: {
//             startTime: "asc",
//           },

//         });

//       res.json(slots);

//     } catch (error) {

//       console.log(error);

//       res.status(500).json({
//         message: "Failed"
//       });

//     }

//   }
// );
// app.delete("/slots/:id",
//   async (req, res) => {

//     try {

//       const slotId =
//         Number(req.params.id);

//       await prisma.slot.delete({

//         where: {
//           id: slotId,
//         },

//       });

//       res.json({
//         message: "Deleted"
//       });

//     } catch (error) {

//       console.log(error);

//       res.status(500).json({
//         message: "Delete Failed"
//       });

//     }

//   }
// );
// app.put("/slots/toggle/:id",
//   async (req, res) => {

//     try {

//       const slotId =
//         Number(req.params.id);

//       const slot =
//         await prisma.slot.findUnique({

//           where: {
//             id: slotId,
//           },

//         });

//       if (!slot) {

//         return res.status(404).json({
//           message: "Slot not found"
//         });

//       }

//       const updated =
//         await prisma.slot.update({

//           where: {
//             id: slotId,
//           },

//           data: {
//             isActive:
//               !slot.isActive,
//           },

//         });

//       res.json(updated);

//     } catch (error) {

//       console.log(error);

//       res.status(500).json({
//         message: "Failed"
//       });

//     }

//   }
// );
// app.delete("/slot/:id", async (req: Request, res: Response) => {

//   try {

//     const id = parseInt(req.params.id as string, 10)

// ;

//     await prisma.slot.delete({
//       where: { id },
//     });

//     res.json({
//       message: "Slot deleted",
//     });

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Failed to delete slot",
//     });

//   }

// });
// // Student: Get available slots (next 6 hours)
// app.get("/sports/:id/available-slots", async (req: Request, res: Response) => {
//   try {
//     const sportId = parseInt(req.params.id as string, 10);

//     const now = new Date();
//     const sixHoursLater = new Date(
//   now.getTime() + 6 * 60 * 60000
// );
//     const slots = await prisma.slot.findMany({
//       where: {
//         sportId,
//         startTime: {
//           gte: now,
//           lte: sixHoursLater,
//         },
//       },
//       orderBy: {
//         startTime: "asc",
//       },
//     });


//     const slotsWithBooking = await Promise.all(
//       slots.map(async (slot: any) => {
//         const booking = await prisma.booking.findFirst({
//           where: {
//             slotId: slot.id,
//             status: "active",
//           },
//           include: {
//             user: {
//               select: {
//                 id: true,
//                 name: true,
//                 rollNo: true,
//               },
//             },
//           },
//         });

//         const reservation = await prisma.teamReservation.findFirst({
//   where: {
//     sportId,
//     startDateTime: {
//       lte: slot.startTime,
//     },
//     endDateTime: {
//       gte: slot.endTime,
//     },
//   },
// });

//         return {
//           ...slot,
//           isBooked: !!booking,
//           bookedBy: booking?.user,
//           isTeamReserved: !!reservation,
//           teamName: reservation?.teamName,
//         };
//       })
//     );

//     res.json(slotsWithBooking);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Failed to get available slots",
//     });
//   }
// });

// // ==================== GEARS MANAGEMENT ====================

// // Admin: Create gear for a sport
// app.post("/gears", async (req: Request, res: Response) => {
//   try {
//     const { name, description, sportId, totalQuantity } = req.body;

//     const gear = await prisma.gear.create({
//       data: {
//         name,
//         description,
//         sportId,
//         totalQuantity,
//         availableQuantity: totalQuantity,
//         damagedQuantity: 0,
//       },
//     });

//     res.json(gear);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to create gear" });
//   }
// });

// // Admin: Update gear
// app.put("/gears/:id", async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id as string, 10);
//     const { name, description, totalQuantity, damagedQuantity } = req.body;

//     const availableQuantity = totalQuantity - (damagedQuantity || 0);

//     const gear = await prisma.gear.update({
//       where: { id },
//       data: {
//         name,
//         description,
//         totalQuantity,
//         damagedQuantity: damagedQuantity || 0,
//         availableQuantity,
//       },
//     });

//     res.json(gear);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to update gear" });
//   }
// });

// // Admin: Delete gear
// app.delete("/gears/:id", async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id as string, 10);

//     await prisma.gear.delete({ where: { id } });

//     res.json({ message: "Gear deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to delete gear" });
//   }
// });

// // Get sport gears with availability
// app.get("/sports/:id/gears", async (req: Request, res: Response) => {
//   try {
//     const sportId = parseInt(req.params.id as string, 10);

//     const gears = await prisma.gear.findMany({
//       where: { sportId },
//     });

//     res.json(gears);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch gears" });
//   }
// });

// // ==================== RESOURCES MANAGEMENT ====================

// // Admin: Create resource (courts, tables)

// app.post("/sports/:id/resources", async (req, res) => {
//   try {
//     const sportId = Number(req.params.id);

//     const { resources } = req.body;

//     if (!Array.isArray(resources) || resources.length === 0) {
//       return res.status(400).json({
//         message: "No resources supplied",
//       });
//     }

//     await prisma.resourceUnit.createMany({
//       data: resources.map((resource: any) => ({
//         sportId,
//         name: resource.name,
//         type: resource.type,
//         status: "available",
//       })),
//     });

//     const created = await prisma.resourceUnit.findMany({
//       where: {
//         sportId,
//       },
//       orderBy: {
//         id: "asc",
//       },
//     });

//     res.json(created);

//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       message: "Failed to create resources",
//     });
//   }
// });
// app.get("/sports/:id/resources", async (req, res) => {
//   try {
//     const sportId = Number(req.params.id);

//     const resources = await prisma.resourceUnit.findMany({
//       where: { sportId },
//       orderBy: { id: "asc" },
//     });

//     res.json(resources);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch resources" });
//   }
// });

// app.patch("/resources/:id", async (req, res) => {
//   try {
//     const id = Number(req.params.id);

//     const resource = await prisma.resourceUnit.update({
//       where: { id },
//       data: {
//         name: req.body.name,
//       },
//     });

//     res.json(resource);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Rename failed" });
//   }
// });

// app.delete("/resources/:id", async (req, res) => {
//   try {
//     await prisma.resourceUnit.delete({
//       where: {
//         id: Number(req.params.id),
//       },
//     });

//     res.json({
//       message: "Deleted",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Delete failed",
//     });
//   }
// });

// app.patch("/resources/:id/status", async (req, res) => {
//   try {
//     const id = Number(req.params.id);

//     const resource = await prisma.resourceUnit.update({
//       where: { id },
//       data: {
//         status: req.body.status,
//         maintenanceMessage: req.body.maintenanceMessage,
//       },
//     });

//     res.json(resource);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Update failed",
//     });
//   }
// });
// app.put("/resource-units/:id", async (req, res) => {
//   try {
//     const id = Number(req.params.id);

//     const {
//       name,
//       status,
//       maintenanceMessage,
//     } = req.body;

//     const updated =
//       await prisma.resourceUnit.update({
//         where: { id },

//         data: {
//           ...(name !== undefined && { name }),
//           ...(status !== undefined && { status }),
//           ...(maintenanceMessage !== undefined && {
//             maintenanceMessage,
//           }),
//         },
//       });

//     res.json(updated);
//   } catch (err) {
//     console.log(err);

//     res.status(500).json({
//       message: "Failed to update resource",
//     });
//   }
// });

// app.delete("/resource-units/:id", async (req,res)=>{

//     try{

//         await prisma.resourceUnit.delete({

//             where:{
//                 id:Number(req.params.id)
//             }

//         });

//         res.json({
//             success:true
//         });

//     }catch(err){

//         console.log(err);

//         res.status(500).json({
//             message:"Delete failed"
//         });

//     }

// });

// // ==================== BOOKINGS ====================

// // Student: Book a slot
// app.post("/bookings/slot", async (req: Request, res: Response) => {
//   try {
//     const { userId, sportId, slotId, gearsBooked, notes } = req.body;

//     // Check if user has active booking
//     const activeBooking = await prisma.booking.findFirst({
//       where: {
//         userId,
//         status: "active",
//       },
//     });

//     if (activeBooking) {
//       return res.status(400).json({
//         message: "You must cancel or complete your current booking first",
//       });
//     }

//     // Check slot availability
//     const slot = await prisma.slot.findUnique({ where: { id: slotId } });
//     const sport =
// await prisma.sport.findUnique({

//   where: {
//     id: sportId,
//   },

// });

// if (sport?.maintenance) {

//   return res.status(400).json({

//     message:
//       "Sport is under maintenance",

//   });

// }

//     if (!slot || slot.slotType === "team_reserved") {
//       return res.status(400).json({ message: "Slot is not available" });
//     }

//     const activeBookings =
//   await prisma.booking.count({
//     where: {
//       slotId,
//       status: "active",
//     },
//   });

// if (
//   activeBookings >=
//   slot.maxCapacity
// ) {
//   return res.status(400).json({
//     message: "Slot capacity reached",
//   });
// }

//     // Update gear quantities if gears are booked
//     if (gearsBooked) {
//       for (const item of gearsBooked) {
//         const gear = await prisma.gear.findUnique({
//           where: { id: item.gearId },
//         });

//         if (!gear || gear.availableQuantity < item.quantity) {
//           return res.status(400).json({
//             message: `Gear "${gear?.name}" is not available in required quantity`,
//           });
//         }

//         await prisma.gear.update({
//           where: { id: item.gearId },
//           data: {
//             availableQuantity: gear.availableQuantity - item.quantity,
//           },
//         });
//       }
//     }

//     const booking = await prisma.booking.create({
//       data: {
//         userId,
//         sportId,
//         slotId,
//         bookingType: "slot",
//         gearsBooked: gearsBooked || null,
//         status: "active",
//         startTime: slot.startTime,
//         endTime: slot.endTime,
//         notes,
//       },
//     });
//      await prisma.slot.update({
//       where: { id: slotId },
//       data: {
//         bookedCount: {
//           increment: 1,
//         },
//       },
//     });
//     res.json({
//       message: "Slot booked successfully",
//       booking,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to book slot" });
//   }
// });

// // Student: Book gears only (non-slot sport)
// app.post("/bookings/gear", async (req: Request, res: Response) => {
//   try {
//     const { userId, sportId, gearsBooked, notes } = req.body;

//     // Check if user has active booking for this sport
//     const activeBooking = await prisma.booking.findFirst({
//       where: {
//         userId,
//         status: "active",
//       },
//     });

//     if (activeBooking) {
//       return res.status(400).json({
//         message: "You already have an active booking for this sport",
//       });
//     }

//     // Update gear quantities
//     if (gearsBooked) {
//       for (const item of gearsBooked) {
//         const gear = await prisma.gear.findUnique({
//           where: { id: item.gearId },
//         });

//         if (!gear || gear.availableQuantity < item.quantity) {
//           return res.status(400).json({
//             message: `Gear "${gear?.name}" is not available in required quantity`,
//           });
//         }

//         await prisma.gear.update({
//           where: { id: item.gearId },
//           data: {
//             availableQuantity: gear.availableQuantity - item.quantity,
//           },
//         });
//       }
//     }

//     const booking = await prisma.booking.create({
//       data: {
//         userId,
//         sportId,
//         bookingType: "gear",
//         gearsBooked: gearsBooked || null,
//         status: "active",
//         notes,
//       },
//     });

//     res.json({
//       message: "Gear booking successful",
//       booking,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to book gear" });
//   }
// });

// // Student: Cancel booking
// app.post("/bookings/:id/cancel", async (req: Request, res: Response) => {
//   try {
//     const bookingId = parseInt(req.params.id as string, 10);

//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingId },
//     });

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     if (booking.status === "cancelled") {
//       return res.status(400).json({ message: "Booking already cancelled" });
//     }

//     // Return gears to available pool
//     if (booking.gearsBooked) {
//       for (const item of booking.gearsBooked as any[]) {
//         const gear = await prisma.gear.findUnique({
//           where: { id: item.gearId },
//         });

//         if (gear) {
//           await prisma.gear.update({
//             where: { id: item.gearId },
//             data: {
//               availableQuantity: gear.availableQuantity + item.quantity,
//             },
//           });
//         }
//       }
//     }

//     const updatedBooking = await prisma.booking.update({
//       where: { id: bookingId },
//       data: {
//         status: "cancelled",
//         cancelledAt: new Date(),
//       },
//     });
//       if (booking.slotId) {
//   await prisma.slot.update({
//     where: {
//       id: booking.slotId,
//     },
//     data: {
//       bookedCount: {
//         decrement: 1,
//       },
//     },
//   });
// }
//     res.json({
//       message: "Booking cancelled successfully",
//       booking: updatedBooking,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to cancel booking" });
//   }
// });
// app.put("/return-request/:id", async (req, res) => {
//   try {

//     const bookingId = Number(req.params.id);

//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingId }
//     });

//     if (!booking) {
//       return res.status(404).json({
//         message: "Booking not found"
//       });
//     }

//     if (booking.status === "completed") {
//       return res.status(400).json({
//         message: "Booking already returned"
//       });
//     }

//     if (booking.status === "return_requested") {
//       return res.status(400).json({
//         message: "Return already requested"
//       });
//     }

//     const updatedBooking =
//       await prisma.booking.update({
//         where: { id: bookingId },
//         data: {
//           status: "return_requested",
//           returnRequestedAt: new Date()
//         }
//       });

//     res.json(updatedBooking);

//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       message: "Return request failed"
//     });
//   }
// });
// app.put("/approve-return/:id",
//   async (req, res) => {
//     try {
//       const bookingId = Number(req.params.id);
//       const booking = await prisma.booking.findUnique({
//         where: {
//           id: bookingId,
//         },
//       });

//       if (!booking) {
//         return res.status(404).json({
//           message: "Booking not found",
//         });
//       }

//       if (booking.status === "completed") {
//         return res.status(400).json({
//           message: "Booking already completed",
//         });
//       }

//       if (booking.status !== "return_requested") {
//         return res.status(400).json({
//           message: "Return request not found",
//         });
//       }

//       if (booking.returnedAt) {
//         return res.status(400).json({
//           message: "Booking already returned",
//         });
//       }
//       if (booking.bookingType === "gear" && booking.gearsBooked) {

//   for (const item of booking.gearsBooked as any[]) {

//     const gear = await prisma.gear.findUnique({
//       where: { id: item.gearId }
//     });

//     if (gear) {

//       await prisma.gear.update({
//         where: { id: item.gearId },
//         data: {
//           availableQuantity:
//             gear.availableQuantity + item.quantity
//         }
//       });

//     }

//   }

// }
//       await prisma.booking.update({

//         where: {
//           id: bookingId,
//         },

//         data: {

//           status:
//             "completed",

//           returnedAt:
//             new Date(),

//         },

//       });

//       res.json({

//         message:
//           "Return Approved",

//         });

//     } catch (error) {

//       console.log(error);

//       res.status(500).json({

//         message:
//           "Approval Failed",

//       });
        
//     }

//   }
// );

// // Student: Get their bookings
// app.get("/users/:userId/bookings", async (req: Request, res: Response) => {
//   try {
//     const userId = parseInt(req.params.userId as string, 10);

//     const bookings = await prisma.booking.findMany({
//       where: { userId },
//       include: {
//         sport: true,
//         slot: true,
//       },
//       orderBy: { bookedAt: "desc" },
//     });

//     res.json(bookings);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch bookings" });
//   }
// });

// // ==================== HISTORY / STAFF VIEW ====================

// // Staff/Admin: Get all bookings with student details
// app.get("/bookings/history", async (req: Request, res: Response) => {
//   try {
//     const { sportId, status } = req.query;

//     const where: any = {};
//     if (sportId) where.sportId = parseInt(sportId as string, 10);
//     if (status) where.status = status;

//     const bookings = await prisma.booking.findMany({
//       where,
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             rollNo: true,
//             phone: true,
//           },
//         },
//         sport: { select: { id: true, name: true } },
//         slot: true,
//       },
//       orderBy: { bookedAt: "desc" },
//     });

//     res.json(bookings);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch booking history" });
//   }
// });

// // Staff: Get student booking history
// app.get("/students/:userId/history", async (req: Request, res: Response) => {
//   try {
//     const userId = parseInt(req.params.userId as string, 10);

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       include: {
//         bookings: {
//           include: {
//             sport: { select: { id: true, name: true } },
//             slot: true,
//           },
//           orderBy: { bookedAt: "desc" },
//         },
//         issuedGears: {
//           include: {
//             gear: { select: { id: true, name: true } },
//           },
//           orderBy: { issueDate: "desc" },
//         },
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     res.json({
//       student: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         rollNo: user.rollNo,
//         phone: user.phone,
//       },
//       bookings: user.bookings,
//       issuedGears: user.issuedGears,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch student history" });
//   }
// });
// app.get("/returns/pending",async (req, res) => {

//     const bookings =await prisma.booking.findMany({

//         where: {
//           status:
//             "return_requested",
//         },

//         include: {
//           user: true,
//           sport: true,
//           slot: true,
//         },

//       });

//     res.json(bookings);

//   }
// );

// // ==================== GEAR ISSUANCE ====================

// // Staff: Issue gear to student
// app.post("/issued-gears", async (req: Request, res: Response) => {
//   try {
//     const { userId, gearId, quantityIssued, expectedReturnDate, issueNotes } = req.body;

//     const gear = await prisma.gear.findUnique({ where: { id: gearId } });

//     if (!gear || gear.availableQuantity < quantityIssued) {
//       return res.status(400).json({ message: "Insufficient gear quantity" });
//     }

//     await prisma.gear.update({
//       where: { id: gearId },
//       data: {
//         availableQuantity: gear.availableQuantity - quantityIssued,
//       },
//     });

//     const issuedGear = await prisma.issuedGear.create({
//       data: {
//         userId,
//         gearId,
//         quantityIssued,
//         expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
//         issueNotes,
//       },
//     });

//     res.json({
//       message: "Gear issued successfully",
//       issuedGear,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to issue gear" });
//   }
// });

// // Staff: Mark gear as returned
// app.post("/issued-gears/:id/return", async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id as string, 10);
//     const { condition } = req.body;

//     const issuedGear = await prisma.issuedGear.findUnique({ where: { id } });

//     if (!issuedGear) {
//       return res.status(404).json({ message: "Issued gear record not found" });
//     }

//     // Return gears to inventory
//     const gear = await prisma.gear.findUnique({ where: { id: issuedGear.gearId } });

//     if (gear) {
//       let availableToAdd = issuedGear.quantityIssued;

//       if (condition === "damaged") {
//         availableToAdd = 0;

//         await prisma.gear.update({
//           where: { id: gear.id },
//           data: {
//             damagedQuantity: gear.damagedQuantity + issuedGear.quantityIssued,
//           },
//         });
//       } else {
//         await prisma.gear.update({
//           where: { id: gear.id },
//           data: {
//             availableQuantity: gear.availableQuantity + availableToAdd,
//           },
//         });
//       }
//     }

//     const updated = await prisma.issuedGear.update({
//       where: { id },
//       data: {
//         returnDate: new Date(),
//         status: "returned",
//         condition,
//       },
//     });

//     res.json({
//       message: "Gear returned successfully",
//       issuedGear: updated,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to return gear" });
//   }
// });

// // Get all issued gears
// app.get("/issued-gears", async (req: Request, res: Response) => {
//   try {
//     const { status, userId } = req.query;

//     const where: any = {};
//     if (status) where.status = status;
//     if (userId) where.userId = parseInt(userId as string);

//     const issuedGears = await prisma.issuedGear.findMany({
//       where,
//       include: {
//         user: { select: { id: true, name: true, rollNo: true, email: true } },
//         gear: { select: { id: true, name: true, sport: { select: { name: true } } } },
//       },
//       orderBy: { issueDate: "desc" },
//     });

//     res.json(issuedGears);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch issued gears" });
//   }
// });
// app.post("/team-reservations", async (req, res) => {
//   try {
//     console.log(req.body);

//     const {
//       teamName,
//       sportId,
//       resourceUnitIds,
//       startDateTime,
//       durationMinutes,
//       bookedById,
//       purpose,
//       reservationMessage,
//     } = req.body;

//     if (!Array.isArray(resourceUnitIds) || resourceUnitIds.length === 0) {
//       return res.status(400).json({
//         message: "Select at least one resource",
//       });
//     }

//     const reservation = await prisma.teamReservation.create({
//       data: {
//         teamName,
//         purpose,
//         reservationMessage,
//         startDateTime: new Date(startDateTime),
// endDateTime: new Date(
//   new Date(startDateTime).getTime() +
//     Number(durationMinutes) * 60 * 1000
// ),
// durationMinutes,

//         sport: {
//           connect: {
//             id: Number(sportId),
//           },
//         },

//         ...(bookedById
//           ? {
//               bookedBy: {
//                 connect: {
//                   id: Number(bookedById),
//                 },
//               },
//             }
//           : {}),

//         resourcesUnit: {
//           create: resourceUnitIds.map((resourceUnitId: number) => ({
//             resourceUnit: {
//               connect: {
//                 id: Number(resourceUnitId),
//               },
//             },
//           })),
//         },
//       },

//       include: {
//         sport: true,
//         bookedBy: true,
//         resourcesUnit: {
//           include: {
//             resourceUnit: true,
//           },
//         },
//       },
//     });

//     return res.json(reservation);
//   } catch (error: any) {
//     console.error("TEAM RESERVATION ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to create reservation",
//       error: error instanceof Error ? error.message : String(error),
//     });
//   }
// });
// app.get("/team-reservations",
//   async (req, res) => {

//     try {

//       const reservations =
//         await prisma.teamReservation.findMany({

//           include: {
//   sport: true,
//   bookedBy: true,
//   resourcesUnit: {

//     include: {
//       resourceUnit: true,
//     },

//   },
// },

//           orderBy: {
//             startDateTime: "asc",
//           },

//         });

//       res.json(reservations);

//     } catch (error) {

//       console.log(error);

//       res.status(500).json({
//         message:
//           "Failed to fetch reservations",
//       });

//     }

//   }
// );
// app.delete("/team-reservations/:id",
//   async (req, res) => {

//     try {

//       const id =
//         Number(req.params.id);

//       await prisma.teamReservation.delete({

//         where: { id },

//       });

//       res.json({
//         message:
//           "Reservation deleted",
//       });

//     } catch (error) {

//       console.log(error);

//       res.status(500).json({
//         message:
//           "Delete failed",
//       });

//     }

//   }
// );
// // ==================== NOTICES ====================

// // Admin: Create notice
// app.post("/notices", async (req: Request, res: Response) => {
//   try {
//     const { title, message, sportId, type } = req.body;

//     const notice = await prisma.notice.create({
//       data: {
//         title,
//         message,
//         sportId: sportId || null,
//         type: type || "general",
//       },
//     });

//     res.json(notice);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to create notice" });
//   }
// });

// // Get notices
// app.get("/notices", async (req: Request, res: Response) => {
//   try {
//     const { sportId } = req.query;

//     const where: any = {};
//     if (sportId) where.sportId = parseInt(sportId as string);

//     const notices = await prisma.notice.findMany({
//       where,
//       include: { sport: { select: { name: true } } },
//       orderBy: { createdAt: "desc" },
//     });

//     res.json(notices);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch notices" });
//   }
// });
// app.get("/bookings/active", async (req, res) => {
//   try {
//     const bookings =
//       await prisma.booking.findMany({
//         where: {
//           status: "active",
//         },

//         include: {
//           user: true,
//           sport: true,
//           slot: true,
//         },

//         orderBy: {
//           bookedAt: "desc",
//         },
//       });

//     res.json(bookings);
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Failed to fetch bookings",
//     });
//   }
// });



// // ==================== LIVE BOOKINGS ====================

// // Staff: Get currently active/live bookings
// app.get("/bookings/live", async (req: Request, res: Response) => {
//   try {
//     const now = new Date();

//     const bookings = await prisma.booking.findMany({
//       where: {
//         status: "active",
//         OR: [
//           // Gear-only bookings do not necessarily have start/end times.
//           // They are still considered live while status is active.
//           {
//             startTime: null,
//           },

//           // Time-based booking currently in progress
//           {
//             AND: [
//               {
//                 startTime: {
//                   lte: now,
//                 },
//               },
//               {
//                 OR: [
//                   {
//                     endTime: null,
//                   },
//                   {
//                     endTime: {
//                       gte: now,
//                     },
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },

//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             rollNo: true,
//             phone: true,
//             idCardPhoto: true,
//           },
//         },

//         sport: {
//           select: {
//             id: true,
//             name: true,
//             hasSlotSystem: true,
//             resourceType: true,
//           },
//         },

//         slot: true,

//         resourceUnit: true,
//       },

//       orderBy: {
//         bookedAt: "desc",
//       },
//     });

//     const formattedBookings = bookings.map((booking) => {
//       let gears: any[] = [];

//       if (booking.gearsBooked) {
//         try {
//           gears = Array.isArray(booking.gearsBooked)
//             ? booking.gearsBooked
//             : [];
//         } catch {
//           gears = [];
//         }
//       }

//       let resources: any[] = [];

//       if (booking.resourcesBooked) {
//         try {
//           resources = Array.isArray(booking.resourcesBooked)
//             ? booking.resourcesBooked
//             : [];
//         } catch {
//           resources = [];
//         }
//       }

//       return {
//         id: booking.id,

//         student: {
//           id: booking.user.id,
//           name: booking.user.name,
//           email: booking.user.email,
//           rollNo: booking.user.rollNo,
//           phone: booking.user.phone,
//           idCardPhoto: booking.user.idCardPhoto,
//         },

//         sport: {
//           id: booking.sport.id,
//           name: booking.sport.name,
//           hasSlotSystem: booking.sport.hasSlotSystem,
//           resourceType: booking.sport.resourceType,
//         },

//         bookingType: booking.bookingType,

//         status: booking.status,

//         bookedAt: booking.bookedAt,

//         startTime: booking.startTime,
//         endTime: booking.endTime,

//         slot: booking.slot
//           ? {
//               id: booking.slot.id,
//               startTime: booking.slot.startTime,
//               endTime: booking.slot.endTime,
//               slotType: booking.slot.slotType,
//             }
//           : null,

//         resourceUnit: booking.resourceUnit
//           ? {
//               id: booking.resourceUnit.id,
//               name: booking.resourceUnit.name,
//               type: booking.resourceUnit.type,
//             }
//           : null,

//         gearsBooked: gears,

//         resourcesBooked: resources,

//         notes: booking.notes,
//       };
//     });

//     res.json(formattedBookings);
//   } catch (error) {
//     console.error("LIVE BOOKINGS ERROR:", error);

//     res.status(500).json({
//       message: "Failed to fetch live bookings",
//     });
//   }
// });



// // ==================== SERVER ====================

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// export default app;
































































































































































import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { upload } from "./middleware/upload";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireRole, requireSelfOrRole } from "./middleware/auth.middleware";
import { isValidCollegeId, normalizeCollegeId } from "./config/auth.config";
import { loadAdminData, saveAdminData } from "./persistence";
import resourceRoutes from "./routes/resource.routes";
import resourceUnitRoutes from "./routes/resourceUnitRoutes";
const prisma = new PrismaClient();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/resources", authenticate, resourceRoutes);
app.use("/resource-units", authenticate, resourceUnitRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// ============================================================
// FRONTEND ADMIN FEATURES
// ============================================================

const persistedAdminData = loadAdminData();

let announcements: any[] = persistedAdminData.announcements;
let returnRequests: any[] = persistedAdminData.returnRequests;
let anonymousRequests: any[] = persistedAdminData.anonymousRequests;

function persistAdminFeatures() {
  saveAdminData({
    announcements,
    returnRequests,
    anonymousRequests,
  });
}

// ============================================================
// ANNOUNCEMENTS
// ============================================================

app.get("/announcements", (req: Request, res: Response) => {
  res.json(announcements);
});

app.post("/announcements", authenticate, requireRole("admin"), (req: Request, res: Response) => {
  const title = String(req.body.title ?? "Announcement").trim();
  const message = String(req.body.message ?? "").trim();
  const audience = String(req.body.audience ?? "Everyone").trim();

  if (!message) {
    return res.status(400).json({ message: "Announcement message is required" });
  }

  const announcement = {
    id: Date.now(),
    title: title || "Announcement",
    message,
    audience: audience || "Everyone",
    createdAt: new Date().toLocaleString(),
  };

  announcements.unshift(announcement);
  persistAdminFeatures();

  res.json(announcement);
});

app.delete("/announcements/:id", authenticate, requireRole("admin"), (req: Request, res: Response) => {
  const id = Number(req.params.id);

  announcements = announcements.filter(
    (announcement) => announcement.id !== id
  );
  persistAdminFeatures();

  res.json({ message: "Deleted" });
});

// ============================================================
// RETURN REQUESTS
// ============================================================

app.get("/return-requests", authenticate, requireRole("admin", "staff"), (req: Request, res: Response) => {
  res.json(returnRequests);
});

app.post("/return-requests", authenticate, requireRole("student"), (req: Request, res: Response) => {
  const item = {
    id: Date.now(),
    ...req.body,
  };

  returnRequests.unshift(item);
  persistAdminFeatures();

  res.json(item);
});

app.put("/return-requests/:id", authenticate, requireRole("admin", "staff"), (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const index = returnRequests.findIndex(
      (request) => request.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    const updated = {
      ...returnRequests[index],
      ...req.body,
    };

    returnRequests[index] = updated;
    persistAdminFeatures();

    res.json(updated);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed",
    });
  }
});

// ============================================================
// ANONYMOUS REQUESTS
// ============================================================

app.get("/anonymous-requests", authenticate, requireRole("admin", "staff"), (req: Request, res: Response) => {
  res.json(anonymousRequests);
});

app.post("/anonymous-requests", (req: Request, res: Response) => {
  const item = {
    id: Date.now(),
    ...req.body,
  };

  anonymousRequests.unshift(item);

  res.json(item);
});
// ==================== AUTHENTICATION ====================

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from the environment");
}

const publicUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  rollNo: user.rollNo,
  phone: user.phone,
  idCardPhoto: user.idCardPhoto,
});

app.post(
  "/auth/signup",
  upload.single("profilePicture"),
  async (req: Request, res: Response) => {
    try {
      const name = String(req.body.name ?? "").trim();
      const email = String(req.body.email ?? "").trim().toLowerCase();
      const password = String(req.body.password ?? "");
      const collegeId = normalizeCollegeId(req.body.collegeId ?? req.body.rollNo);

      if (!name || !email || !password || !collegeId) {
        return res.status(400).json({
          message: "Name, email, college ID and password are required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters",
        });
      }

      if (!isValidCollegeId(collegeId)) {
        return res.status(403).json({
          message: "This is not a valid college ID",
        });
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { rollNo: collegeId },
          ],
        },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "An account already exists for this email or college ID",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // Public signup can ONLY create a student account.
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "student" as any,
          rollNo: collegeId,
          idCardPhoto: req.file ? `/uploads/${req.file.filename}` : null,
        },
      });

      const token = jwt.sign(
        {
          sub: String(user.id),
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          rollNo: user.rollNo,
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      return res.status(201).json({
        ...publicUser(user),
        token,
        message: "Account created successfully",
      });
    } catch (error: any) {
      console.error("SIGNUP ERROR:", error);
      return res.status(500).json({
        message: "Signup failed",
      });
    }
  }
);

// Login now uses the real college ID + password.
app.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const collegeId = normalizeCollegeId(req.body.collegeId ?? req.body.rollNo);
    const password = String(req.body.password ?? "");

    if (!collegeId || !password) {
      return res.status(400).json({
        message: "College ID and password are required",
      });
    }

    const user = await prisma.user.findFirst({
      where: { rollNo: collegeId },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid college ID or password" });
    }

    // Students must still exist in the authoritative college-ID allow-list.
    if (String(user.role).toLowerCase() === "student" && !isValidCollegeId(collegeId)) {
      return res.status(401).json({ message: "Invalid college ID or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid college ID or password" });
    }

    const token = jwt.sign(
      {
        sub: String(user.id),
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        rollNo: user.rollNo,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      ...publicUser(user),
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

app.get("/auth/me", authenticate, async (req: Request, res: Response) => {
  return res.json({ user: req.user });
});

// ==================== SPORTS MANAGEMENT ====================

// Get all sports
app.get("/sports", async (req: Request, res: Response) => {
  try {
    const sports = await prisma.sport.findMany({
      include: {
  gears: true,
  resourceUnits: {
    orderBy: {
      id: "asc",
    },
  },
  slots: true,
  bookings: true,
},
    });

    const formattedSports = sports.map((sport) => ({
  ...sport,

  resources: sport.resourceUnits,

  totalBookings: sport.bookings.length,

  totalStudents: new Set(
    sport.bookings.map((booking) => booking.userId)
  ).size,

  totalStaff: 0,
}));

    res.json(formattedSports);
  } catch (error) {
  
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch sports",
    });
  }
});
app.put("/sports-maintenance/:id", authenticate, requireRole("admin"),
  async (req, res) => {

    try {

      const sportId =
        Number(req.params.id);

      const {
        maintenance,
        maintenanceMessage,
      } = req.body;

      const sport =
        await prisma.sport.update({

          where: {
            id: sportId,
          },

          data: {

            maintenance,

            maintenanceMessage,

          },

        });

      res.json(sport);

    } catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          "Failed to update maintenance",

      });

    }

  }
);
// Admin: Create sport
app.post("/sports", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const {
  name,
  resourceType,
  hasSlotSystem,
  slotDurationMinutes,
  totalCourts,
  availableCourts,
} = req.body;
    const parsedTotalCourts = Number(totalCourts ?? 1);
    const parsedAvailableCourts = Number(availableCourts ?? parsedTotalCourts);

    if (
      !Number.isInteger(parsedTotalCourts) ||
      parsedTotalCourts < 1 ||
      !Number.isInteger(parsedAvailableCourts) ||
      parsedAvailableCourts < 0 ||
      parsedAvailableCourts > parsedTotalCourts
    ) {
      return res.status(400).json({
        message: "Courts must be valid integers and availableCourts cannot exceed totalCourts",
      });
    }
    const sport = await prisma.sport.create({
  data: {
    name,
    resourceType: resourceType || "Court",
    hasSlotSystem: hasSlotSystem ?? false,
slotDurationMinutes: slotDurationMinutes ?? 30,
totalCourts: parsedTotalCourts,
availableCourts: parsedAvailableCourts,
  },
});

// Automatically create Resource Units
await prisma.resourceUnit.createMany({
  data: Array.from(
    { length: parsedTotalCourts },
    (_, index) => ({
      sportId: sport.id,
      name: `${resourceType || "Court"} ${index + 1}`,
      type: resourceType || "Court",
      status: "available",
    })
  ),
});

const updatedSport = await prisma.sport.findUnique({
  where: {
    id: sport.id,
  },
  include: {
    resourceUnits: true,
    gears: true,
    slots: true,
    bookings: true,
  },
});

res.json({
  ...updatedSport,
  resources: updatedSport?.resourceUnits ?? [],
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create sport" });
  }
});
app.get("/sports/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid sport id",
      });
    }

    const sport = await prisma.sport.findUnique({
      where: { id },
      include: {
        gears: true,
        resourceUnits: {
          orderBy: {
            id: "asc",
          },
        },
        slots: {
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });

    if (!sport) {
      return res.status(404).json({
        message: "Sport not found",
      });
    }

    const resources = sport.resourceUnits.map((resource) => ({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      status: resource.status,
      maintenanceMessage: resource.maintenanceMessage,
    }));

    res.json({
      id: sport.id,
      name: sport.name,
      hasSlotSystem: sport.hasSlotSystem,
      slotDurationMinutes: sport.slotDurationMinutes,
      totalCourts: sport.totalCourts,
      availableCourts: sport.availableCourts,
      maintenance: sport.maintenance,
      maintenanceMessage: sport.maintenanceMessage,
      resourceType: sport.resourceType,
      hasDynamicBooking: sport.hasDynamicBooking,
      hasTeamSlots: sport.hasTeamSlots,

      gears: sport.gears,
      resources,
      slots: sport.slots,
    });
  } catch (error) {
    console.error("GET SPORT ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch sport",
    });
  }
});
// Admin: Update sport configuration
app.put(
  "/sports/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "Invalid sport id" });
      }

      const existing = await prisma.sport.findUnique({
        where: { id },
        include: { resourceUnits: true },
      });

      if (!existing) {
        return res.status(404).json({ message: "Sport not found" });
      }

      const {
        name,
        resourceType,
        hasSlotSystem,
        slotDurationMinutes,
        totalCourts,
        availableCourts,
        maintenance,
        maintenanceMessage,
      } = req.body;

      const nextTotalCourts =
        totalCourts === undefined ? existing.totalCourts : Number(totalCourts);
      const nextAvailableCourts =
        availableCourts === undefined
          ? existing.availableCourts
          : Number(availableCourts);

      if (!Number.isInteger(nextTotalCourts) || nextTotalCourts < 1) {
        return res.status(400).json({ message: "totalCourts must be at least 1" });
      }

      if (
        !Number.isInteger(nextAvailableCourts) ||
        nextAvailableCourts < 0 ||
        nextAvailableCourts > nextTotalCourts
      ) {
        return res.status(400).json({
          message: "availableCourts must be between 0 and totalCourts",
        });
      }

      if (
        hasSlotSystem !== undefined &&
        typeof hasSlotSystem !== "boolean"
      ) {
        return res.status(400).json({ message: "hasSlotSystem must be boolean" });
      }

      if (
        slotDurationMinutes !== undefined &&
        (!Number.isInteger(Number(slotDurationMinutes)) || Number(slotDurationMinutes) <= 0)
      ) {
        return res.status(400).json({
          message: "slotDurationMinutes must be a positive integer",
        });
      }

      const resourceTypeChanged =
        resourceType !== undefined && resourceType !== existing.resourceType;
      const courtCountChanged = nextTotalCourts !== existing.totalCourts;

      const updatedSport = await prisma.$transaction(async (tx) => {
        await tx.sport.update({
          where: { id },
          data: {
            ...(name !== undefined && { name: String(name).trim() }),
            ...(resourceType !== undefined && { resourceType }),
            ...(hasSlotSystem !== undefined && { hasSlotSystem }),
            ...(slotDurationMinutes !== undefined && {
              slotDurationMinutes: Number(slotDurationMinutes),
            }),
            totalCourts: nextTotalCourts,
            availableCourts: nextAvailableCourts,
            ...(maintenance !== undefined && { maintenance }),
            ...(maintenanceMessage !== undefined && { maintenanceMessage }),
          },
        });

        // Keep existing resource IDs whenever possible. Never delete resources
        // automatically because bookings/reservations may reference them.
        if (resourceTypeChanged || courtCountChanged) {
          const resourceTypeValue =
            resourceType ?? existing.resourceType ?? "Court";

          // Update existing units in place so existing IDs remain valid.
          const unitsToKeep = Math.min(existing.resourceUnits.length, nextTotalCourts);

          for (let i = 0; i < unitsToKeep; i += 1) {
            await tx.resourceUnit.update({
              where: { id: existing.resourceUnits[i].id },
              data: {
                name: `${resourceTypeValue} ${i + 1}`,
                type: resourceTypeValue,
              },
            });
          }

          // If the new count is larger, create only the missing units.
          if (nextTotalCourts > existing.resourceUnits.length) {
            await tx.resourceUnit.createMany({
              data: Array.from(
                { length: nextTotalCourts - existing.resourceUnits.length },
                (_, offset) => ({
                  sportId: id,
                  name: `${resourceTypeValue} ${existing.resourceUnits.length + offset + 1}`,
                  type: resourceTypeValue,
                  status: "available",
                })
              ),
            });
          }

          // If the new count is smaller, do not destroy existing units.
          // Existing bookings/reservations may depend on those IDs.
          if (nextTotalCourts < existing.resourceUnits.length) {
            throw Object.assign(
              new Error(
                `Cannot reduce resources from ${existing.resourceUnits.length} to ${nextTotalCourts} automatically. Existing resource records are preserved to protect bookings.`
              ),
              { statusCode: 409 }
            );
          }
        }

        return tx.sport.findUnique({
          where: { id },
          include: {
            resourceUnits: { orderBy: { id: "asc" } },
            gears: true,
            slots: true,
            bookings: true,
          },
        });
      });

      return res.json({
        ...updatedSport,
        resources: updatedSport?.resourceUnits ?? [],
      });
    } catch (error) {
      console.error("UPDATE SPORT ERROR:", error);
      return res.status(500).json({ message: "Failed to update sport" });
    }
  }
);
// Admin: Delete sport
app.delete("/sports/:id", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);

    await prisma.sport.delete({ where: { id } });

    res.json({ message: "Sport deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete sport" });
  }
});

// ==================== SLOTS MANAGEMENT ====================

// Admin: Generate slots for a sport
app.post(
  "/slots/generate",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const sportId = Number(req.body.sportId);
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      const teamReservedTimes = Array.isArray(req.body.teamReservedTimes)
        ? req.body.teamReservedTimes
        : [];

      if (!Number.isInteger(sportId) || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid slot generation data" });
      }

      if (startDate >= endDate) {
        return res.status(400).json({ message: "startDate must be before endDate" });
      }

      const sport = await prisma.sport.findUnique({ where: { id: sportId } });
      if (!sport || !sport.hasSlotSystem) {
        return res.status(400).json({ message: "Sport doesn't have slot system enabled" });
      }

      const slotDuration = Number(sport.slotDurationMinutes);
      if (!Number.isInteger(slotDuration) || slotDuration <= 0) {
        return res.status(400).json({ message: "Sport has an invalid slot duration" });
      }

      const slots = await prisma.$transaction(async (tx) => {
        // Preserve the existing feature of regenerating the slot calendar.
        await tx.slot.deleteMany({ where: { sportId } });

        const created: any[] = [];
        let currentTime = new Date(startDate);

        while (
          currentTime.getTime() + slotDuration * 60_000 <= endDate.getTime()
        ) {
          const slotStart = new Date(currentTime);
          const slotEnd = new Date(currentTime.getTime() + slotDuration * 60_000);

          const isTeamReserved = teamReservedTimes.some((tr: any) => {
            const reservedStart = new Date(tr.start);
            const reservedEnd = new Date(tr.end);
            return (
              !Number.isNaN(reservedStart.getTime()) &&
              !Number.isNaN(reservedEnd.getTime()) &&
              reservedStart <= slotStart &&
              slotEnd <= reservedEnd
            );
          });

          const slot = await tx.slot.create({
            data: {
              sportId,
              startTime: slotStart,
              endTime: slotEnd,
              slotType: isTeamReserved ? "team_reserved" : "available",
              maxCapacity: sport.totalCourts || 1,
              bookedCount: 0,
            },
          });

          created.push(slot);
          currentTime = slotEnd;
        }

        return created;
      });

      return res.json({
        message: `Generated ${slots.length} slots`,
        slots,
      });
    } catch (error) {
      console.error("GENERATE SLOTS ERROR:", error);
      return res.status(500).json({ message: "Failed to generate slots" });
    }
  }
);
// Create single slot

app.post("/slots", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  try {

  const {
  startTime,
  endTime,
  slotType,
  sportId,

} = req.body;

  const parsedSportId = Number(sportId);
  const parsedStart = new Date(startTime);
  const parsedEnd = new Date(endTime);

  if (
    !Number.isInteger(parsedSportId) ||
    Number.isNaN(parsedStart.getTime()) ||
    Number.isNaN(parsedEnd.getTime()) ||
    parsedStart >= parsedEnd
  ) {
    return res.status(400).json({ message: "Invalid slot data" });
  }

  const sport = await prisma.sport.findUnique({
    where: { id: parsedSportId },
  });

  if (!sport) {
    return res.status(404).json({ message: "Sport not found" });
  }

  const slot = await prisma.slot.create({
    data: {
      startTime: parsedStart,
      endTime: parsedEnd,
      slotType: slotType || "available",
      sportId: parsedSportId,
      maxCapacity: sport.totalCourts || 1,
      bookedCount: 0,
    },
  });

    res.json(slot);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to create slot",
    });

  }
});
app.get("/slots/:sportId",
  async (req, res) => {

    try {

      const sportId =
        Number(req.params.sportId);

      const slots =
        await prisma.slot.findMany({

          where: {
            sportId,
          },

          include: {
            bookedBy: true,
          },

          orderBy: {
            startTime: "asc",
          },

        });

      res.json(slots);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Failed"
      });

    }

  }
);
app.delete("/slots/:id", authenticate, requireRole("admin"),
  async (req, res) => {

    try {

      const slotId =
        Number(req.params.id);

      await prisma.slot.delete({

        where: {
          id: slotId,
        },

      });

      res.json({
        message: "Deleted"
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Delete Failed"
      });

    }

  }
);
app.put("/slots/toggle/:id", authenticate, requireRole("admin"),
  async (req, res) => {

    try {

      const slotId =
        Number(req.params.id);

      const slot =
        await prisma.slot.findUnique({

          where: {
            id: slotId,
          },

        });

      if (!slot) {

        return res.status(404).json({
          message: "Slot not found"
        });

      }

      const updated =
        await prisma.slot.update({

          where: {
            id: slotId,
          },

          data: {
            isActive:
              !slot.isActive,
          },

        });

      res.json(updated);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Failed"
      });

    }

  }
);
app.delete("/slot/:id", authenticate, requireRole("admin"), async (req: Request, res: Response) => {

  try {

    const id = parseInt(req.params.id as string, 10)

;

    await prisma.slot.delete({
      where: { id },
    });

    res.json({
      message: "Slot deleted",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to delete slot",
    });

  }

});
// Student: Get available slots (next 6 hours)
app.get("/sports/:id/available-slots", async (req: Request, res: Response) => {
  try {
    const sportId = parseInt(req.params.id as string, 10);

    const now = new Date();
    const sixHoursLater = new Date(
  now.getTime() + 6 * 60 * 60000
);
    const slots = await prisma.slot.findMany({
      where: {
        sportId,
        startTime: {
          gte: now,
          lte: sixHoursLater,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });


    const slotsWithBooking = await Promise.all(
      slots.map(async (slot: any) => {
        const activeBookings = await prisma.booking.findMany({
          where: {
            slotId: slot.id,
            status: "active",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                rollNo: true,
              },
            },
          },
          take: slot.maxCapacity || 1,
          orderBy: { bookedAt: "asc" },
        });

        const reservation = await prisma.teamReservation.findFirst({
          where: {
            sportId,
            startDateTime: { lt: slot.endTime },
            endDateTime: { gt: slot.startTime },
          },
        });

        return {
          ...slot,
          bookedCount: activeBookings.length,
          maxCapacity: slot.maxCapacity,
          isBooked: activeBookings.length >= slot.maxCapacity,
          bookedBy: activeBookings[0]?.user,
          isTeamReserved: !!reservation,
          teamName: reservation?.teamName,
        };
      })
    );

    res.json(slotsWithBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get available slots",
    });
  }
});

// ==================== GEARS MANAGEMENT ====================

// Admin: Create gear for a sport
app.post("/gears", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const description = typeof req.body.description === "string"
      ? req.body.description.trim()
      : undefined;
    const sportId = Number(req.body.sportId);
    const totalQuantity = Number(req.body.totalQuantity);

    if (
      !name ||
      !Number.isInteger(sportId) ||
      sportId <= 0 ||
      !Number.isInteger(totalQuantity) ||
      totalQuantity < 0
    ) {
      return res.status(400).json({
        message: "name, sportId and a non-negative integer totalQuantity are required",
      });
    }

    const sport = await prisma.sport.findUnique({ where: { id: sportId } });
    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    const gear = await prisma.gear.create({
      data: {
        name,
        description,
        sportId,
        totalQuantity,
        availableQuantity: totalQuantity,
        damagedQuantity: 0,
      },
    });

    res.json(gear);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create gear" });
  }
});

// Admin: Update gear
app.put("/gears/:id", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { name, description } = req.body;
    const totalQuantity = Number(req.body.totalQuantity);
    const damagedQuantity = Number(req.body.damagedQuantity ?? 0);

    if (
      !Number.isInteger(totalQuantity) ||
      totalQuantity < 0 ||
      !Number.isInteger(damagedQuantity) ||
      damagedQuantity < 0 ||
      damagedQuantity > totalQuantity
    ) {
      return res.status(400).json({
        message: "totalQuantity and damagedQuantity must be valid non-negative integers",
      });
    }

    const availableQuantity = totalQuantity - damagedQuantity;

    const gear = await prisma.gear.update({
      where: { id },
      data: {
        name,
        description,
        totalQuantity,
        damagedQuantity: damagedQuantity || 0,
        availableQuantity,
      },
    });

    res.json(gear);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update gear" });
  }
});

// Admin: Delete gear
app.delete("/gears/:id", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);

    await prisma.gear.delete({ where: { id } });

    res.json({ message: "Gear deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete gear" });
  }
});

// Get sport gears with availability
app.get("/sports/:id/gears", async (req: Request, res: Response) => {
  try {
    const sportId = parseInt(req.params.id as string, 10);

    const gears = await prisma.gear.findMany({
      where: { sportId },
    });

    res.json(gears);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch gears" });
  }
});

// ==================== RESOURCES MANAGEMENT ====================

// Admin: Create resource (courts, tables)

app.post("/sports/:id/resources", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const sportId = Number(req.params.id);

    const { resources } = req.body;

    if (!Array.isArray(resources) || resources.length === 0) {
      return res.status(400).json({
        message: "No resources supplied",
      });
    }

    await prisma.resourceUnit.createMany({
      data: resources.map((resource: any) => ({
        sportId,
        name: resource.name,
        type: resource.type,
        status: "available",
      })),
    });

    const created = await prisma.resourceUnit.findMany({
      where: {
        sportId,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json(created);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to create resources",
    });
  }
});
app.get("/sports/:id/resources", async (req, res) => {
  try {
    const sportId = Number(req.params.id);

    const resources = await prisma.resourceUnit.findMany({
      where: { sportId },
      orderBy: { id: "asc" },
    });

    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

app.patch("/resources/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);

    const resource = await prisma.resourceUnit.update({
      where: { id },
      data: {
        name: req.body.name,
      },
    });

    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Rename failed" });
  }
});

app.delete("/resources/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await prisma.resourceUnit.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      message: "Deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Delete failed",
    });
  }
});

app.patch("/resources/:id/status", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);

    const resource = await prisma.resourceUnit.update({
      where: { id },
      data: {
        status: req.body.status,
        maintenanceMessage: req.body.maintenanceMessage,
      },
    });

    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Update failed",
    });
  }
});
app.put("/resource-units/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      status,
      maintenanceMessage,
    } = req.body;

    const updated =
      await prisma.resourceUnit.update({
        where: { id },

        data: {
          ...(name !== undefined && { name }),
          ...(status !== undefined && { status }),
          ...(maintenanceMessage !== undefined && {
            maintenanceMessage,
          }),
        },
      });

    res.json(updated);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to update resource",
    });
  }
});

app.delete("/resource-units/:id", authenticate, requireRole("admin"), async (req,res)=>{

    try{

        await prisma.resourceUnit.delete({

            where:{
                id:Number(req.params.id)
            }

        });

        res.json({
            success:true
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            message:"Delete failed"
        });

    }

});

// ==================== BOOKINGS ====================

function parsePositiveInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function normalizeGearItems(value: unknown): Array<{ gearId: number; quantity: number }> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item: any) => ({
      gearId: Number(item?.gearId),
      quantity: Number(item?.quantity),
    }))
    .filter(
      (item) =>
        Number.isInteger(item.gearId) &&
        item.gearId > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
}

// Resource selection currently arrives either as a top-level `resourceUnitId`
// or nested in `resourcesBooked: [{ resourceId }]` (the shape the sport detail
// page already sends). Support both without requiring a frontend change.
function extractResourceUnitId(body: any): number | null {
  const direct = parsePositiveInt(body?.resourceUnitId);
  if (direct) return direct;

  if (Array.isArray(body?.resourcesBooked) && body.resourcesBooked.length > 0) {
    return parsePositiveInt(body.resourcesBooked[0]?.resourceId);
  }

  return null;
}

async function reserveGearsOrThrow(
  tx: any,
  gearsBooked: Array<{ gearId: number; quantity: number }>
) {
  for (const item of gearsBooked) {
    const result = await tx.gear.updateMany({
      where: {
        id: item.gearId,
        availableQuantity: { gte: item.quantity },
      },
      data: {
        availableQuantity: { decrement: item.quantity },
      },
    });

    if (result.count !== 1) {
      const gear = await tx.gear.findUnique({ where: { id: item.gearId } });
      throw Object.assign(
        new Error(
          `Gear "${gear?.name ?? item.gearId}" is not available in required quantity`
        ),
        { statusCode: 409 }
      );
    }
  }
}

// Student: Book a slot
app.post(
  "/bookings/slot",
  authenticate,
  requireRole("student"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const sportId = parsePositiveInt(req.body.sportId);
      const slotId = parsePositiveInt(req.body.slotId);
      const gearsBooked = normalizeGearItems(req.body.gearsBooked);
      const resourceUnitId = extractResourceUnitId(req.body);
      const resourcesBooked = Array.isArray(req.body.resourcesBooked)
        ? req.body.resourcesBooked
        : undefined;
      const notes = typeof req.body.notes === "string" ? req.body.notes.trim() : undefined;

      if (!sportId || !slotId) {
        return res.status(400).json({ message: "sportId and slotId are required" });
      }

      const result = await prisma.$transaction(async (tx) => {
        const activeBooking = await tx.booking.findFirst({
          where: { userId, status: "active" },
        });

        if (activeBooking) {
          throw Object.assign(
            new Error("You must cancel or complete your current booking first"),
            { statusCode: 409 }
          );
        }

        const sport = await tx.sport.findUnique({ where: { id: sportId } });
        if (!sport) {
          throw Object.assign(new Error("Sport not found"), { statusCode: 404 });
        }

        if (sport.maintenance) {
          throw Object.assign(new Error("Sport is under maintenance"), { statusCode: 409 });
        }

        const slot = await tx.slot.findUnique({ where: { id: slotId } });
        if (!slot || slot.sportId !== sportId) {
          throw Object.assign(new Error("Slot is not available"), { statusCode: 404 });
        }

        if (!slot.isActive || slot.slotType === "team_reserved") {
          throw Object.assign(new Error("Slot is not available"), { statusCode: 409 });
        }

        // Atomic capacity reservation prevents two simultaneous users taking the last place.
        const capacityUpdate = await tx.slot.updateMany({
          where: {
            id: slotId,
            isActive: true,
            slotType: { not: "team_reserved" },
            bookedCount: { lt: slot.maxCapacity },
          },
          data: {
            bookedCount: { increment: 1 },
          },
        });

        if (capacityUpdate.count !== 1) {
          throw Object.assign(new Error("Slot capacity reached"), { statusCode: 409 });
        }

        if (resourceUnitId) {
          const resource = await tx.resourceUnit.findUnique({
            where: { id: resourceUnitId },
          });

          if (!resource || resource.sportId !== sportId) {
            throw Object.assign(
              new Error("Selected resource is not available for this sport"),
              { statusCode: 400 }
            );
          }

          if (String(resource.status).toLowerCase() !== "available") {
            throw Object.assign(
              new Error(`"${resource.name}" is not available right now`),
              { statusCode: 409 }
            );
          }

          // Prevent double-booking the same resource across overlapping slot times.
          const conflicting = await tx.booking.findFirst({
            where: {
              resourceUnitId,
              status: "active",
              startTime: { lt: slot.endTime },
              endTime: { gt: slot.startTime },
            },
            select: { id: true },
          });

          if (conflicting) {
            throw Object.assign(
              new Error(`"${resource.name}" is already booked for this time`),
              { statusCode: 409 }
            );
          }
        }

        await reserveGearsOrThrow(tx, gearsBooked);

        return tx.booking.create({
          data: {
            userId,
            sportId,
            slotId,
            bookingType: "slot",
            gearsBooked: gearsBooked.length ? gearsBooked : null,
            resourceUnitId: resourceUnitId ?? undefined,
            resourcesBooked: resourcesBooked ?? undefined,
            status: "active",
            startTime: slot.startTime,
            endTime: slot.endTime,
            notes,
          },
        });
      });

      return res.status(201).json({
        message: "Slot booked successfully",
        booking: result,
      });
    } catch (error: any) {
      console.error("BOOK SLOT ERROR:", error);
      const status = Number(error?.statusCode) || 500;
      return res.status(status).json({
        message: status < 500 ? error.message : "Failed to book slot",
      });
    }
  }
);

// Student: Book gears only (non-slot sport)
app.post(
  "/bookings/gear",
  authenticate,
  requireRole("student"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const sportId = parsePositiveInt(req.body.sportId);
      const gearsBooked = normalizeGearItems(req.body.gearsBooked);
      const resourceUnitId = extractResourceUnitId(req.body);
      const resourcesBooked = Array.isArray(req.body.resourcesBooked)
        ? req.body.resourcesBooked
        : undefined;
      const notes = typeof req.body.notes === "string" ? req.body.notes.trim() : undefined;

      if (!sportId || (gearsBooked.length === 0 && !resourceUnitId)) {
        return res.status(400).json({ message: "sportId and at least one gear or resource are required" });
      }

      const booking = await prisma.$transaction(async (tx) => {
        const activeBooking = await tx.booking.findFirst({
          where: { userId, status: "active" },
        });

        if (activeBooking) {
          throw Object.assign(
            new Error("You already have an active booking"),
            { statusCode: 409 }
          );
        }

        const sport = await tx.sport.findUnique({ where: { id: sportId } });
        if (!sport) {
          throw Object.assign(new Error("Sport not found"), { statusCode: 404 });
        }

        if (sport.maintenance) {
          throw Object.assign(new Error("Sport is under maintenance"), { statusCode: 409 });
        }

        if (resourceUnitId) {
          // No slot/time window for these sports, so the resource itself is
          // reserved atomically (same pattern as gear quantity below) rather
          // than checked against a time range.
          const resource = await tx.resourceUnit.findUnique({
            where: { id: resourceUnitId },
          });

          if (!resource || resource.sportId !== sportId) {
            throw Object.assign(
              new Error("Selected resource is not available for this sport"),
              { statusCode: 400 }
            );
          }

          const resourceUpdate = await tx.resourceUnit.updateMany({
            where: { id: resourceUnitId, status: "available" },
            data: { status: "booked" },
          });

          if (resourceUpdate.count !== 1) {
            throw Object.assign(
              new Error(`"${resource.name}" is not available right now`),
              { statusCode: 409 }
            );
          }
        }

        await reserveGearsOrThrow(tx, gearsBooked);

        return tx.booking.create({
          data: {
            userId,
            sportId,
            bookingType: "gear",
            gearsBooked,
            resourceUnitId: resourceUnitId ?? undefined,
            resourcesBooked: resourcesBooked ?? undefined,
            status: "active",
            notes,
          },
        });
      });

      return res.status(201).json({
        message: "Gear booking successful",
        booking,
      });
    } catch (error: any) {
      console.error("BOOK GEAR ERROR:", error);
      const status = Number(error?.statusCode) || 500;
      return res.status(status).json({
        message: status < 500 ? error.message : "Failed to book gear",
      });
    }
  }
);

// Student: Cancel booking
app.post(
  "/bookings/:id/cancel",
  authenticate,
  requireRole("student"),
  async (req: Request, res: Response) => {
    try {
      const bookingId = parsePositiveInt(req.params.id);
      if (!bookingId) {
        return res.status(400).json({ message: "Invalid booking id" });
      }

      const updatedBooking = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({ where: { id: bookingId } });

        if (!booking) {
          throw Object.assign(new Error("Booking not found"), { statusCode: 404 });
        }

        if (booking.userId !== req.user!.id) {
          throw Object.assign(new Error("You can only cancel your own booking"), { statusCode: 403 });
        }

        if (booking.status === "cancelled") {
          throw Object.assign(new Error("Booking already cancelled"), { statusCode: 409 });
        }

        if (booking.status !== "active") {
          throw Object.assign(new Error("Only active bookings can be cancelled"), { statusCode: 409 });
        }

        const updated = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "cancelled",
            cancelledAt: new Date(),
          },
        });

        if (booking.slotId) {
          await tx.slot.updateMany({
            where: { id: booking.slotId, bookedCount: { gt: 0 } },
            data: { bookedCount: { decrement: 1 } },
          });
        }

        if (booking.gearsBooked) {
          for (const item of normalizeGearItems(booking.gearsBooked)) {
            await tx.gear.update({
              where: { id: item.gearId },
              data: { availableQuantity: { increment: item.quantity } },
            });
          }
        }

        // Gear-only bookings flip the resource to "booked" (no time window to
        // check against), so cancelling must flip it back. Slot bookings only
        // ever checked the resource, they never mutated its status, so no
        // release is needed there.
        if (booking.resourceUnitId && !booking.slotId) {
          await tx.resourceUnit.updateMany({
            where: { id: booking.resourceUnitId, status: "booked" },
            data: { status: "available" },
          });
        }

        return updated;
      });

      return res.json({
        message: "Booking cancelled successfully",
        booking: updatedBooking,
      });
    } catch (error: any) {
      console.error("CANCEL BOOKING ERROR:", error);
      const status = Number(error?.statusCode) || 500;
      return res.status(status).json({
        message: status < 500 ? error.message : "Failed to cancel booking",
      });
    }
  }
);

app.put(
  "/return-request/:id",
  authenticate,
  requireRole("student"),
  async (req: Request, res: Response) => {
    try {
      const bookingId = parsePositiveInt(req.params.id);
      if (!bookingId) {
        return res.status(400).json({ message: "Invalid booking id" });
      }

      const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only return your own booking" });
      }

      if (booking.status === "completed") {
        return res.status(409).json({ message: "Booking already returned" });
      }

      if (booking.status === "return_requested") {
        return res.status(409).json({ message: "Return already requested" });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "return_requested",
          returnRequestedAt: new Date(),
        },
      });

      return res.json(updatedBooking);
    } catch (error) {
      console.error("RETURN REQUEST ERROR:", error);
      return res.status(500).json({ message: "Return request failed" });
    }
  }
);

app.put(
  "/approve-return/:id",
  authenticate,
  requireRole("admin", "staff"),
  async (req: Request, res: Response) => {
    try {
      const bookingId = parsePositiveInt(req.params.id);
      if (!bookingId) {
        return res.status(400).json({ message: "Invalid booking id" });
      }

      await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({ where: { id: bookingId } });

        if (!booking) {
          throw Object.assign(new Error("Booking not found"), { statusCode: 404 });
        }

        if (booking.status === "completed") {
          throw Object.assign(new Error("Booking already completed"), { statusCode: 409 });
        }

        if (booking.status !== "return_requested") {
          throw Object.assign(new Error("Return request not found"), { statusCode: 409 });
        }

        if (booking.gearsBooked) {
          for (const item of normalizeGearItems(booking.gearsBooked)) {
            await tx.gear.update({
              where: { id: item.gearId },
              data: { availableQuantity: { increment: item.quantity } },
            });
          }
        }

        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "completed",
            returnedAt: new Date(),
          },
        });
      });

      return res.json({ message: "Return approved" });
    } catch (error: any) {
      console.error("APPROVE RETURN ERROR:", error);
      const status = Number(error?.statusCode) || 500;
      return res.status(status).json({
        message: status < 500 ? error.message : "Approval failed",
      });
    }
  }
);

// Student: Get their bookings
app.get("/users/:userId/bookings", authenticate, requireSelfOrRole("userId", "admin", "staff"), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId as string, 10);

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        sport: true,
        slot: true,
      },
      orderBy: { bookedAt: "desc" },
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// ==================== HISTORY / STAFF VIEW ====================

// Staff/Admin: Get all bookings with student details
app.get("/bookings/history", authenticate, requireRole("admin", "staff"), async (req: Request, res: Response) => {
  try {
    const { sportId, status } = req.query;

    const where: any = {};
    if (sportId) where.sportId = parseInt(sportId as string, 10);
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNo: true,
            phone: true,
          },
        },
        sport: { select: { id: true, name: true } },
        slot: true,
      },
      orderBy: { bookedAt: "desc" },
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch booking history" });
  }
});

// Staff: Get student booking history
app.get("/students/:userId/history", authenticate, requireRole("admin", "staff"), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId as string, 10);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookings: {
          include: {
            sport: { select: { id: true, name: true } },
            slot: true,
          },
          orderBy: { bookedAt: "desc" },
        },
        issuedGears: {
          include: {
            gear: { select: { id: true, name: true } },
          },
          orderBy: { issueDate: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        phone: user.phone,
      },
      bookings: user.bookings,
      issuedGears: user.issuedGears,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch student history" });
  }
});
app.get("/returns/pending", authenticate, requireRole("admin", "staff"), async (req, res) => {

    const bookings =await prisma.booking.findMany({

        where: {
          status:
            "return_requested",
        },

        include: {
          user: true,
          sport: true,
          slot: true,
        },

      });

    res.json(bookings);

  }
);

// ==================== GEAR ISSUANCE ====================

// Staff: Issue gear to student
app.post(
  "/issued-gears",
  authenticate,
  requireRole("admin", "staff"),
  async (req: Request, res: Response) => {
    try {
      const userId = parsePositiveInt(req.body.userId);
      const gearId = parsePositiveInt(req.body.gearId);
      const quantityIssued = Number(req.body.quantityIssued);
      const expectedReturnDate = req.body.expectedReturnDate;
      const issueNotes = typeof req.body.issueNotes === "string"
        ? req.body.issueNotes.trim()
        : undefined;

      if (
        !userId ||
        !gearId ||
        !Number.isInteger(quantityIssued) ||
        quantityIssued <= 0
      ) {
        return res.status(400).json({
          message: "userId, gearId and a positive quantityIssued are required",
        });
      }

      const issuedGear = await prisma.$transaction(async (tx) => {
        const result = await tx.gear.updateMany({
          where: {
            id: gearId,
            availableQuantity: { gte: quantityIssued },
          },
          data: {
            availableQuantity: { decrement: quantityIssued },
          },
        });

        if (result.count !== 1) {
          throw Object.assign(new Error("Insufficient gear quantity"), { statusCode: 409 });
        }

        return tx.issuedGear.create({
          data: {
            userId,
            gearId,
            quantityIssued,
            expectedReturnDate: expectedReturnDate
              ? new Date(expectedReturnDate)
              : undefined,
            issueNotes,
          },
        });
      });

      return res.status(201).json({
        message: "Gear issued successfully",
        issuedGear,
      });
    } catch (error: any) {
      console.error("ISSUE GEAR ERROR:", error);
      const status = Number(error?.statusCode) || 500;
      return res.status(status).json({
        message: status < 500 ? error.message : "Failed to issue gear",
      });
    }
  }
);

// Staff: Mark gear as returned
app.post(
  "/issued-gears/:id/return",
  authenticate,
  requireRole("admin", "staff"),
  async (req: Request, res: Response) => {
    try {
      const id = parsePositiveInt(req.params.id);
      const condition = String(req.body.condition ?? "good").toLowerCase();

      if (!id) {
        return res.status(400).json({ message: "Invalid issued gear id" });
      }

      if (!['good', 'damaged'].includes(condition)) {
        return res.status(400).json({ message: "condition must be good or damaged" });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const issuedGear = await tx.issuedGear.findUnique({ where: { id } });

        if (!issuedGear) {
          throw Object.assign(new Error("Issued gear record not found"), { statusCode: 404 });
        }

        if (String(issuedGear.status).toLowerCase() === "returned") {
          throw Object.assign(new Error("Gear has already been returned"), { statusCode: 409 });
        }

        if (condition === "damaged") {
          await tx.gear.update({
            where: { id: issuedGear.gearId },
            data: {
              damagedQuantity: { increment: issuedGear.quantityIssued },
            },
          });
        } else {
          await tx.gear.update({
            where: { id: issuedGear.gearId },
            data: {
              availableQuantity: { increment: issuedGear.quantityIssued },
            },
          });
        }

        return tx.issuedGear.update({
          where: { id },
          data: {
            returnDate: new Date(),
            status: "returned",
            condition,
          },
        });
      });

      return res.json({
        message: "Gear returned successfully",
        issuedGear: updated,
      });
    } catch (error: any) {
      console.error("RETURN ISSUED GEAR ERROR:", error);
      const status = Number(error?.statusCode) || 500;
      return res.status(status).json({
        message: status < 500 ? error.message : "Failed to return gear",
      });
    }
  }
);

// Get all issued gears
app.get(
  "/issued-gears",
  authenticate,
  requireRole("admin", "staff"),
  async (req: Request, res: Response) => {
    try {
      const { status, userId } = req.query;
      const where: any = {};
      if (status) where.status = String(status);
      if (userId) {
        const parsedUserId = Number(userId);
        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
          return res.status(400).json({ message: "Invalid userId" });
        }
        where.userId = parsedUserId;
      }

      const issuedGears = await prisma.issuedGear.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, rollNo: true, email: true } },
          gear: {
            select: {
              id: true,
              name: true,
              sport: { select: { name: true } },
            },
          },
        },
        orderBy: { issueDate: "desc" },
      });

      return res.json(issuedGears);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch issued gears" });
    }
  }
);
app.post(
  "/team-reservations",
  authenticate,
  requireRole("admin", "staff"),
  async (req: Request, res: Response) => {
    try {
      const teamName = String(req.body.teamName ?? "").trim();
      const sportId = parsePositiveInt(req.body.sportId);
      const startDateTime = new Date(req.body.startDateTime);
      const durationMinutes = Number(req.body.durationMinutes);
      const resourceUnitIds: number[] = Array.from(
        new Set(
          Array.isArray(req.body.resourceUnitIds)
            ? req.body.resourceUnitIds
                .map((id: unknown) => Number(id))
                .filter(
                  (id: number) => Number.isInteger(id) && id > 0
                )
            : []
        )
      );

      const purpose = typeof req.body.purpose === "string" ? req.body.purpose.trim() : undefined;
      const reservationMessage = typeof req.body.reservationMessage === "string"
        ? req.body.reservationMessage.trim()
        : undefined;
      const bookedById = req.body.bookedById ? Number(req.body.bookedById) : undefined;

      if (!teamName || !sportId || Number.isNaN(startDateTime.getTime())) {
        return res.status(400).json({ message: "teamName, sportId and startDateTime are required" });
      }

      if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
        return res.status(400).json({ message: "durationMinutes must be a positive integer" });
      }

      if (
        resourceUnitIds.length === 0 ||
        resourceUnitIds.some((id) => !Number.isInteger(id) || id <= 0)
      ) {
        return res.status(400).json({ message: "Select at least one valid resource" });
      }

      const endDateTime = new Date(
        startDateTime.getTime() + durationMinutes * 60_000
      );

      const reservation = await prisma.$transaction(async (tx) => {
        const sport = await tx.sport.findUnique({ where: { id: sportId } });
        if (!sport) {
          throw Object.assign(new Error("Sport not found"), { statusCode: 404 });
        }

        const resources = await tx.resourceUnit.findMany({
          where: {
            id: { in: resourceUnitIds },
            sportId,
          },
          select: { id: true, status: true },
        });

        if (resources.length !== resourceUnitIds.length) {
          throw Object.assign(
            new Error("One or more selected resources do not belong to this sport"),
            { statusCode: 400 }
          );
        }

        if (resources.some((resource: any) => String(resource.status).toLowerCase() !== "available")) {
          throw Object.assign(
            new Error("One or more selected resources are not available"),
            { statusCode: 409 }
          );
        }

        // Prevent overlapping reservations on the same resource.
        const conflicting = await tx.teamReservation.findFirst({
          where: {
            sportId,
            startDateTime: { lt: endDateTime },
            endDateTime: { gt: startDateTime },
            resourcesUnit: {
              some: {
                resourceUnitId: { in: resourceUnitIds },
              },
            },
          },
          select: { id: true },
        });

        if (conflicting) {
          throw Object.assign(
            new Error("One or more selected resources are already reserved for this time"),
            { statusCode: 409 }
          );
        }

        return tx.teamReservation.create({
          data: {
            teamName,
            purpose,
            reservationMessage,
            startDateTime,
            endDateTime,
            durationMinutes,
            sport: { connect: { id: sportId } },
            ...(bookedById && Number.isInteger(bookedById)
              ? { bookedBy: { connect: { id: bookedById } } }
              : {}),
            resourcesUnit: {
              create: resourceUnitIds.map((resourceUnitId: number) => ({
                resourceUnit: { connect: { id: resourceUnitId } },
              })),
            },
          },
          include: {
            sport: true,
            bookedBy: true,
            resourcesUnit: { include: { resourceUnit: true } },
          },
        });
      });

      return res.status(201).json(reservation);
    } catch (error: any) {
      console.error("TEAM RESERVATION ERROR:", error);
      const status = Number(error?.statusCode) || 500;
      return res.status(status).json({
        message: status < 500 ? error.message : "Failed to create reservation",
      });
    }
  }
);
app.get("/team-reservations",
  authenticate, requireRole("admin", "staff"), async (req, res) => {

    try {

      const reservations =
        await prisma.teamReservation.findMany({

          include: {
  sport: true,
  bookedBy: true,
  resourcesUnit: {

    include: {
      resourceUnit: true,
    },

  },
},

          orderBy: {
            startDateTime: "asc",
          },

        });

      res.json(reservations);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Failed to fetch reservations",
      });

    }

  }
);
app.delete("/team-reservations/:id",
  authenticate, requireRole("admin", "staff"), async (req, res) => {

    try {

      const id =
        Number(req.params.id);

      await prisma.teamReservation.delete({

        where: { id },

      });

      res.json({
        message:
          "Reservation deleted",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Delete failed",
      });

    }

  }
);
// ==================== NOTICES ====================

// Admin: Create notice
app.post("/notices", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { title, message, sportId, type } = req.body;

    const notice = await prisma.notice.create({
      data: {
        title,
        message,
        sportId: sportId || null,
        type: type || "general",
      },
    });

    res.json(notice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create notice" });
  }
});

// Get notices
app.get("/notices", async (req: Request, res: Response) => {
  try {
    const { sportId } = req.query;

    const where: any = {};
    if (sportId) where.sportId = parseInt(sportId as string);

    const notices = await prisma.notice.findMany({
      where,
      include: { sport: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(notices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch notices" });
  }
});
app.delete(
  "/notices/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "Invalid notice id",
        });
      }

      await prisma.notice.delete({
        where: { id },
      });

      return res.json({
        message: "Notice deleted",
      });
    } catch (error) {
      console.error("DELETE NOTICE ERROR:", error);

      return res.status(500).json({
        message: "Failed to delete notice",
      });
    }
  }
);
app.get("/bookings/active", authenticate, requireRole("admin", "staff"), async (req, res) => {
  try {
    const bookings =
      await prisma.booking.findMany({
        where: {
          status: "active",
        },

        include: {
          user: true,
          sport: true,
          slot: true,
        },

        orderBy: {
          bookedAt: "desc",
        },
      });

    res.json(bookings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch bookings",
    });
  }
});



// ==================== LIVE BOOKINGS ====================

// Staff: Get currently active/live bookings
app.get("/bookings/live", authenticate, requireRole("admin", "staff"), async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        status: "active",
        OR: [
          // Gear-only bookings do not necessarily have start/end times.
          // They are still considered live while status is active.
          {
            startTime: null,
          },

          // Time-based booking currently in progress
          {
            AND: [
              {
                startTime: {
                  lte: now,
                },
              },
              {
                OR: [
                  {
                    endTime: null,
                  },
                  {
                    endTime: {
                      gte: now,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNo: true,
            phone: true,
            idCardPhoto: true,
          },
        },

        sport: {
          select: {
            id: true,
            name: true,
            hasSlotSystem: true,
            resourceType: true,
          },
        },

        slot: true,

        resourceUnit: true,
      },

      orderBy: {
        bookedAt: "desc",
      },
    });

    const formattedBookings = bookings.map((booking) => {
      const gears: any[] = Array.isArray(booking.gearsBooked)
  ? (booking.gearsBooked as any[])
  : [];

      const resources: any[] = Array.isArray(booking.resourcesBooked)
  ? (booking.resourcesBooked as any[])
  : [];

      return {
        id: booking.id,

        student: {
          id: booking.user.id,
          name: booking.user.name,
          email: booking.user.email,
          rollNo: booking.user.rollNo,
          phone: booking.user.phone,
          idCardPhoto: booking.user.idCardPhoto,
        },

        sport: {
          id: booking.sport.id,
          name: booking.sport.name,
          hasSlotSystem: booking.sport.hasSlotSystem,
          resourceType: booking.sport.resourceType,
        },

        bookingType: booking.bookingType,

        status: booking.status,

        bookedAt: booking.bookedAt,

        startTime: booking.startTime,
        endTime: booking.endTime,

        slot: booking.slot
          ? {
              id: booking.slot.id,
              startTime: booking.slot.startTime,
              endTime: booking.slot.endTime,
              slotType: booking.slot.slotType,
            }
          : null,

        resourceUnit: booking.resourceUnit
          ? {
              id: booking.resourceUnit.id,
              name: booking.resourceUnit.name,
              type: booking.resourceUnit.type,
            }
          : null,

        gearsBooked: gears,

        resourcesBooked: resources,

        notes: booking.notes,
      };
    });

    res.json(formattedBookings);
  } catch (error) {
    console.error("LIVE BOOKINGS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch live bookings",
    });
  }
});



// ==================== SERVER ====================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGTERM", async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
