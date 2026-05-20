import express from "express";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON bodies with limit for base64 avatars (<1.5MB constraint)
app.use(express.json({ limit: "5mb" }));

// System Configurations
const DB_NAME = "cardnet";
const COLLECTION_NAME = "contacts";
let dbClient: MongoClient | null = null;
let dbConnected = false;
let storageMode: "database" | "memory" = "memory";
let connectionError: string | null = null;

// Mock database storage for demo Fallback
const initialDate = new Date().toISOString();
let memoryContacts: any[] = [
  {
    _id: "60c72b2f9b1d8b2bad18de2a",
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex.rivera@cardnet.io",
    phone: "+1 (555) 234-5678",
    title: "VP of Enterprise Solutions",
    organization: "CARDNET Technologies",
    website: "https://cardnet-demo.cloud",
    address: "100 Pine Street, San Francisco, CA 94111",
    socials: {
      linkedin: "https://linkedin.com/in/alex-rivera-cardnet-demo",
      twitter: "https://twitter.com/alex_rivera_demo",
      github: "https://github.com/alex-rivera-demo"
    },
    avatar: "",
    createdAt: initialDate,
    updatedAt: initialDate
  },
  {
    _id: "60c72b2f9b1d8b2bad18de2b",
    firstName: "Elena",
    lastName: "Rostova",
    email: "elena.rostova@pixelcraft.design",
    phone: "+31 20 624 1111",
    title: "Principal Interaction Designer",
    organization: "PixelCraft Agency",
    website: "https://pixelcraft.design",
    address: "Prinsengracht 437, 1016 HM Amsterdam, Netherlands",
    socials: {
      linkedin: "https://linkedin.com/in/elena-rostova-demo",
      twitter: "https://twitter.com/elena_design_demo",
      github: "https://github.com/elena-pixelcraft"
    },
    avatar: "",
    createdAt: initialDate,
    updatedAt: initialDate
  }
];

// Cached promise for DB connection in Serverless environments
let dbConnectionPromise: Promise<void> | null = null;

// Asynchronous DB connection bootstrap
async function initializeDatabase(force: boolean = false) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    storageMode = "memory";
    dbConnected = false;
    connectionError = "MONGODB_URI environment variable is missing. Running in Memory mode (Demo).";
    console.log(`[Database] Mode: Memory. ${connectionError}`);
    return;
  } else {
    const obscured = uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
    console.log(`[Database] Detected MONGODB_URI of length ${uri.length}. Format prefix: ${obscured.substring(0, 50)}...`);
  }

  if (force) {
    if (dbClient) {
      try {
        await dbClient.close();
      } catch (err) {
        // ignore close error
      }
    }
    dbClient = null;
    dbConnected = false;
    dbConnectionPromise = null;
    connectionError = null;
  }

  if (dbConnected && dbClient) {
    return;
  }

  if (!dbConnectionPromise) {
    dbConnectionPromise = (async () => {
      try {
        console.log("[Database] Attempting to connect to MongoDB...");
        dbClient = new MongoClient(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
          socketTimeoutMS: 5000,
        });
        await dbClient.connect();
        storageMode = "database";
        dbConnected = true;
        connectionError = null;
        console.log("[Database] Connected successfully to MongoDB. Running in Database mode.");
      } catch (err: any) {
        storageMode = "memory";
        dbConnected = false;
        connectionError = `Connection failed: ${err.message || err}. Reverted to Memory mode (Demo).`;
        console.error(`[Database] Error: ${connectionError}`);
        // Do NOT set dbConnectionPromise to null here to prevent connection flood and blocking API routes.
        // It remains resolved. Re-attempts must be triggered via force retry.
      }
    })();
  }
  return dbConnectionPromise;
}

// Start database trigger immediately
initializeDatabase();

// Middleware to ensure DB connection is initialized before handling requests
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    try {
      const force = req.query.retry === "true" || req.query.force === "true";
      await initializeDatabase(force);
    } catch (err: any) {
      console.error("[Middleware] Database initialization error:", err);
      // We do not block the request, let the route handle the consequence (Memory mode or DB error)
    }
  }
  next();
});

// Help maps MongoDB documents to standard frontend IDs
function mapToFrontend(contactDoc: any) {
  if (!contactDoc) return null;
  const doc = { ...contactDoc };
  doc.id = doc._id.toString();
  delete doc._id;
  return doc;
}

// Help create random object-like ids for memory mode
function generateHexId(): string {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

// --- API ROUTES ---

// Config Endpoint
app.get("/api/config", (req, res) => {
  res.json({
    configured: !!process.env.MONGODB_URI,
    mode: storageMode,
    connected: dbConnected,
    dbName: storageMode === "database" ? DB_NAME : "In-Memory Store",
    error: connectionError
  });
});

// GET all contacts
app.get("/api/contacts", async (req, res) => {
  try {
    if (storageMode === "database" && dbConnected && dbClient) {
      const db = dbClient.db(DB_NAME);
      const contacts = await db.collection(COLLECTION_NAME).find({}).toArray();
      return res.json(contacts.map(mapToFrontend));
    } else {
      // In-Memory Mode
      return res.json(memoryContacts.map(mapToFrontend));
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch contacts", details: err.message });
  }
});

// GET single contact by ID with ID validation
app.get("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;
  
  // Validate ID format (must be valid 24 hex characters string representation of ObjectId)
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid contact ID format." });
  }

  try {
    if (storageMode === "database" && dbConnected && dbClient) {
      const db = dbClient.db(DB_NAME);
      const contact = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      return res.json(mapToFrontend(contact));
    } else {
      // In-Memory Mode
      const contact = memoryContacts.find(c => c._id === id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      return res.json(mapToFrontend(contact));
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch contact", details: err.message });
  }
});

// POST create contact
app.post("/api/contacts", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      organization,
      website,
      address,
      socials,
      avatar
    } = req.body;

    // Validate simple required inputs
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First Name and Last Name are required." });
    }

    const timestamp = new Date().toISOString();
    const newDoc = {
      firstName: firstName || "",
      lastName: lastName || "",
      email: email || "",
      phone: phone || "",
      title: title || "",
      organization: organization || "",
      website: website || "",
      address: address || "",
      socials: {
        linkedin: socials?.linkedin || "",
        twitter: socials?.twitter || "",
        github: socials?.github || ""
      },
      avatar: avatar || "",
      createdAt: timestamp,
      updatedAt: timestamp
    };

    if (storageMode === "database" && dbConnected && dbClient) {
      const db = dbClient.db(DB_NAME);
      const result = await db.collection(COLLECTION_NAME).insertOne(newDoc);
      const insertedDoc = { ...newDoc, _id: result.insertedId };
      return res.status(211).json(mapToFrontend(insertedDoc));
    } else {
      // In-Memory Mode
      const insertedId = generateHexId();
      const memoryDoc = { ...newDoc, _id: insertedId };
      memoryContacts.push(memoryDoc);
      return res.status(201).json(mapToFrontend(memoryDoc));
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to create contact", details: err.message });
  }
});

// PUT update contact with ID validation
app.put("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid contact ID format." });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      organization,
      website,
      address,
      socials,
      avatar
    } = req.body;

    const timestamp = new Date().toISOString();
    const updateFields: any = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (email !== undefined) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (title !== undefined) updateFields.title = title;
    if (organization !== undefined) updateFields.organization = organization;
    if (website !== undefined) updateFields.website = website;
    if (address !== undefined) updateFields.address = address;
    if (avatar !== undefined) updateFields.avatar = avatar;
    
    // Partially update socials object
    updateFields.socials = {
      linkedin: socials?.linkedin || "",
      twitter: socials?.twitter || "",
      github: socials?.github || ""
    };
    
    updateFields.updatedAt = timestamp;

    if (storageMode === "database" && dbConnected && dbClient) {
      const db = dbClient.db(DB_NAME);
      const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: "after" }
      );
      
      // MongoDB node driver v6 findOneAndUpdate returns updated doc, or nested doc under value
      const updatedDoc = result && (result.value || result);
      if (!updatedDoc) {
        return res.status(404).json({ error: "Contact not found" });
      }
      return res.json(mapToFrontend(updatedDoc));
    } else {
      // In-Memory Mode
      const index = memoryContacts.findIndex(c => c._id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Contact not found" });
      }
      const existing = memoryContacts[index];
      const updated = {
        ...existing,
        ...updateFields,
        socials: {
          ...existing.socials,
          ...updateFields.socials
        },
        _id: id // preserve ID
      };
      memoryContacts[index] = updated;
      return res.json(mapToFrontend(updated));
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update contact", details: err.message });
  }
});

// DELETE contact with ID validation
app.delete("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid contact ID format." });
  }

  try {
    if (storageMode === "database" && dbConnected && dbClient) {
      const db = dbClient.db(DB_NAME);
      const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Contact not found" });
      }
      return res.json({ success: true, id });
    } else {
      // In-Memory Mode
      const index = memoryContacts.findIndex(c => c._id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Contact not found" });
      }
      memoryContacts.splice(index, 1);
      return res.json({ success: true, id });
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete contact", details: err.message });
  }
});

// --- VITE AND STATIC ASSETS HANDLERS ---

// Only set up dev server if not in production and not running on Vercel
let isViteMounted = false;
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const viteModuleName = "vite";
  import(viteModuleName).then(async ({ createServer }) => {
    try {
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      isViteMounted = true;
      console.log("[Vite] Middleware mounted successfully.");
    } catch (e) {
      console.error("[Vite] Error setting up Vite Dev Server:", e);
    }
  });
} else {
  // In Production or Vercel: serve compiled static production react files
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
}

// Global SPA Router mapping: client routes served via index.html (excluding api endpoints)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  
  // In production / Vercel serve the single page static applet
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return res.sendFile(path.join(process.cwd(), "dist", "index.html"));
  }
  
  // In dev wait a bit or let dev server process it
  return next();
});

// Vercel Serverless Function Deployment Bypass
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CARDNET] Server running on http://localhost:${PORT}`);
  });
}

export default app;
