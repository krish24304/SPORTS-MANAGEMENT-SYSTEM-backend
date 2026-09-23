import fs from "fs";
import path from "path";

export interface AdminData {
  announcements: any[];
  returnRequests: any[];
  anonymousRequests: any[];
}

const dataDirectory = path.join(__dirname, "../data");

const dataFile = path.join(
  dataDirectory,
  "admin-data.json"
);

const defaultAdminData: AdminData = {
  announcements: [
    {
      id: Date.now(),
      title: "🏀 Basketball Tournament",
      message: "Basketball Tournament starts tomorrow at 9:00 AM.",
      audience: "Everyone",
      createdAt: "Just now",
    },
  ],

  returnRequests: [
    {
      id: 1,
      student: "Ali Ahmed",
      borrowed: "Football",
      quantity: 2,
      borrowDate: "31 Jul 2026",
      borrowTime: "10:15 AM",
      duration: "1 Hour",
      status: "Pending",
      verified: true,
      requestDate: "Today",
      idCard: "/uploads/id-card-demo.jpg",
      requestTime: "10:15 AM",
    },
  ],

  anonymousRequests: [
    {
      id: 1,
      message:
        "Can we extend badminton court timings during weekends?",
      date: "Today",
      time: "10:25 AM",
      viewed: false,
    },
  ],
};

export function loadAdminData(): AdminData {
  try {
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, {
        recursive: true,
      });
    }

    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(
        dataFile,
        JSON.stringify(defaultAdminData, null, 2),
        "utf8"
      );

      return defaultAdminData;
    }

    const raw = fs.readFileSync(
      dataFile,
      "utf8"
    );

    const parsed = JSON.parse(raw);

    return {
      announcements: Array.isArray(parsed.announcements)
        ? parsed.announcements
        : [],

      returnRequests: Array.isArray(parsed.returnRequests)
        ? parsed.returnRequests
        : [],

      anonymousRequests: Array.isArray(parsed.anonymousRequests)
        ? parsed.anonymousRequests
        : [],
    };
  } catch (error) {
    console.error(
      "FAILED TO LOAD ADMIN DATA:",
      error
    );

    return defaultAdminData;
  }
}

export function saveAdminData(data: AdminData): void {
  try {
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, {
        recursive: true,
      });
    }

    fs.writeFileSync(
      dataFile,
      JSON.stringify(data, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error(
      "FAILED TO SAVE ADMIN DATA:",
      error
    );
  }
}