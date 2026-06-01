import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import path from "path";
import { upload } from "./middleware/upload";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==================== AUTHENTICATION ====================

// User signup
app.post("/auth/signup", upload.single("idCard"),async (req: Request, res: Response) => {
  try {
    const { name, email, password, rollNo, role } = req.body;
    const file = req.file;
    console.log(file);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        rollNo: rollNo || null,
        role: role || "student",
      },
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
});

// User login
app.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNo: user.rollNo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

// ==================== SPORTS MANAGEMENT ====================

// Get all sports
app.get("/sports", async (req: Request, res: Response) => {
  try {

    const sports = await prisma.sport.findMany({
      include: {
        gears: true,
        resources: true,

        slots: true,
      },
    });

    res.json(sports);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch sports",
    });

  }
});
// Get single sport details
app.get("/sports/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const sport = await prisma.sport.findUnique({
      where: { id: parseInt(req.params.id as string, 10) },
      include: {
        gears: true,
        resources: true,
        slots: {
         orderBy: { startTime: "asc" },
        },
      },
    });

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    res.json(sport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch sport" });
  }
});

// Admin: Create sport
app.post("/sports", async (req: Request, res: Response) => {
  try {
    const { name, hasSlotSystem, slotDurationMinutes, totalCourts, availableCourts } = req.body;
    if (availableCourts > totalCourts) {
  return res.status(400).json({
    message:
      "Available Courts cannot exceed Total Courts",
  });
}
    const sport = await prisma.sport.create({
      data: {
        name,
        hasSlotSystem: hasSlotSystem || false,
        slotDurationMinutes: slotDurationMinutes || 30,
        totalCourts: totalCourts || 1,
        availableCourts: availableCourts || 1,
      },
    });

    res.json(sport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create sport" });
  }
});

// Admin: Update sport configuration
app.put("/sports/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { name, hasSlotSystem, slotDurationMinutes, totalCourts, availableCourts, maintenance, maintenanceMessage } = req.body;
    if (availableCourts > totalCourts) {
  return res.status(400).json({
    message:
      "Available Courts cannot exceed Total Courts",
  });
}
    const sport = await prisma.sport.update({
      where: { id },
      data: {
        name,
        hasSlotSystem,
        slotDurationMinutes,
        totalCourts,
        availableCourts: totalCourts,
        maintenance,
        maintenanceMessage,
      },
    });

    res.json(sport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update sport" });
  }
});

// Admin: Delete sport
app.delete("/sports/:id", async (req: Request, res: Response) => {
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
app.post("/slots/generate", async (req: Request, res: Response) => {
  try {
    const { sportId, startDate, endDate, teamReservedTimes } = req.body;

    const sport = await prisma.sport.findUnique({ where: { id: sportId } });

    if (!sport || !sport.hasSlotSystem) {
      return res.status(400).json({ message: "Sport doesn't have slot system enabled" });
    }

    const slots = [];
    const slotDuration = sport.slotDurationMinutes;
    let currentTime = new Date(startDate);
    const end = new Date(endDate);

    // Clear existing slots
    await prisma.slot.deleteMany({ where: { sportId } });

    while (currentTime < end) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

      // Check if this time is team reserved
      const isTeamReserved = teamReservedTimes?.some(
        (tr: any) =>
          new Date(tr.start) <= slotStart &&
          slotEnd <= new Date(tr.end)
      );

      const slot = await prisma.slot.create({
        data: {
          sportId,
          startTime: slotStart,
          endTime: slotEnd,
          slotType: isTeamReserved ? "team_reserved" : "available",
        },
      });

      slots.push(slot);
      currentTime = slotEnd;
    }

    res.json({ message: `Generated ${slots.length} slots`, slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate slots" });
  }
});
// Create single slot

app.post("/slots", async (req: Request, res: Response) => {
  try {

    const {
  startTime,
  endTime,
  slotType,
  sportId,
  capacity,
} = req.body;

    const slot = await prisma.slot.create({
      data: {
  startTime: new Date(startTime),
  endTime: new Date(endTime),
  slotType,
  sportId,

  capacity: Number(capacity),

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
app.delete("/slot/:id", async (req: Request, res: Response) => {

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
    const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60000);

    const slots = await prisma.slot.findMany({
      where: {
        sportId,
        startTime: { gte: now },
        endTime: { lte: sixHoursLater },
      },
      orderBy: { startTime: "asc" },
    });

    // Include booking info
    const slotsWithBooking = await Promise.all(
      slots.map(async (slot: any) => {
        const booking = await prisma.booking.findFirst({
          where: {
            slotId: slot.id,
            status: "active",
          },
          include: { 
            user: { 
              select: { 
                id: true, 
                name: true,
                  rollNo: true
 } } },
        });

        return {
          ...slot,
          isBooked: !!booking,
          bookedBy: booking?.user,
          isTeamReserved: slot.slotType === "team_reserved",
        };
      })
    );

    res.json(slotsWithBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch slots" });
  }
});

// ==================== GEARS MANAGEMENT ====================

// Admin: Create gear for a sport
app.post("/gears", async (req: Request, res: Response) => {
  try {
    const { name, description, sportId, totalQuantity } = req.body;

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
app.put("/gears/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { name, description, totalQuantity, damagedQuantity } = req.body;

    const availableQuantity = totalQuantity - (damagedQuantity || 0);

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
app.delete("/gears/:id", async (req: Request, res: Response) => {
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
app.post("/resources", async (req: Request, res: Response) => {
  try {
    const { name, type, sportId, totalAvailable } = req.body;

    const resource = await prisma.resource.create({
      data: {
        name,
        type,
        sportId,
        totalAvailable,
        currentlyAvailable: totalAvailable,
      },
    });

    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create resource" });
  }
});

// Get sport resources
app.get("/sports/:id/resources", async (req: Request, res: Response) => {
  try {
    const sportId = parseInt(req.params.id as string, 10);

    const resources = await prisma.resource.findMany({
      where: { sportId },
    });

    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

// ==================== BOOKINGS ====================

// Student: Book a slot
app.post("/bookings/slot", async (req: Request, res: Response) => {
  try {
    const { userId, sportId, slotId, gearsBooked, notes } = req.body;

    // Check if user has active booking
    const activeBooking = await prisma.booking.findFirst({
      where: {
        userId,
        status: "active",
      },
    });

    if (activeBooking) {
      return res.status(400).json({
        message: "You must cancel or complete your current booking first",
      });
    }

    // Check slot availability
    const slot = await prisma.slot.findUnique({ where: { id: slotId } });

    if (!slot || slot.slotType === "team_reserved") {
      return res.status(400).json({ message: "Slot is not available" });
    }

    const activeBookings =
  await prisma.booking.count({
    where: {
      slotId,
      status: "active",
    },
  });

if (
  activeBookings >=
  slot.maxCapacity
) {
  return res.status(400).json({
    message: "Slot capacity reached",
  });
}

    // Update gear quantities if gears are booked
    if (gearsBooked) {
      for (const item of gearsBooked) {
        const gear = await prisma.gear.findUnique({
          where: { id: item.gearId },
        });

        if (!gear || gear.availableQuantity < item.quantity) {
          return res.status(400).json({
            message: `Gear "${gear?.name}" is not available in required quantity`,
          });
        }

        await prisma.gear.update({
          where: { id: item.gearId },
          data: {
            availableQuantity: gear.availableQuantity - item.quantity,
          },
        });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        sportId,
        slotId,
        bookingType: "slot",
        gearsBooked: gearsBooked || null,
        status: "active",
        startTime: slot.startTime,
        endTime: slot.endTime,
        notes,
      },
    });
     await prisma.slot.update({
      where: { id: slotId },
      data: {
        bookedCount: {
          increment: 1,
        },
      },
    });
    res.json({
      message: "Slot booked successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to book slot" });
  }
});

// Student: Book gears only (non-slot sport)
app.post("/bookings/gear", async (req: Request, res: Response) => {
  try {
    const { userId, sportId, gearsBooked, notes } = req.body;

    // Check if user has active booking for this sport
    const activeBooking = await prisma.booking.findFirst({
      where: {
        userId,
        status: "active",
      },
    });

    if (activeBooking) {
      return res.status(400).json({
        message: "You already have an active booking for this sport",
      });
    }

    // Update gear quantities
    if (gearsBooked) {
      for (const item of gearsBooked) {
        const gear = await prisma.gear.findUnique({
          where: { id: item.gearId },
        });

        if (!gear || gear.availableQuantity < item.quantity) {
          return res.status(400).json({
            message: `Gear "${gear?.name}" is not available in required quantity`,
          });
        }

        await prisma.gear.update({
          where: { id: item.gearId },
          data: {
            availableQuantity: gear.availableQuantity - item.quantity,
          },
        });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        sportId,
        bookingType: "gear",
        gearsBooked: gearsBooked || null,
        status: "active",
        notes,
      },
    });

    res.json({
      message: "Gear booking successful",
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to book gear" });
  }
});

// Student: Cancel booking
app.post("/bookings/:id/cancel", async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id as string, 10);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    // Return gears to available pool
    if (booking.gearsBooked) {
      for (const item of booking.gearsBooked as any[]) {
        const gear = await prisma.gear.findUnique({
          where: { id: item.gearId },
        });

        if (gear) {
          await prisma.gear.update({
            where: { id: item.gearId },
            data: {
              availableQuantity: gear.availableQuantity + item.quantity,
            },
          });
        }
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });
      await prisma.slot.update({
      where: { id: booking.slotId },
      data: {
        bookedCount: {
          decrement: 1,
        },
      },
    });
    res.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});
app.get(
  "/bookings/history",
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const bookings =
        await prisma.booking.findMany({

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
        message:
          "Failed to fetch history",
      });

    }
  }
);
// Student: Get their bookings
app.get("/users/:userId/bookings", async (req: Request, res: Response) => {
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
app.get("/bookings/history", async (req: Request, res: Response) => {
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
app.get("/students/:userId/history", async (req: Request, res: Response) => {
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

// ==================== GEAR ISSUANCE ====================

// Staff: Issue gear to student
app.post("/issued-gears", async (req: Request, res: Response) => {
  try {
    const { userId, gearId, quantityIssued, expectedReturnDate, issueNotes } = req.body;

    const gear = await prisma.gear.findUnique({ where: { id: gearId } });

    if (!gear || gear.availableQuantity < quantityIssued) {
      return res.status(400).json({ message: "Insufficient gear quantity" });
    }

    await prisma.gear.update({
      where: { id: gearId },
      data: {
        availableQuantity: gear.availableQuantity - quantityIssued,
      },
    });

    const issuedGear = await prisma.issuedGear.create({
      data: {
        userId,
        gearId,
        quantityIssued,
        expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
        issueNotes,
      },
    });

    res.json({
      message: "Gear issued successfully",
      issuedGear,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to issue gear" });
  }
});

// Staff: Mark gear as returned
app.post("/issued-gears/:id/return", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { condition } = req.body;

    const issuedGear = await prisma.issuedGear.findUnique({ where: { id } });

    if (!issuedGear) {
      return res.status(404).json({ message: "Issued gear record not found" });
    }

    // Return gears to inventory
    const gear = await prisma.gear.findUnique({ where: { id: issuedGear.gearId } });

    if (gear) {
      let availableToAdd = issuedGear.quantityIssued;

      if (condition === "damaged") {
        availableToAdd = 0;

        await prisma.gear.update({
          where: { id: gear.id },
          data: {
            damagedQuantity: gear.damagedQuantity + issuedGear.quantityIssued,
          },
        });
      } else {
        await prisma.gear.update({
          where: { id: gear.id },
          data: {
            availableQuantity: gear.availableQuantity + availableToAdd,
          },
        });
      }
    }

    const updated = await prisma.issuedGear.update({
      where: { id },
      data: {
        returnDate: new Date(),
        status: "returned",
        condition,
      },
    });

    res.json({
      message: "Gear returned successfully",
      issuedGear: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to return gear" });
  }
});

// Get all issued gears
app.get("/issued-gears", async (req: Request, res: Response) => {
  try {
    const { status, userId } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = parseInt(userId as string);

    const issuedGears = await prisma.issuedGear.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, rollNo: true, email: true } },
        gear: { select: { id: true, name: true, sport: { select: { name: true } } } },
      },
      orderBy: { issueDate: "desc" },
    });

    res.json(issuedGears);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch issued gears" });
  }
});

// ==================== NOTICES ====================

// Admin: Create notice
app.post("/notices", async (req: Request, res: Response) => {
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
app.get("/bookings/active", async (req, res) => {
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
// ==================== SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;


// import express from "express";
// import cors from "cors";
// import path from "path";

// import authRoutes from "./routes/authRoutes";
// import sportRoutes from "./routes/sportRoutes";
// import slotRoutes from "./routes/slotRoutes";
// import gearRoutes from "./routes/gearRoutes";
// import bookingRoutes from "./routes/bookingRoutes";

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// app.use("/auth", authRoutes);
// app.use("/sports", sportRoutes);
// app.use("/slots", slotRoutes);
// app.use("/gears", gearRoutes);
// app.use("/bookings", bookingRoutes);

// app.get("/", (req, res) => {
//   res.send("Sports Management Backend Running");
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });