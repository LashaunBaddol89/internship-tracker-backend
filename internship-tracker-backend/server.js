const Database = require("better-sqlite3");
const db = new Database("applications.db");

// Create table if it doesn't exist yet
db.prepare(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT
  )
`).run();
                      

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());



// GET all applications
app.get("/api/applications", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT id, company, role, status, notes FROM applications ORDER BY id DESC")
      .all();
    res.json(rows);
  } catch (err) {
    console.error("DB GET error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// POST create new
app.post("/api/applications", (req, res) => {
  const { company, role, status, notes } = req.body;

  if (!company || !role || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO applications (company, role, status, notes) VALUES (?, ?, ?, ?)"
    );
    const info = stmt.run(company, role, status, notes || "");

    const newApp = {
      id: info.lastInsertRowid,
      company,
      role,
      status,
      notes: notes || "",
    };

    res.status(201).json(newApp);
  } catch (err) {
    console.error("DB INSERT error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// PUT update
app.put("/api/applications/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { company, role, status, notes } = req.body;

  try {
    const existing = db
      .prepare("SELECT id FROM applications WHERE id = ?")
      .get(id);

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    const stmt = db.prepare(
      "UPDATE applications SET company = ?, role = ?, status = ?, notes = ? WHERE id = ?"
    );
    stmt.run(company, role, status, notes || "", id);

    const updated = db
      .prepare("SELECT id, company, role, status, notes FROM applications WHERE id = ?")
      .get(id);

    res.json(updated);
  } catch (err) {
    console.error("DB UPDATE error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE
app.delete("/api/applications/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const stmt = db.prepare("DELETE FROM applications WHERE id = ?");
    const info = stmt.run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DB DELETE error:", err);
    res.status(500).json({ error: "Database error" });
  }
});



app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});


app.delete('/api/applications/:id', (req, res) => {
  const id = parseInt(req.params.id);
  applications = applications.filter(app => app.id !== id);
  res.json({ message: "Deleted successfully" });
});
app.put('/api/applications/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = applications.findIndex(app => app.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  applications[index] = { ...applications[index], ...req.body };

  res.json(applications[index]);
});
