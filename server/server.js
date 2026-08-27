const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const { calculateAiHarvestAdvice } = require("./services/aiAdvisor");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const dbPath = path.join(__dirname, "smartfarm.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'farmer',
    location TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS farmers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    area REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id INTEGER,
    crop TEXT NOT NULL,
    quantity REAL NOT NULL,
    available REAL NOT NULL,
    harvest_date TEXT NOT NULL,
    area TEXT NOT NULL,
    market TEXT NOT NULL,
    price REAL NOT NULL,
    quality TEXT DEFAULT 'Grade A',
    farming_type TEXT DEFAULT 'Conventional',
    notes TEXT DEFAULT '',
    FOREIGN KEY(farmer_id) REFERENCES farmers(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    quantity REAL NOT NULL,
    delivery_method TEXT NOT NULL,
    delivery_charge REAL DEFAULT 0,
    status TEXT DEFAULT 'PRE_BOOKED',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(listing_id) REFERENCES listings(id)
  );

  CREATE TABLE IF NOT EXISTS waste_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id INTEGER,
    crop TEXT NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    area TEXT NOT NULL,
    use TEXT DEFAULT 'Food processing / pickle',
    status TEXT DEFAULT 'AVAILABLE'
  );
`);

try {
  db.exec("ALTER TABLE waste_listings ADD COLUMN use TEXT DEFAULT 'Food processing / pickle'");
} catch (e) {}

try {
  db.exec("ALTER TABLE listings ADD COLUMN quality TEXT DEFAULT 'Grade A'");
} catch (e) {}

try {
  db.exec("ALTER TABLE listings ADD COLUMN farming_type TEXT DEFAULT 'Conventional'");
} catch (e) {}

try {
  db.exec("ALTER TABLE listings ADD COLUMN notes TEXT DEFAULT ''");
} catch (e) {}

// ---------- AUTO SEED DEFAULT DATA IF EMPTY ----------
const seedDatabase = () => {
  try {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
    if (userCount === 0) {
      const insertUser = db.prepare(`
        INSERT OR IGNORE INTO users (name, email, password, role, location)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertUser.run("Demo Farmer", "farmer@smartfarm.com", "farmer123", "farmer", "Tiruppur");
      insertUser.run("Fresh Consumer", "consumer@smartfarm.com", "consumer123", "consumer", "Tiruppur");
    }

    const farmerCount = db.prepare("SELECT COUNT(*) as count FROM farmers").get().count;
    if (farmerCount === 0) {
      const insertFarmer = db.prepare(`
        INSERT INTO farmers (name, location, area) VALUES (?, ?, ?)
      `);
      const farmerRes = insertFarmer.run("Demo Farmer", "Tiruppur", 5);
      const farmerId = farmerRes.lastInsertRowid;

      const todayStr = new Date().toISOString().split("T")[0];
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

      const insertListing = db.prepare(`
        INSERT INTO listings (farmer_id, crop, quantity, available, harvest_date, area, market, price, quality, farming_type, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertListing.run(farmerId, "Tomato", 1000, 1000, todayStr, "Tiruppur", "Tiruppur Local Market", 32, "Grade A", "Organic", "Freshly picked farm tomatoes");
      insertListing.run(farmerId, "Brinjal", 500, 500, tomorrowStr, "Tiruppur", "Tiruppur Local Market", 34, "Grade B", "Conventional", "Good quality purple brinjal");

      const insertWaste = db.prepare(`
        INSERT INTO waste_listings (farmer_id, crop, quantity, price, area, use, status)
        VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE')
      `);
      insertWaste.run(farmerId, "Brinjal", 30, 8, "Tiruppur", "Food processing / pickle");

      console.log("SmartFarm database seeded with initial demo data.");
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
};

seedDatabase();

// ---------- AUTHENTICATION ----------

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role, location } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  try {
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const assignedRole = role || "farmer";
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, location)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, password, assignedRole, location || "");

    const user = {
      id: result.lastInsertRowid,
      name,
      email,
      role: assignedRole,
      location: location || ""
    };

    if (assignedRole === "farmer") {
      db.prepare(`
        INSERT OR IGNORE INTO farmers (name, location, area) VALUES (?, ?, 5)
      `).run(name, location || "Local");
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- FARMERS ----------

app.get("/api/farmers", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM farmers ORDER BY id DESC").all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/farmers", (req, res) => {
  const { name, location, area } = req.body;

  if (!name || !location) {
    return res.status(400).json({
      error: "Farmer name and location are required"
    });
  }

  try {
    const existing = db.prepare("SELECT * FROM farmers WHERE name = ?").get(name);
    if (existing) {
      db.prepare(`
        UPDATE farmers SET location = ?, area = ? WHERE id = ?
      `).run(location, Number(area) || existing.area, existing.id);

      return res.json({
        success: true,
        id: existing.id,
        updated: true
      });
    }

    const result = db.prepare(`
      INSERT INTO farmers (name, location, area)
      VALUES (?, ?, ?)
    `).run(name, location, Number(area) || 0);

    res.json({
      success: true,
      id: result.lastInsertRowid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- FARMER AVAILABILITY & LISTINGS ----------

app.get("/api/listings", (req, res) => {
  const { area, date, crop, quality } = req.query;

  try {
    let query = `
      SELECT
        listings.*,
        COALESCE(farmers.name, 'Demo Farmer') AS farmer_name,
        COALESCE(farmers.location, listings.area) AS farmer_location
      FROM listings
      LEFT JOIN farmers ON farmers.id = listings.farmer_id
      WHERE listings.available > 0
    `;

    const params = [];

    if (area) {
      query += " AND listings.area = ?";
      params.push(area);
    }

    if (date) {
      query += " AND listings.harvest_date = ?";
      params.push(date);
    }

    if (crop) {
      query += " AND listings.crop = ?";
      params.push(crop);
    }

    if (quality) {
      query += " AND listings.quality = ?";
      params.push(quality);
    }

    query += " ORDER BY listings.harvest_date ASC";

    const rows = db.prepare(query).all(...params);

    const formatted = rows.map((r) => ({
      id: r.id,
      crop: r.crop,
      quantity: r.quantity,
      available: r.available,
      date: r.harvest_date,
      area: r.area,
      market: r.market,
      price: r.price,
      quality: r.quality || "Grade A",
      farmingType: r.farming_type || "Conventional",
      notes: r.notes || "",
      farmer: r.farmer_name,
      farmerId: r.farmer_id
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/listings", (req, res) => {
  const {
    farmerId,
    crop,
    quantity,
    harvestDate,
    date,
    area,
    market,
    price,
    quality,
    farmingType,
    notes
  } = req.body;

  const resolvedDate = harvestDate || date;

  if (
    !crop ||
    !quantity ||
    !resolvedDate ||
    !area ||
    !market
  ) {
    return res.status(400).json({
      error: "Missing listing details"
    });
  }

  const qty = Number(quantity);

  if (qty <= 0) {
    return res.status(400).json({
      error: "Quantity must be greater than zero"
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO listings
      (farmer_id, crop, quantity, available, harvest_date, area, market, price, quality, farming_type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      farmerId || 1,
      crop,
      qty,
      qty,
      resolvedDate,
      area,
      market,
      Number(price) || 0,
      quality || "Grade A",
      farmingType || "Conventional",
      notes || ""
    );

    res.json({
      success: true,
      id: result.lastInsertRowid,
      listing: {
        id: result.lastInsertRowid,
        farmerId: farmerId || 1,
        crop,
        quantity: qty,
        available: qty,
        date: resolvedDate,
        area,
        market,
        price: Number(price) || 0,
        quality: quality || "Grade A",
        farmingType: farmingType || "Conventional",
        notes: notes || ""
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/listings/:id", (req, res) => {
  const { id } = req.params;
  try {
    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM orders WHERE listing_id = ?").run(id);
      const result = db.prepare("DELETE FROM listings WHERE id = ?").run(id);
      return result.changes;
    });
    const changes = transaction();
    if (changes === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json({ success: true, deletedId: Number(id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------- HARVEST DECISION --------

app.post("/api/harvest-decision", (req, res) => {
  const {
    crop,
    quantity,
    daysToHarvest,
    expectedSpoilage
  } = req.body;

  if (!crop || !quantity || !daysToHarvest) {
    return res.status(400).json({
      error: "Crop, quantity and daysToHarvest are required"
    });
  }

  const spoilage =
    expectedSpoilage !== undefined
      ? Number(expectedSpoilage)
      : Math.min(Number(daysToHarvest) * 2, 30);

  const usableQuantity =
    Number(quantity) * (1 - spoilage / 100);

  let recommendation = "";

  if (spoilage >= 20) {
    recommendation = "Harvest Now";
  } else if (spoilage >= 10) {
    recommendation = "Harvest Soon";
  } else {
    recommendation = "Wait";
  }

  res.json({
    success: true,
    crop,
    quantity: Number(quantity),
    daysToHarvest: Number(daysToHarvest),
    expectedSpoilage: spoilage,
    usableQuantity: Math.round(usableQuantity),
    recommendation
  });
});

// -------- AI HARVEST ADVISOR --------

app.post("/api/ai/harvest-advisor", (req, res) => {
  try {
    const {
      crop,
      quantity,
      waitingDays,
      language,
      costSettings,
      markets
    } = req.body;

    const advice = calculateAiHarvestAdvice({
      crop: crop || "Tomato",
      quantity: Number(quantity) || 1000,
      waitingDays: Number(waitingDays) || 3,
      language: language || "English",
      costSettings: costSettings || {},
      markets: Array.isArray(markets) ? markets : []
    });

    res.json({
      success: true,
      ...advice
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Failed to calculate AI harvest advice"
    });
  }
});

// ---------- PRE-BOOK & ORDERS ----------

app.post("/api/orders", (req, res) => {
  const {
    listingId,
    customerName,
    quantity,
    deliveryMethod,
    deliveryCharge: customDeliveryCharge
  } = req.body;

  if (
    !listingId ||
    !quantity ||
    !deliveryMethod
  ) {
    return res.status(400).json({
      error: "Complete order details are required"
    });
  }

  const qty = Number(quantity);

  if (qty <= 0) {
    return res.status(400).json({
      error: "Invalid quantity"
    });
  }

  try {
    const listing = db.prepare(`
      SELECT * FROM listings
      WHERE id = ?
    `).get(listingId);

    if (!listing) {
      return res.status(404).json({
        error: "Listing not found"
      });
    }

    if (listing.available <= 0) {
      return res.status(400).json({
        error: "This produce is already fully booked"
      });
    }

    if (qty > listing.available) {
      return res.status(400).json({
        error: `Only ${listing.available} kg is available`
      });
    }

    const deliveryCharge = customDeliveryCharge !== undefined
      ? Number(customDeliveryCharge)
      : (deliveryMethod.toUpperCase() === "DELIVERY" ? 80 : 0);

    const custName = customerName || "Customer";

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE listings
        SET available = available - ?
        WHERE id = ?
      `).run(qty, listingId);

      const result = db.prepare(`
        INSERT INTO orders
        (listing_id, customer_name, quantity, delivery_method, delivery_charge)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        listingId,
        custName,
        qty,
        deliveryMethod,
        deliveryCharge
      );

      return result.lastInsertRowid;
    });

    const orderId = transaction();

    const updatedListing = db.prepare(`
      SELECT * FROM listings WHERE id = ?
    `).get(listingId);

    const productTotal = qty * listing.price;
    const total = productTotal + deliveryCharge;

    res.json({
      success: true,
      order: {
        id: orderId,
        listingId,
        crop: listing.crop,
        quantity: qty,
        farmer: "Demo Farmer",
        area: listing.area,
        date: listing.harvest_date,
        market: listing.market,
        productTotal,
        deliveryMethod,
        deliveryCharge,
        total,
        status: "Pre-booked"
      },
      remainingQuantity: updatedListing.available
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/orders", (req, res) => {
  const { customer } = req.query;

  try {
    let query = `
      SELECT
        orders.*,
        listings.crop,
        listings.harvest_date,
        listings.area,
        listings.market,
        listings.price,
        COALESCE(farmers.name, 'Demo Farmer') AS farmer_name
      FROM orders
      JOIN listings ON listings.id = orders.listing_id
      LEFT JOIN farmers ON farmers.id = listings.farmer_id
    `;

    const params = [];

    if (customer) {
      query += " WHERE orders.customer_name = ?";
      params.push(customer);
    }

    query += " ORDER BY orders.id DESC";

    const rows = db.prepare(query).all(...params);

    const formatted = rows.map((r) => {
      const productTotal = r.quantity * (r.price || 0);
      const deliveryCharge = r.delivery_charge || 0;
      return {
        id: r.id,
        listingId: r.listing_id,
        crop: r.crop,
        quantity: r.quantity,
        farmer: r.farmer_name,
        area: r.area,
        date: r.harvest_date,
        market: r.market,
        productTotal,
        deliveryMethod: r.delivery_method,
        deliveryCharge,
        total: productTotal + deliveryCharge,
        status: r.status === "PRE_BOOKED" ? "Pre-booked" : r.status,
        createdAt: r.created_at
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- WASTE / EXCESS PRODUCE ----------

app.post("/api/waste", (req, res) => {
  const {
    farmerId,
    crop,
    quantity,
    price,
    area,
    use
  } = req.body;

  if (!crop || !quantity || !price) {
    return res.status(400).json({
      error: "Complete waste listing details are required"
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO waste_listings
      (farmer_id, crop, quantity, price, area, use)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      farmerId || 1,
      crop,
      Number(quantity),
      Number(price),
      area || "Local Area",
      use || "Food processing / pickle"
    );

    res.json({
      success: true,
      id: result.lastInsertRowid,
      item: {
        id: result.lastInsertRowid,
        crop,
        quantity: Number(quantity),
        price: Number(price),
        area: area || "Local Area",
        use: use || "Food processing / pickle"
      },
      potentialRevenue: Number(quantity) * Number(price)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/waste", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        waste_listings.*,
        COALESCE(farmers.name, 'Demo Farmer') AS farmer_name
      FROM waste_listings
      LEFT JOIN farmers ON farmers.id = waste_listings.farmer_id
      WHERE waste_listings.status = 'AVAILABLE'
      ORDER BY waste_listings.id DESC
    `).all();

    const formatted = rows.map((r) => ({
      id: r.id,
      crop: r.crop,
      quantity: r.quantity,
      price: r.price,
      area: r.area,
      use: r.use || "Food processing / pickle",
      farmer: r.farmer_name
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/waste/:id", (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare("DELETE FROM waste_listings WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Waste listing not found" });
    }
    res.json({ success: true, deletedId: Number(id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- HEALTH CHECK ----------

app.get("/api/health", (req, res) => {
  res.json({
    status: "SmartFarm backend running",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SmartFarm backend running on port ${PORT} (0.0.0.0)`);
});