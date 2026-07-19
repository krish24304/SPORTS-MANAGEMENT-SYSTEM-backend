import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import path from "path";
import { upload } from "./middleware/upload";
import { PrismaClient } from "@prisma/client";
import resourceRoutes
from "./routes/resource.routes";
import resourceUnitRoutes from "./routes/resourceUnitRoutes";
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/resources", resourceRoutes);
app.use("/resource-units", resourceUnitRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==================== AUTHENTICATION ====================

// U
app.post("/auth/signup", upload.single("profilePicture"), async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      rollNo,
    } = req.body;
    console.log("REQ BODY =", req.body);
    console.log("FILE =", req.file);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        rollNo,
        idCardPhoto: req.file
  ? `/uploads/${req.file.filename}`
  : null,      },
    });
    res.json(user);
  } catch (error: any) {
    console.error("SIGNUP ERROR:");
    console.error(error);
    res.status(500).json({
      message: "Signup failed",
      error: error?.message,
    });
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
app.put("/sports-maintenance/:id",
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
// Get single sport details
app.get("/sports/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const sport = await prisma.sport.findUnique({
      where: { id: parseInt(req.params.id as string, 10) },
      include: {
        gears: true,
        resourceUnits: {
          orderBy: {
            id: "asc",
          },
        },
        slots: {
         orderBy: { startTime: "asc" },
        },
      },
    });

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    res.json({
  ...sport,
  resources: sport.resourceUnits,
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch sport" });
  }
});

// Admin: Create sport
app.post("/sports", async (req: Request, res: Response) => {
  try {
    const {
  name,
  resourceType,
  hasSlotSystem,
  slotDurationMinutes,
  totalCourts,
  availableCourts,
} = req.body;
    if (availableCourts > totalCourts) {
  return res.status(400).json({
    message:
      "Available Courts cannot exceed Total Courts",
  });
}
    const sport = await prisma.sport.create({
  data: {
    name,
    resourceType: resourceType || "Court",
    hasSlotSystem: hasSlotSystem || false,
    slotDurationMinutes: slotDurationMinutes || 30,
    totalCourts: totalCourts || 1,
    availableCourts: availableCourts || 1,
  },
});

// Automatically create Resource Units
await prisma.resourceUnit.createMany({
  data: Array.from(
    { length: totalCourts || 1 },
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

// Admin: Update sport configuration
app.put("/sports/:id", async (req, res) => {
  try {

    const id = Number(req.params.id);

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

    //--------------------------------
    // Update sport
    //--------------------------------

    await prisma.sport.update({
      where: { id },
      data: {
        name,
        resourceType,
        hasSlotSystem,
        slotDurationMinutes,
        totalCourts,
        availableCourts,
        maintenance,
        maintenanceMessage,
      },
    });

    //--------------------------------
    // IF TYPE CHANGED
    //--------------------------------

    if (resourceType) {

      await prisma.resourceUnit.deleteMany({
        where: {
          sportId: id,
        },
      });

      await prisma.resourceUnit.createMany({
        data: Array.from(
          { length: totalCourts },
          (_, i) => ({
            sportId: id,
            name: `${resourceType} ${i + 1}`,
            type: resourceType,
            status: "available",
          })
        ),
      });

    }

    //--------------------------------

    const updatedSport =
      await prisma.sport.findUnique({

        where: { id },

        include: {

          resourceUnits: true,

          gears: true,

          slots: true,

          bookings: true,

        },

      });

    res.json({

      ...updatedSport,

      resources: updatedSport?.resourceUnits,

    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      message: "Failed",

    });

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

} = req.body;

  const sport = await prisma.sport.findUnique({
  where: {
    id: Number(sportId),
  },
});
    const slot = await prisma.slot.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        slotType,
        sportId,
        maxCapacity: sport?.totalCourts || 1,
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
app.delete("/slots/:id",
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
app.put("/slots/toggle/:id",
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
                rollNo: true,
              },
            },
          },
        });

        const reservation = await prisma.teamReservation.findFirst({
          where: {
            sportId,
            startTime: {
              lte: slot.startTime,
            },
            endTime: {
              gte: slot.endTime,
            },
          },
        });

        return {
          ...slot,
          isBooked: !!booking,
          bookedBy: booking?.user,
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

app.post("/sports/:id/resources", async (req, res) => {
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

app.patch("/resources/:id", async (req, res) => {
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

app.delete("/resources/:id", async (req, res) => {
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

app.patch("/resources/:id/status", async (req, res) => {
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
app.put("/resource-units/:id", async (req, res) => {
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

app.delete("/resource-units/:id", async (req,res)=>{

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
    const sport =
await prisma.sport.findUnique({

  where: {
    id: sportId,
  },

});

if (sport?.maintenance) {

  return res.status(400).json({

    message:
      "Sport is under maintenance",

  });

}

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
      if (booking.slotId) {
  await prisma.slot.update({
    where: {
      id: booking.slotId,
    },
    data: {
      bookedCount: {
        decrement: 1,
      },
    },
  });
}
    res.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});
app.put("/return-request/:id", async (req, res) => {
  try {

    const bookingId = Number(req.params.id);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Booking already returned"
      });
    }

    if (booking.status === "return_requested") {
      return res.status(400).json({
        message: "Return already requested"
      });
    }

    const updatedBooking =
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "return_requested",
          returnRequestedAt: new Date()
        }
      });

    res.json(updatedBooking);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Return request failed"
    });
  }
});
app.put("/approve-return/:id",
  async (req, res) => {
    try {
      const bookingId = Number(req.params.id);
      const booking = await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
      });

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found",
        });
      }

      if (booking.status === "completed") {
        return res.status(400).json({
          message: "Booking already completed",
        });
      }

      if (booking.status !== "return_requested") {
        return res.status(400).json({
          message: "Return request not found",
        });
      }

      if (booking.returnedAt) {
        return res.status(400).json({
          message: "Booking already returned",
        });
      }
      if (booking.bookingType === "gear" && booking.gearsBooked) {

  for (const item of booking.gearsBooked as any[]) {

    const gear = await prisma.gear.findUnique({
      where: { id: item.gearId }
    });

    if (gear) {

      await prisma.gear.update({
        where: { id: item.gearId },
        data: {
          availableQuantity:
            gear.availableQuantity + item.quantity
        }
      });

    }

  }

}
      await prisma.booking.update({

        where: {
          id: bookingId,
        },

        data: {

          status:
            "completed",

          returnedAt:
            new Date(),

        },

      });

      res.json({

        message:
          "Return Approved",

        });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          "Approval Failed",

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
app.get("/returns/pending",async (req, res) => {

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
app.post("/team-reservations",
  async (req, res) => {
    
    try {
      console.log(req.body);
      const {
  teamName,
  sportId,
  resourceUnitIds,
  startDateTime,
  durationMinutes,
  bookedById,
  purpose,
  reservationMessage,
  
} = req.body;
if (
  !Array.isArray(resourceUnitIds) ||
  resourceUnitIds.length === 0
) {
  return res.status(400).json({
    message:
      "Select at least one resource",
  });
}

      const reservation =
await prisma.teamReservation.create({


  data: {

    teamName,
    purpose,
    sportId,

    startDateTime: new Date(startDateTime),
    durationMinutes,

    bookedById,

    resourcesUnit: {

      create: resourceUnitIds.map(
        (resourceUnitId: number) => ({

          resourceUnitId,

        })
      ),

    },

  },

  include: {

    resourcesUnit: {
      include: {
        resourceUnit: true,
      },
    },

  },

});

res.json(reservation);

    } catch (error: any) {

  console.log(
    "TEAM RESERVATION ERROR:",
    error
  );

  res.status(500).json({
  message: "Failed to create reservation",
  error:
    error instanceof Error
      ? error.message
      : String(error),
});

}

  }
);
app.get("/team-reservations",
  async (req, res) => {

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
  async (req, res) => {

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