import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  adminService, requestService, inventoryService,
  donorService, donationService, userService
} from "../services/api";

/* ─── Shared Styles ─── */
const S = {
  card: {
    background: "#fff", borderRadius: 16, padding: "22px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0",
  },
  th: {
    padding: "11px 14px", textAlign: "left", fontWeight: 700,
    fontSize: 12, color: "#6b7280", borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb", textTransform: "uppercase", letterSpacing: "0.04em",
  },
  td: { padding: "12px 14px", borderBottom: "1px solid #f3f4f6", fontSize: 13, color: "#374151" },
  badge: (bg, color) => ({
    padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: bg, color,
  }),
  btn: (bg, color, border = "none") => ({
    padding: "6px 14px", borderRadius: 8, border, background: bg,
    color, fontWeight: 700, fontSize: 12, cursor: "pointer",
    transition: "opacity 0.15s",
  }),
  sectionTitle: {
    fontWeight: 800, fontSize: 16, color: "#1f2937",
    marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
  },
};

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const TABS = [
  { key: "overview", label: "Overview", icon: "🌐" },
  { key: "inventory", label: "Inventory", icon: "🩸" },
  { key: "requests", label: "Requests", icon: "📋" },
  { key: "donors", label: "Donors", icon: "👥" },
  { key: "hospitals", label: "Hospitals", icon: "🏥" },
  { key: "analytics", label: "Analytics", icon: "📈" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

const STATUS_COLORS = {
  pending: { bg: "#fef3c7", color: "#d97706" },
  fulfilled: { bg: "#dcfce7", color: "#16a34a" },
  approved: { bg: "#dbeafe", color: "#1d4ed8" },
  rejected: { bg: "#fee2e2", color: "#dc2626" },
  cancelled: { bg: "#f3f4f6", color: "#6b7280" },
  completed: { bg: "#dcfce7", color: "#16a34a" },
  available: { bg: "#dcfce7", color: "#16a34a" },
  used: { bg: "#f3f4f6", color: "#6b7280" },
  expired: { bg: "#fee2e2", color: "#dc2626" },
};

/* ─── Helper Components ─── */
const SCard = ({ title, children, style, actions }) => (
  <div style={{ ...S.card, marginBottom: 20, ...style }}>
    {(title || actions) && (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        {title && <div style={S.sectionTitle}>{title}</div>}
        {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

const StatCard = ({ icon, value, label, sub, color = "#FF3366" }) => (
  <div style={{ ...S.card, borderLeft: `3px solid ${color}`, flex: 1 }}>
    <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontWeight: 900, fontSize: 28, color: "#1f2937" }}>{value}</div>
    <div style={{ color: "#6b7280", fontSize: 13, margin: "4px 0" }}>{label}</div>
    {sub && <div style={{ color, fontSize: 12, fontWeight: 600 }}>{sub}</div>}
  </div>
);

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status?.toLowerCase()] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={S.badge(s.bg, s.color)}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
    </span>
  );
};

const EmptyState = ({ icon = "📭", msg }) => (
  <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
    <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
    <div style={{ fontSize: 14 }}>{msg}</div>
  </div>
);

/* ─── Overview Tab ─── */
const OverviewTab = ({ stats, inventory, requests, appointments }) => {
  const expiringSoon = inventory.filter(i => {
    if (i.status !== "available") return false;
    const d = (new Date(i.expiryDate) - new Date()) / 86400000;
    return d > 0 && d <= 7;
  }).length;

  const recentActivity = [
    ...requests.slice(0, 3).map(r => ({
      time: new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      event: "📋 Blood Request",
      details: `${r.recipientName || r.requesterName || "Patient"} requested ${r.quantity} unit(s) of ${r.bloodType} — ${r.status}`,
    })),
    ...appointments.slice(0, 2).map(a => ({
      time: new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      event: "🗓️ Appointment",
      details: `Donor booked ${a.notes?.match(/Stream:\s*([^,]+)/)?.[1] || "Blood"} donation on ${new Date(a.donationDate).toLocaleDateString()}`,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard icon="🩸" value={stats.totalBloodUnits} label="Total Units Available" sub="Live from inventory" />
        <StatCard icon="🕐" value={stats.pendingRequests} label="Pending Requests" sub="Awaiting action" color="#f59e0b" />
        <StatCard icon="⏳" value={expiringSoon} label="Expiring in 7 Days" sub="Needs attention" color="#ef4444" />
        <StatCard icon="🤲" value={stats.totalDonors?.toLocaleString()} label="Registered Donors" sub="All-time total" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SCard title="📊 Platform Snapshot">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Hospital Partners", value: stats.totalHospitals },
              { label: "Total Blood Units", value: stats.totalBloodUnits },
              { label: "Pending Requests", value: stats.pendingRequests },
              { label: "Total Donors", value: stats.totalDonors },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "14px 0", border: "1px solid #f0f0f0", borderRadius: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 26, color: "#FF3366" }}>{s.value ?? "—"}</div>
                <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </SCard>

        <SCard title="🕑 Recent Activity">
          {recentActivity.length === 0 ? (
            <EmptyState msg="No recent activity yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", minWidth: 56, marginTop: 2 }}>{a.time}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{a.event}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{a.details}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SCard>
      </div>
    </div>
  );
};

/* ─── Inventory Tab ─── */
const InventoryTab = ({ inventory, onAdd, onDelete, loading }) => {
  const stockMap = {};
  BLOOD_TYPES.forEach(t => { stockMap[t] = 0; });
  inventory.forEach(i => {
    if (i.status === "available") {
      stockMap[i.bloodType] = (stockMap[i.bloodType] || 0) + (i.quantity || 0);
    }
  });
  const chartData = BLOOD_TYPES.map(t => ({ bloodType: t, units: stockMap[t] }));

  const expiring = inventory.filter(i => {
    if (i.status !== "available") return false;
    const d = (new Date(i.expiryDate) - new Date()) / 86400000;
    return d > 0 && d <= 30;
  });

  return (
    <div>
      <SCard
        title="🩸 Blood Stock Levels"
        actions={
          <button
            onClick={onAdd}
            style={S.btn("linear-gradient(135deg,#E61E4D,#FF3366)", "#fff")}
          >
            ➕ Add Blood Stock
          </button>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {chartData.map(item => (
            <div key={item.bloodType} style={{
              textAlign: "center", padding: "14px 8px",
              border: `1px solid ${item.units === 0 ? "#fecaca" : "#f0f0f0"}`,
              borderRadius: 12,
              background: item.units === 0 ? "#fff7f7" : "#fff",
            }}>
              <div style={{ fontWeight: 900, fontSize: 28, color: item.units === 0 ? "#ef4444" : "#FF3366" }}>
                {item.units}
              </div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4, fontWeight: 600 }}>{item.bloodType}</div>
              <div style={{ fontSize: 10, color: item.units === 0 ? "#ef4444" : "#9ca3af", marginTop: 2 }}>
                {item.units === 0 ? "Out of Stock" : "units"}
              </div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="bloodType" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "rgba(124,92,252,0.05)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }} />
            <Bar dataKey="units" fill="#FF3366" radius={[6, 6, 0, 0]} name="Units Available" />
          </BarChart>
        </ResponsiveContainer>
      </SCard>

      <SCard title="⚠️ Expiring Soon (Next 30 Days)">
        {expiring.length === 0 ? (
          <EmptyState icon="✅" msg="No inventory expiring in the next 30 days." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Blood Type", "Quantity", "Expiry Date", "Days Left", "Status", "Action"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expiring.map((e, i) => {
                const daysLeft = Math.floor((new Date(e.expiryDate) - new Date()) / 86400000);
                return (
                  <tr key={e.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ ...S.td, fontWeight: 700, color: "#FF3366" }}>{e.bloodType}</td>
                    <td style={S.td}>{e.quantity} unit(s)</td>
                    <td style={S.td}>{new Date(e.expiryDate).toLocaleDateString()}</td>
                    <td style={{ ...S.td, fontWeight: 700, color: daysLeft <= 7 ? "#ef4444" : "#f59e0b" }}>
                      {daysLeft} days
                    </td>
                    <td style={S.td}><StatusBadge status={daysLeft <= 7 ? "urgent" : "soon"} /></td>
                    <td style={S.td}>
                      <button
                        onClick={() => onDelete(e.id)}
                        style={S.btn("#fee2e2", "#dc2626")}
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SCard>

      <SCard title="📦 All Inventory Records">
        {inventory.length === 0 ? (
          <EmptyState msg="No inventory records found." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Blood Type", "Qty", "Status", "Expiry Date", "Source", "Action"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.slice(0, 30).map((item, i) => (
                <tr key={item.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ ...S.td, fontWeight: 700, color: "#FF3366" }}>{item.bloodType}</td>
                  <td style={S.td}>{item.quantity}</td>
                  <td style={S.td}><StatusBadge status={item.status} /></td>
                  <td style={S.td}>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"}</td>
                  <td style={{ ...S.td, color: "#6b7280" }}>{item.source || item.donorId ? (item.donorId ? "Donor" : "Admin") : "—"}</td>
                  <td style={S.td}>
                    {item.status === "available" && (
                      <button onClick={() => onDelete(item.id)} style={S.btn("#fee2e2", "#dc2626")}>
                        🗑️ Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SCard>
    </div>
  );
};

/* ─── Requests Tab ─── */
const RequestsTab = ({ requests, onStatusChange, onDelete }) => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <SCard
      title="📋 Blood Requests Management"
      actions={
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "pending", "approved", "fulfilled", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                ...S.btn(
                  filter === s ? "linear-gradient(135deg,#E61E4D,#FF3366)" : "#f3f4f6",
                  filter === s ? "#fff" : "#374151"
                ),
                textTransform: "capitalize",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      }
    >
      {filtered.length === 0 ? (
        <EmptyState msg={`No ${filter === "all" ? "" : filter + " "}requests found.`} />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Req ID", "Patient", "Blood Type", "Qty", "Urgency", "Hospital", "Date", "Status", "Actions"].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ ...S.td, fontFamily: "monospace", fontSize: 11 }}>
                  REQ-{r.id?.substring(0, 6).toUpperCase()}
                </td>
                <td style={{ ...S.td, fontWeight: 600 }}>{r.recipientName || r.requesterName || "N/A"}</td>
                <td style={{ ...S.td, fontWeight: 700, color: "#FF3366" }}>{r.bloodType}</td>
                <td style={S.td}>{r.quantity}</td>
                <td style={S.td}>
                  <span style={S.badge(
                    r.urgency === "critical" ? "#fee2e2" : r.urgency === "urgent" ? "#fef3c7" : "#f3f4f6",
                    r.urgency === "critical" ? "#dc2626" : r.urgency === "urgent" ? "#d97706" : "#6b7280"
                  )}>
                    {r.urgency || "Normal"}
                  </span>
                </td>
                <td style={{ ...S.td, fontSize: 12 }}>{r.hospitalName || "—"}</td>
                <td style={{ ...S.td, color: "#9ca3af", fontSize: 12 }}>
                  {r.requestDate || r.createdAt ? new Date(r.requestDate || r.createdAt).toLocaleDateString() : "—"}
                </td>
                <td style={S.td}><StatusBadge status={r.status} /></td>
                <td style={S.td}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {r.status === "pending" && (
                      <button
                        onClick={() => onStatusChange(r.id, "approved")}
                        style={S.btn("#dbeafe", "#1d4ed8")}
                      >
                        ✅ Approve
                      </button>
                    )}
                    {(r.status === "pending" || r.status === "approved") && (
                      <button
                        onClick={() => onStatusChange(r.id, "fulfilled")}
                        style={S.btn("#dcfce7", "#16a34a")}
                      >
                        ✔ Fulfill
                      </button>
                    )}
                    {r.status !== "rejected" && r.status !== "fulfilled" && (
                      <button
                        onClick={() => onStatusChange(r.id, "rejected")}
                        style={S.btn("#fef3c7", "#d97706")}
                      >
                        ✖ Reject
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(r.id)}
                      style={S.btn("#fee2e2", "#dc2626")}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SCard>
  );
};

/* ─── Donors Tab ─── */
const DonorsTab = ({ donors }) => {
  const [search, setSearch] = useState("");
  const filtered = donors.filter(d =>
    !search ||
    d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.bloodType?.toLowerCase().includes(search.toLowerCase())
  );

  const groupMap = {};
  BLOOD_TYPES.forEach(t => { groupMap[t] = 0; });
  donors.forEach(d => { groupMap[d.bloodType] = (groupMap[d.bloodType] || 0) + 1; });

  const thisMonth = donors.filter(d => {
    const c = new Date(d.createdAt);
    const n = new Date();
    return c.getMonth() === n.getMonth() && c.getFullYear() === n.getFullYear();
  }).length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard icon="👥" value={donors.length} label="Total Registered Donors" />
        <StatCard icon="✅" value={donors.filter(d => d.status === "eligible").length} label="Eligible Donors" color="#22c55e" />
        <StatCard icon="📅" value={thisMonth} label="New This Month" color="#f59e0b" />
        <StatCard icon="🩸" value={Object.values(groupMap).filter(v => v > 0).length} label="Blood Types Present" color="#ef4444" />
      </div>

      <SCard title="🩸 Donors by Blood Group">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {BLOOD_TYPES.map(t => (
            <div key={t} style={{ textAlign: "center", padding: "14px 8px", border: "1px solid #f0f0f0", borderRadius: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 26, color: "#FF3366" }}>{groupMap[t]}</div>
              <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>{t} Donors</div>
            </div>
          ))}
        </div>
      </SCard>

      <SCard title="👥 All Registered Donors">
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="🔍 Search by name or blood type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid #e5e7eb",
              fontSize: 13, width: "100%", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyState msg="No donors found." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Donor Name", "Email", "Blood Type", "Status", "Gender", "Joined"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ ...S.td, color: "#9ca3af", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{d.user?.name || "Anonymous"}</td>
                  <td style={{ ...S.td, fontSize: 12, color: "#6b7280" }}>{d.user?.email || "—"}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: "#FF3366" }}>{d.bloodType}</td>
                  <td style={S.td}><StatusBadge status={d.status} /></td>
                  <td style={{ ...S.td, textTransform: "capitalize" }}>{d.gender || "—"}</td>
                  <td style={{ ...S.td, color: "#9ca3af", fontSize: 12 }}>
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SCard>
    </div>
  );
};

/* ─── Hospitals Tab ─── */
const HospitalsTab = ({ hospitals }) => {
  const [search, setSearch] = useState("");
  const filtered = hospitals.filter(h =>
    !search ||
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard icon="🏥" value={hospitals.length} label="Total Hospitals" />
        <StatCard icon="✅" value={hospitals.filter(h => h.status === "active").length} label="Active Partners" color="#22c55e" />
        <StatCard icon="🏙️" value={[...new Set(hospitals.map(h => h.city).filter(Boolean))].length} label="Cities Covered" color="#f59e0b" />
        <StatCard icon="📋" value={hospitals.filter(h => h.role === "staff").length} label="Registered Staff" color="#FF3366" />
      </div>

      <SCard title="🏥 Hospital Partners Directory">
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="🔍 Search by hospital name or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid #e5e7eb",
              fontSize: 13, width: "100%", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon="🏥" msg="No hospital users registered yet." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Hospital / User Name", "Email", "Phone", "City", "State", "Status", "Joined"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr key={h.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ ...S.td, color: "#9ca3af", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{h.name}</td>
                  <td style={{ ...S.td, fontSize: 12, color: "#6b7280" }}>{h.email}</td>
                  <td style={S.td}>{h.phone || "—"}</td>
                  <td style={S.td}>{h.city || "—"}</td>
                  <td style={S.td}>{h.state || "—"}</td>
                  <td style={S.td}><StatusBadge status={h.status} /></td>
                  <td style={{ ...S.td, color: "#9ca3af", fontSize: 12 }}>
                    {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SCard>
    </div>
  );
};

/* ─── Analytics Tab ─── */
const AnalyticsTab = ({ requests, donors, inventory }) => {
  const trendMap = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  months.forEach(m => { trendMap[m] = 0; });
  requests.forEach(r => {
    const m = months[new Date(r.createdAt).getMonth()];
    if (m) trendMap[m]++;
  });
  const donorTrend = {};
  months.forEach(m => { donorTrend[m] = 0; });
  donors.forEach(d => {
    const m = months[new Date(d.createdAt).getMonth()];
    if (m) donorTrend[m]++;
  });
  const trendData = months.map(m => ({
    month: m,
    Requests: trendMap[m],
    Donors: donorTrend[m],
  }));

  const bloodGroupData = BLOOD_TYPES.map(t => ({
    name: t,
    value: donors.filter(d => d.bloodType === t).length,
  })).filter(d => d.value > 0);

  const PIE_COLORS = ["#FF3366", "#ef4444", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"];

  const fulfilled = requests.filter(r => r.status === "fulfilled").length;
  const pending = requests.filter(r => r.status === "pending").length;
  const rejected = requests.filter(r => r.status === "rejected").length;
  const totalInv = inventory.length;
  const availInv = inventory.filter(i => i.status === "available").length;
  const expiredInv = inventory.filter(i => i.status === "expired").length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard icon="📋" value={requests.length} label="Total Requests" />
        <StatCard icon="✅" value={fulfilled} label="Fulfilled" color="#22c55e" />
        <StatCard icon="⏳" value={pending} label="Pending" color="#f59e0b" />
        <StatCard icon="❌" value={rejected} label="Rejected" color="#ef4444" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <SCard title="📈 Monthly Request & Donor Trend">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Requests" stroke="#FF3366" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Donors" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </SCard>

        <SCard title="🩸 Donors by Blood Group">
          {bloodGroupData.length === 0 ? (
            <EmptyState msg="No donor data for chart." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={bloodGroupData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {bloodGroupData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SCard>
      </div>

      <SCard title="📊 Fulfillment & Inventory Summary" style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            {
              label: "Fulfillment Rate",
              value: requests.length > 0 ? `${Math.round((fulfilled / requests.length) * 100)}%` : "—",
              desc: `${fulfilled} of ${requests.length} requests fulfilled`,
              color: "#22c55e",
            },
            {
              label: "Inventory Availability",
              value: totalInv > 0 ? `${Math.round((availInv / totalInv) * 100)}%` : "—",
              desc: `${availInv} available of ${totalInv} total units`,
              color: "#FF3366",
            },
            {
              label: "Expired Units",
              value: expiredInv,
              desc: `${expiredInv} units expired (needs removal)`,
              color: "#ef4444",
            },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "18px", border: "1px solid #f0f0f0", borderRadius: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 30, color: s.color }}>{s.value}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1f2937", marginTop: 6 }}>{s.label}</div>
              <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </SCard>
    </div>
  );
};

/* ─── Settings Tab ─── */
const SettingsTab = ({ stats, donors, requests, inventory }) => {
  const sysInfo = [
    { label: "System Status", value: "● Operational", color: "#16a34a" },
    { label: "API Status", value: "✅ Connected", color: "#FF3366" },
    { label: "Total Donors", value: stats.totalDonors?.toLocaleString() ?? "—", color: "#FF3366" },
    { label: "Total Hospitals", value: stats.totalHospitals?.toString() ?? "—", color: "#FF3366" },
  ];
  const invInfo = [
    { label: "Total Inventory Records", value: inventory.length, color: "#FF3366" },
    { label: "Available Units", value: inventory.filter(i => i.status === "available").length, color: "#22c55e" },
    { label: "Expired Units", value: inventory.filter(i => i.status === "expired").length, color: "#ef4444" },
    { label: "Total Blood Units Stock", value: stats.totalBloodUnits ?? "—", color: "#FF3366" },
  ];
  const reqInfo = [
    { label: "Total Requests", value: requests.length, color: "#FF3366" },
    { label: "Pending", value: requests.filter(r => r.status === "pending").length, color: "#f59e0b" },
    { label: "Fulfilled", value: requests.filter(r => r.status === "fulfilled").length, color: "#22c55e" },
    { label: "Rejected", value: requests.filter(r => r.status === "rejected").length, color: "#ef4444" },
  ];

  const InfoGrid = ({ items }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
      {items.map((it, i) => (
        <div key={i} style={{ padding: "18px 14px", border: "1px solid #f0f0f0", borderRadius: 12, textAlign: "center" }}>
          <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>{it.label}</div>
          <div style={{ fontWeight: 900, fontSize: 22, color: it.color }}>{it.value}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <SCard title="⚙️ System Information"><InfoGrid items={sysInfo} /></SCard>
      <SCard title="🩸 Inventory Status"><InfoGrid items={invInfo} /></SCard>
      <SCard title="📋 Request Summary"><InfoGrid items={reqInfo} /></SCard>
    </div>
  );
};

/* ─── Add Blood Stock Modal ─── */
const AddBloodModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    bloodType: "A+",
    quantity: "",
    expiryDate: "",
    source: "admin",
  });

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.bloodType || !form.quantity || !form.expiryDate) return;
    onSubmit(form);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 32,
        width: 440, boxShadow: "0 16px 50px rgba(0,0,0,0.18)",
      }}>
        <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          🩸 Add Blood Stock
        </div>
        <form onSubmit={handleSubmit}>
          {[
            { label: "Blood Type", name: "bloodType", type: "select", options: BLOOD_TYPES },
            { label: "Quantity (units)", name: "quantity", type: "number", placeholder: "e.g. 5" },
            { label: "Expiry Date", name: "expiryDate", type: "date", min: today },
            { label: "Source / Note", name: "source", type: "text", placeholder: "e.g. Donation Camp, Admin" },
          ].map(field => (
            <div key={field.name} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  value={form[field.name]}
                  onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, outline: "none" }}
                >
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  min={field.min}
                  value={form[field.name]}
                  onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  required={field.name !== "source"}
                />
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              type="submit"
              style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#E61E4D,#FF3366)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
            >
              ➕ Add to Stock
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Receipt Modal ─── */
const ReceiptModal = ({ receipt, onClose, onDownload }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "#fff", borderRadius: 24, padding: 32, maxWidth: 480, width: "90%", boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#FCE6E6", border: "2px solid #FF6B8B", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28 }}>✅</div>
        <h2 style={{ fontWeight: 900, fontSize: 20, color: "#1f2937", margin: 0 }}>Appointment Confirmed!</h2>
        <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Donation verified and recorded by admin.</p>
      </div>
      <div style={{ background: "#f9fafb", borderRadius: 14, padding: 18, border: "1px dashed #d1d5db", marginBottom: 20 }}>
        {[
          ["Admin Ref ID", receipt.refId],
          ["Blood Type", receipt.bloodType],
          ["Donation Stream", receipt.stream],
          ["Center", receipt.hospital],
          ["Appointment Date", receipt.date],
          ["Confirmed At", receipt.completedAt],
        ].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13 }}>
            <span style={{ color: "#6b7280", fontWeight: 600 }}>{label}:</span>
            <span style={{ fontWeight: 800, color: "#1f2937" }}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onDownload(receipt)} style={{ padding: "12px", borderRadius: 10, background: "linear-gradient(135deg,#E61E4D,#FF3366)", border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
          📥 Download Receipt
        </button>
        <button onClick={onClose} style={{ padding: "11px", borderRadius: 10, background: "none", border: "1.5px solid #d1d5db", color: "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Close
        </button>
      </div>
    </div>
  </div>
);

/* ─── Main Component ─── */
export default function AdminDashboard() {
  const { logout } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBloodUnits: 0, pendingRequests: 0, totalDonors: 0, totalHospitals: 0 });
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showAddBlood, setShowAddBlood] = useState(false);
  const [receiptModal, setReceiptModal] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, reqsRes, invRes, donorsRes, apptRes, hospRes] = await Promise.all([
        adminService.getStats(),
        requestService.getAll(),
        inventoryService.get(),
        donorService.getAll(),
        donationService.getAll({ status: "pending" }),
        userService.getAll({ role: "staff" }).catch(() => ({ data: [] })),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      setRequests(reqsRes.data || []);
      setInventory(invRes.data || []);
      setDonors(donorsRes.data || []);
      setAppointments(apptRes.data || []);
      setHospitals(hospRes.data || []);
    } catch (err) {
      console.error("Admin dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const iv = setInterval(loadData, 10000);
    return () => clearInterval(iv);
  }, [loadData]);

  const handleRequestStatusChange = async (id, status) => {
    try {
      await requestService.updateStatus(id, status);
      toast(`Request ${status} ✅`, "success");
      loadData();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleRequestDelete = async (id) => {
    if (!window.confirm("Delete this request permanently?")) return;
    try {
      await requestService.cancel(id);
      toast("Request removed.", "success");
      loadData();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleAddBlood = async (form) => {
    try {
      await inventoryService.create({
        bloodType: form.bloodType,
        quantity: parseInt(form.quantity),
        expiryDate: form.expiryDate,
        source: form.source || "admin",
      });
      toast(`✅ Added ${form.quantity} units of ${form.bloodType} to stock!`, "success");
      setShowAddBlood(false);
      loadData();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!window.confirm("Remove this blood unit from inventory?")) return;
    try {
      await inventoryService.delete(id);
      toast("Inventory record removed.", "success");
      loadData();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleAppointmentAction = async (appt, newStatus) => {
    try {
      await donationService.update(appt.id, { status: newStatus });
      toast(`Appointment ${newStatus === "completed" ? "confirmed ✅" : "cancelled ❌"}`, newStatus === "completed" ? "success" : "error");
      if (newStatus === "completed") {
        const stream = appt.notes?.match(/Stream:\s*([^,]+)/)?.[1]?.trim() || "Whole Blood";
        setReceiptModal({
          refId: "ADM-" + Math.floor(Math.random() * 900000 + 100000),
          bloodType: appt.bloodType,
          stream,
          hospital: appt.hospital || "Life4U Center",
          date: new Date(appt.donationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          completedAt: new Date().toLocaleString(),
        });
      }
      loadData();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const downloadReceipt = (r) => {
    const text = [
      "================================================",
      "   LIFE4U ADMIN — APPOINTMENT COMPLETION RECEIPT",
      "================================================",
      `Admin Ref ID    : ${r.refId}`,
      `Blood Type      : ${r.bloodType}`,
      `Donation Stream : ${r.stream}`,
      `Center          : ${r.hospital}`,
      `Appointment Date: ${r.date}`,
      `Confirmed At    : ${r.completedAt}`,
      "",
      "Status: COMPLETED — Verified by Admin.",
      "================================================",
      "Thank you for helping save lives with Life4U!",
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `life4u_admin_receipt_${r.refId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast("📥 Receipt downloaded!", "success");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab stats={stats} inventory={inventory} requests={requests} appointments={appointments} />;
      case "inventory":
        return <InventoryTab inventory={inventory} onAdd={() => setShowAddBlood(true)} onDelete={handleDeleteInventory} />;
      case "requests":
        return <RequestsTab requests={requests} onStatusChange={handleRequestStatusChange} onDelete={handleRequestDelete} />;
      case "donors":
        return <DonorsTab donors={donors} />;
      case "hospitals":
        return <HospitalsTab hospitals={hospitals} />;
      case "analytics":
        return <AnalyticsTab requests={requests} donors={donors} inventory={inventory} />;
      case "settings":
        return <SettingsTab stats={stats} donors={donors} requests={requests} inventory={inventory} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "sans-serif", background: "#f4f6fb" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🩸</div>
        <div style={{ color: "#FF3366", fontSize: 18, fontWeight: 700 }}>Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <>
      {/* Modals */}
      {showAddBlood && <AddBloodModal onClose={() => setShowAddBlood(false)} onSubmit={handleAddBlood} />}
      {receiptModal && (
        <ReceiptModal
          receipt={receiptModal}
          onClose={() => setReceiptModal(null)}
          onDownload={downloadReceipt}
        />
      )}

      <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#FFF5F5", minHeight: "100vh" }}>

        {/* Emergency Banner */}
        <div style={{ background: "linear-gradient(90deg,#ef4444,#f87171)", color: "#fff", padding: "9px 24px", display: "flex", alignItems: "center", gap: 16, fontSize: 12, fontWeight: 500 }}>
          <span>⚠️ Emergency Need?</span>
          <span style={{ textDecoration: "underline", cursor: "pointer", fontWeight: 700 }}>Click Here for Immediate Blood Request</span>
          <span style={{ opacity: 0.7 }}>• 24/7 Helpline: 1800-123-4567</span>
          <span style={{ marginLeft: "auto", opacity: 0.85 }}>🔴 Live — Auto-refreshing every 10s</span>
        </div>

        {/* Top Navbar with Tabs */}
        <nav style={{ background: "#fff", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(255,51,102,0.08)", position: "sticky", top: 0, zIndex: 100, borderBottom: "2px solid #FCE6E6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900, fontSize: 20, color: "#ef4444", minWidth: 130 }}>
            🩸 Life4U
          </div>

          {/* Center: Tab Navigation */}
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "16px 16px", borderRadius: 0, border: "none",
                  fontWeight: 600, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                  background: "transparent",
                  color: activeTab === tab.key ? "#FF3366" : "#6b7280",
                  borderBottom: activeTab === tab.key ? "2.5px solid #FF3366" : "2.5px solid transparent",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Right: Admin Badge + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 200, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 12, background: "#FCE6E6", color: "#FF3366", borderRadius: 20, padding: "5px 12px", fontWeight: 700 }}>
              👑 Super Admin
            </span>
            <button
              onClick={logout}
              style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 20, padding: "7px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Logout
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 48px" }}>

          {/* Hero Banner */}
          <div style={{
            background: "linear-gradient(135deg,#E61E4D 0%,#FF3366 55%,#FF6B8B 100%)",
            borderRadius: 20, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: 60, top: 20, width: 130, height: 130, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", right: 20, top: 70, width: 70, height: 70, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
            <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 26, margin: "0 0 8px" }}>
              👑 Administrator Dashboard
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "0 0 20px" }}>
              Full real-time visibility across all operations
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { icon: "🩸", value: stats.totalBloodUnits, label: "Blood Units" },
                { icon: "🕐", value: stats.pendingRequests, label: "Pending" },
                { icon: "🤲", value: stats.totalDonors, label: "Donors" },
                { icon: "🏥", value: stats.totalHospitals, label: "Hospitals" },
              ].map((c, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.15)", borderRadius: 14,
                  padding: "12px 18px", display: "flex", alignItems: "center", gap: 10,
                  backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", flex: 1, minWidth: 110,
                }}>
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 900, fontSize: 22, lineHeight: 1.1 }}>{c.value ?? 0}</div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>{c.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Appointments Section (shown in donors tab) */}
          {activeTab === "donors" && appointments.length > 0 && (
            <div style={{ ...S.card, marginBottom: 20 }}>
              <div style={{ ...S.sectionTitle, marginBottom: 12 }}>
                📅 Pending Donor Appointments
                <span style={S.badge("#fef3c7", "#d97706")}>{appointments.length} pending</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["Appt ID", "Blood Type", "Stream", "Center", "Appointment Date", "Status", "Actions"].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a, i) => {
                      const stream = a.notes?.match(/Stream:\s*([^,]+)/)?.[1]?.trim() || "Whole Blood";
                      return (
                        <tr key={a.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ ...S.td, fontFamily: "monospace", fontSize: 11 }}>APT-{a.id?.substring(0, 8).toUpperCase()}</td>
                          <td style={{ ...S.td, fontWeight: 700, color: "#FF3366" }}>{a.bloodType}</td>
                          <td style={S.td}>{stream}</td>
                          <td style={S.td}>{a.hospital || "Life4U Center"}</td>
                          <td style={S.td}>{new Date(a.donationDate).toLocaleDateString()}</td>
                          <td style={S.td}><StatusBadge status={a.status} /></td>
                          <td style={S.td}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleAppointmentAction(a, "completed")} style={S.btn("#FF3366", "#fff")}>✅ Confirm</button>
                              <button onClick={() => handleAppointmentAction(a, "cancelled")} style={S.btn("#fee2e2", "#dc2626")}>❌ Cancel</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {renderTab()}

          {/* Footer */}
          <footer style={{ background: "#111827", borderRadius: 16, padding: "32px 32px 20px", marginTop: 24, color: "#9ca3af" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, marginBottom: 24 }}>
              <div>
                <div style={{ color: "#ef4444", fontWeight: 900, fontSize: 18, marginBottom: 10 }}>🩸 Life4U</div>
                <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 220 }}>Saving lives, one pint at a time. Connecting donors, hospitals and patients through technology.</p>
              </div>
              {[
                { title: "Quick Links", items: ["About Us", "Why Donate", "Become a Donor", "Contact"] },
                { title: "Legal", items: ["Privacy Policy", "Terms of Service", "Medical Disclaimer"] },
              ].map(col => (
                <div key={col.title}>
                  <div style={{ color: "#fff", fontWeight: 700, marginBottom: 12 }}>{col.title}</div>
                  {col.items.map(l => <div key={l} style={{ marginBottom: 8, fontSize: 13, cursor: "pointer" }}>{l}</div>)}
                </div>
              ))}
              <div>
                <div style={{ color: "#fff", fontWeight: 700, marginBottom: 12 }}>Follow Us</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["f", "𝕏", "📷", "in"].map((s, i) => (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer" }}>{s}</div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #374151", paddingTop: 16, textAlign: "center", fontSize: 12 }}>
              © 2026 Life4U. All rights reserved. | Made with ❤️ for humanity
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}