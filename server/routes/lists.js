import express from "express";
import multer from "multer";
import papa from "papaparse";
import xlsx from "xlsx";
import auth from "../middleware/auth.js";
import List from "../models/List.js";
import Agent from "../models/Agent.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const parseExcel = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(firstSheet);
};

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let data;
    const fileType = req.file.originalname.split(".").pop().toLowerCase();

    // Parse file based on type
    if (fileType === "csv") {
      const fileBuffer = req.file.buffer.toString();
      const result = papa.parse(fileBuffer, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(), 
      });

      data = result.data;
    } else if (["xlsx", "xls"].includes(fileType)) {
      data = parseExcel(req.file.buffer);
    } else {
      return res
        .status(400)
        .json({
          message: "Invalid file format. Please upload CSV, XLSX, or XLS file",
        });
    }

    // Debugging: Log headers to check if they are correct
    if (data.length > 0) {
      console.log("Parsed Headers:", Object.keys(data[0]));
    } else {
      return res
        .status(400)
        .json({ message: "Uploaded file is empty or unreadable" });
    }

    // Ensure headers match expected format
    const requiredHeaders = ["FirstName", "Phone", "Notes"];
    const parsedHeaders = Object.keys(data[0]);

    const missingHeaders = requiredHeaders.filter(
      (header) => !parsedHeaders.includes(header)
    );
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        message: `Invalid file format. Missing columns: ${missingHeaders.join(
          ", "
        )}`,
      });
    }

    // Validate data structure
    const isValidData = data.every(
      (item) =>
        item["FirstName"]?.trim() && item["Phone"]?.trim() && "Notes" in item
    );

    if (!isValidData) {
      return res.status(400).json({
        message:
          "Invalid file format. File must contain FirstName, Phone, and Notes columns with valid values",
      });
    }

    const agents = await Agent.find();
    if (agents.length === 0) {
      return res.status(400).json({ message: "No agents available" });
    }

    // Distribute items among agents
    const itemsPerAgent = Math.floor(data.length / agents.length);
    const remainder = data.length % agents.length;

    let currentIndex = 0;
    const distributions = [];

    for (let i = 0; i < agents.length; i++) {
      const agentItems = data.slice(
        currentIndex,
        currentIndex + itemsPerAgent + (i < remainder ? 1 : 0)
      );

      if (agentItems.length > 0) {
        const list = new List({
          agentId: agents[i]._id,
          items: agentItems.map((item) => ({
            firstName: item.FirstName.trim(),
            phone: item.Phone.trim(),
            notes: item.Notes ? item.Notes.trim() : "", // Ensure Notes is always a string
          })),
        });
        await list.save();
        distributions.push(list);
      }

      currentIndex += agentItems.length;
    }

    res.json(distributions);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during file upload" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const lists = await List.find().populate("agentId", "name email");
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
