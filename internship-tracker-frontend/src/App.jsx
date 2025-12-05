import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_URL = "http://localhost:4000";

const STATUS_ORDER = [
  "Interested",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

const STATUS_COLORS = {
  Interested: "#e0f2fe",   // light blue
  Applied: "#fef9c3",      // yellow
  Interviewing: "#ede9fe", // purple
  Offer: "#dcfce7",        // green
  Rejected: "#fee2e2",     // red
};

function getStatusStyle(status) {
  switch (status) {
    case "Interested":
      return { background: "#e0f2fe", color: "#0369a1" };
    case "Applied":
      return { background: "#fef9c3", color: "#854d0e" };
    case "Interviewing":
      return { background: "#ede9fe", color: "#5b21b6" };
    case "Offer":
      return { background: "#dcfce7", color: "#166534" };
    case "Rejected":
      return { background: "#fee2e2", color: "#991b1b" };
    default:
      return { background: "#e5e7eb", color: "#374151" };
  }
}

function App() {
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "Interested",
    notes: "",
  });

  const [editing, setEditing] = useState(null);

  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"

  // Fetch applications
  const fetchApps = async () => {
    try {
      const res = await fetch(`${API_URL}/api/applications`);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // Create form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setForm({
        company: "",
        role: "",
        status: "Interested",
        notes: "",
      });

      fetchApps();
    } catch (err) {
      console.error("Error adding application:", err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/applications/${id}`, {
        method: "DELETE",
      });

      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      console.error("Error deleting application:", err);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!editing) return;

    try {
      const res = await fetch(`${API_URL}/api/applications/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      const updated = await res.json();

      setApplications((prev) =>
        prev.map((app) => (app.id === updated.id ? updated : app))
      );

      setEditing(null);
    } catch (err) {
      console.error("Error updating application:", err);
    }
  };

  // Filter + sort
  const filtered = applications.filter((app) =>
    filterStatus === "All" ? true : app.status === filterStatus
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.id - a.id;
    }
    return a.id - b.id;
  });

  // 🔢 Chart data: counts per status (from ALL applications)
  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    value: applications.filter((app) => app.status === status).length,
  })).filter((d) => d.value > 0); // hide zero-status entries

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        color: "#fff",
      }}
    >
      <h1>Internship Application Tracker</h1>
      <p style={{ color: "#ccc" }}>
        Track companies, roles, statuses, and notes for all your apps.
      </p>

      {/* CREATE FORM */}
      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: 24, display: "grid", gap: 8 }}
      >
        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
          required
        />
        <input
          name="role"
          placeholder="Role"
          value={form.role}
          onChange={handleChange}
          required
        />
        <select name="status" value={form.status} onChange={handleChange}>
          <option>Interested</option>
          <option>Applied</option>
          <option>Interviewing</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
        />
        <button type="submit">Add Application</button>
      </form>

      {/* EDIT FORM */}
      {editing && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 8,
            background: "#222",
            border: "1px solid #444",
          }}
        >
          <h2>Edit Application</h2>
          <input
            value={editing.company}
            onChange={(e) =>
              setEditing({ ...editing, company: e.target.value })
            }
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          />
          <input
            value={editing.role}
            onChange={(e) => setEditing({ ...editing, role: e.target.value })}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          />
          <select
            value={editing.status}
            onChange={(e) =>
              setEditing({ ...editing, status: e.target.value })
            }
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            <option>Interested</option>
            <option>Applied</option>
            <option>Interviewing</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
          <textarea
            value={editing.notes}
            onChange={(e) =>
              setEditing({ ...editing, notes: e.target.value })
            }
            rows={3}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={handleUpdate}>
              Save
            </button>
            <button type="button" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FILTER + SORT CONTROLS */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div>
          <label style={{ fontSize: 14, marginRight: 4 }}>Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Interested">Interested</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 14, marginRight: 4 }}>Sort:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {/* 📊 DASHBOARD CHARTS */}
      {statusCounts.length > 0 && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 12,
            background: "#111827",
            border: "1px solid #1f2937",
          }}
        >
          <h2 style={{ marginBottom: 12 }}>Application Analytics</h2>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            }}
          >
            {/* Bar chart */}
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {statusCounts.map((entry, index) => (
                      <Cell
                        key={`cell-bar-${index}`}
                        fill={STATUS_COLORS[entry.status] || "#e5e7eb"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell
                        key={`cell-pie-${index}`}
                        fill={STATUS_COLORS[entry.status] || "#e5e7eb"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* LIST OF APPLICATIONS */}
      <h2>Applications</h2>
      {sorted.length === 0 ? (
        <p style={{ color: "#ccc" }}>
          No applications match this filter. Try changing the filters or add a
          new one above.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "grid",
            gap: 12,
          }}
        >
          {sorted.map((app) => (
            <li
              key={app.id}
              style={{
                borderRadius: 12,
                padding: 16,
                background: "#fafafa",
                color: "#111",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div>
                  <strong>{app.company}</strong> — {app.role}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      ...getStatusStyle(app.status),
                    }}
                  >
                    {app.status}
                  </span>

                  <button type="button" onClick={() => setEditing(app)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(app.id)}>
                    Delete
                  </button>
                </div>
              </div>

              {app.notes && (
                <small style={{ color: "#333" }}>Notes: {app.notes}</small>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
