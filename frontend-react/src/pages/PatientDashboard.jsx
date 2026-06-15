import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { requestService, inventoryService, authService } from "../services/api";

/* ─── CONSTANTS ─── */
const NOTIFICATIONS = [
  { icon: "🩸", title: "Blood inventory levels updated", desc: "Stock levels updated. Multiple hospitals have supply.", time: "Just now", tag: "info", tagColor: "#6366f1", tagBg: "#e0e7ff" },
  { icon: "👤", title: "Universal Donor Available", desc: "Multiple compatible O- donors are active in your state.", time: "1 hour ago", tag: "available", tagColor: "#16a34a", tagBg: "#dcfce7" },
  { icon: "🏥", title: "City Hospital has new stock", desc: "Additional blood units added to central inventory", time: "5 hours ago", tag: null },
];
const PENDING_ACTIONS = [
  { icon: "📋", title: "Confirm transfusion consent", desc: "Required before procedure", badge: "Urgent", badgeColor: "#ef4444", badgeBg: "#fee2e2" },
  { icon: "📅", title: "Schedule checkup", desc: "Recommended post-procedure check within 7 days", badge: "Due soon", badgeColor: "#f59e0b", badgeBg: "#fef3c7" },
  { icon: "📄", title: "Update medical history", desc: "Ensure your records are up to date", badge: null },
];
const EMERGENCY_CONTACTS = [
  { name: "Support Desk", relation: "Helpline" },
  { name: "Emergency Ward", relation: "Partner Hosp." },
];
const SETTINGS_LINKS = ["Edit Profile", "Medical History", "Account Settings", "Privacy & Security"];
const DOCUMENTS = [
  { icon: "📄", name: "Prescription_Doctor_Sharma.jpg", uploaded: "Mar 10, 2026", size: "1.2 MB" },
  { icon: "📋", name: "Medical_History_Summary.pdf", uploaded: "Mar 5, 2026", size: "4.1 MB" },
  { icon: "🪪", name: "ID_Proof_Aadhar.pdf", uploaded: "Feb 28, 2026", size: "0.8 MB" },
];
const STATUS_STEPS = ["Submitted", "Processing", "Approved", "Completed"];
const STATUS_MEANING = [
  { label: "Submitted", color: "#9ca3af" },
  { label: "Processing", color: "#6366f1" },
  { label: "Approved", color: "#f59e0b" },
  { label: "In Transit", color: "#3b82f6" },
  { label: "Completed", color: "#22c55e" },
  { label: "Cancelled", color: "#ef4444" },
];

/* ─── TOKENS ─── */
const R = "#FF3366";
const RD = "#E61E4D";
const RL = "#FCE6E6";
const RM = "#FF6B8B";
const BG = "#FFF5F5";

const cardStyle = (accentColor) => ({
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  borderLeft: `6px solid ${accentColor}`,
  overflow: "hidden",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  border: "1px solid #eef2f6",
});

/* ─── SHARED TABLE STYLES ─── */
const TH = { padding: "14px 20px", textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "2px solid #eef2f6", background: "#f8fafc" };
const TD = { padding: "16px 20px", fontSize: 13, color: "#334155", borderBottom: "1px solid #f1f5f9" };

/* ─── SECTION WRAPPER — replaces card ─── */
const Section = ({ title, accent = R, children, right, style = {} }) => (
  <div style={{ ...cardStyle(accent), marginBottom: 20, ...style }}>
    {title && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc" }}>
        <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", letterSpacing: "-0.01em" }}>{title}</span>
        {right}
      </div>
    )}
    <div style={{ padding: "20px 24px" }}>{children}</div>
  </div>
);

/* ─── DATA ROW — label + value inline ─── */
const DataRow = ({ label, value, last, mono, valueColor }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 20px", borderBottom: last ? "none" : "1px solid #f9f9f9" }}>
    <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: valueColor || "#1f2937", fontFamily: mono ? "monospace" : "inherit" }}>{value}</span>
  </div>
);

/* ─── STAT STRIP — row of key numbers ─── */
const StatStrip = ({ stats }) => (
  <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
    {stats.map((s, i) => (
      <div key={i} style={{ flex: 1, padding: "18px 20px", borderRight: i < stats.length - 1 ? "1px solid #f0f0f0" : "none" }}>
        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: s.color || "#1f2937", lineHeight: 1 }}>{s.value}</div>
        {s.sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{s.sub}</div>}
      </div>
    ))}
  </div>
);

/* ─── PILL BADGE ─── */
const Pill = ({ text, bg, color }) => (
  <span style={{ background: bg, color, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", display: "inline-block" }}>{text}</span>
);

/* ─── PRIMARY BUTTON ─── */
const BtnPrimary = ({ onClick, children, style = {} }) => (
  <button onClick={onClick} style={{ background: R, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, ...style }}>
    {children}
  </button>
);
const BtnGhost = ({ onClick, children, style = {} }) => (
  <button onClick={onClick} style={{ background: "#fff", color: R, border: `1.5px solid ${R}`, borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, ...style }}>
    {children}
  </button>
);

/* ─── HERO ─── */
const Hero = ({ user, view }) => (
  <div style={{ background: `linear-gradient(135deg, #FF6B8B 0%, #FF3366 55%, #E61E4D 100%)`, borderRadius: 16, padding: "32px 36px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", right: -20, top: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
    <div style={{ position: "absolute", right: 70, bottom: -40, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
        {view === "dashboard" ? "🏥" : "🩸"}
      </div>
      <div>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 24, margin: "0 0 3px" }}>Welcome back, {user?.name || "Patient"}</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>
          {view === "dashboard" ? "Manage your health requests and track blood availability here." : "Manage your blood requests and track status in real-time"}
        </p>
      </div>
    </div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {[{ icon: "🩸", text: `Blood Group: ${user?.bloodType || "O+"}` }, { icon: "🪪", text: `Patient ID: ${user?.patientId || (user?.id ? 'PAT-' + user.id.substring(0, 8).toUpperCase() : "USER")}` }, { icon: "🛡️", text: "Priority Status" }].map((b, i) => (
        <span key={i} style={{ background: "rgba(255,255,255,0.18)", color: "#fff", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", gap: 6 }}>{b.icon} {b.text}</span>
      ))}
    </div>
  </div>
);

/* ─── NEW REQUEST VIEW ─── */
const NewRequestView = ({ onBack, user, onAddDocument }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({ bloodType: user?.bloodType || "O+", quantity: 1, urgency: "normal", hospitalName: "", reason: "" });
  const [submitted, setSubmitted] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const newReqFileInputRef = React.useRef(null);
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleSubmit = async () => {
    if (!formData.hospitalName.trim()) {
      toast("Please enter the hospital name.", "error");
      return;
    }
    if (!formData.reason.trim()) {
      toast("Please enter the reason or medical notes.", "error");
      return;
    }
    try {
      const requiredDate = new Date();
      if (formData.urgency === 'emergency') {
        requiredDate.setHours(requiredDate.getHours() + 2);
      } else if (formData.urgency === 'urgent') {
        requiredDate.setDate(requiredDate.getDate() + 1);
      } else {
        requiredDate.setDate(requiredDate.getDate() + 3);
      }

      const payload = {
        bloodType: formData.bloodType,
        quantity: formData.quantity,
        urgency: formData.urgency === 'normal' ? 'routine' : formData.urgency,
        hospitalName: formData.hospitalName,
        description: formData.reason,
        reason: formData.urgency === 'emergency' ? 'emergency' : 'general',
        requiredByDate: requiredDate.toISOString(),
        recipientName: user?.name || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || '',
      };

      await requestService.create(payload);
      if (uploadedDoc && onAddDocument) {
        onAddDocument(uploadedDoc);
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast(err.message || 'Failed to submit request', 'error');
    }
  };

  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 };
  const inputStyle = { width: "100%", padding: "10px 14px", border: "none", borderBottom: "2px solid #f0f0f0", fontSize: 14, color: "#1f2937", outline: "none", background: "transparent", boxSizing: "border-box", fontFamily: "inherit" };

  if (submitted) return (
    <div style={{ ...cardStyle("#22c55e"), padding: "60px 40px", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1f2937", marginBottom: 10 }}>Request Submitted!</h2>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Your blood request has been received and is being processed.</p>
      <BtnPrimary onClick={onBack}>← Back to My Requests</BtnPrimary>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "12px 0" }}>
        <BtnGhost onClick={onBack}>← Back</BtnGhost>
        <h2 style={{ fontWeight: 800, fontSize: 20, color: "#1f2937", margin: 0 }}>🩸 New Blood Request</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={cardStyle(R)}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc", fontWeight: 800, fontSize: 15, color: "#1e293b" }}>Request Details</div>
          <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Blood Type Required</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {bloodTypes.map(bt => (
                  <button key={bt} onClick={() => setFormData(f => ({ ...f, bloodType: bt }))} style={{ padding: "8px 14px", borderRadius: 6, border: `2px solid ${formData.bloodType === bt ? R : "#e5e7eb"}`, background: formData.bloodType === bt ? RL : "#fff", color: formData.bloodType === bt ? RD : "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{bt}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Quantity (Units)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button onClick={() => setFormData(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} style={{ width: 34, height: 34, borderRadius: "50%", border: `1.5px solid ${RM}`, background: "#fff", color: R, fontWeight: 800, fontSize: 16, cursor: "pointer" }}>−</button>
                <span style={{ fontWeight: 800, fontSize: 26, color: "#1f2937", minWidth: 32, textAlign: "center" }}>{formData.quantity}</span>
                <button onClick={() => setFormData(f => ({ ...f, quantity: f.quantity + 1 }))} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: R, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>+</button>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>units</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Urgency Level</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ val: "normal", label: "Normal", color: "#6366f1", bg: "#e0e7ff" }, { val: "urgent", label: "Urgent", color: "#f59e0b", bg: "#fef3c7" }, { val: "emergency", label: "Emergency", color: R, bg: RL }].map(u => (
                  <button key={u.val} onClick={() => setFormData(f => ({ ...f, urgency: u.val }))} style={{ flex: 1, padding: "10px 6px", borderRadius: 6, border: `2px solid ${formData.urgency === u.val ? u.color : "#e5e7eb"}`, background: formData.urgency === u.val ? u.bg : "#fff", color: formData.urgency === u.val ? u.color : "#9ca3af", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{u.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={cardStyle("#6366f1")}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc", fontWeight: 800, fontSize: 15, color: "#1e293b" }}>Hospital & Reason</div>
          <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Hospital Name</label>
              <input value={formData.hospitalName} onChange={e => setFormData(f => ({ ...f, hospitalName: e.target.value }))} placeholder="Enter hospital name" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Reason / Medical Notes</label>
              <textarea value={formData.reason} onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))} placeholder="Briefly describe the medical reason..." rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: 90 }} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Medical Verification Document</label>
              <div 
                onClick={() => newReqFileInputRef.current.click()}
                style={{ border: "2px dashed #cbd5e1", borderRadius: 8, padding: "20px", textAlign: "center", background: "#f8fafc", cursor: "pointer", transition: "border-color 0.15s" }}
              >
                <input 
                  type="file" 
                  ref={newReqFileInputRef} 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setUploadedDoc(file.name);
                  }} 
                  style={{ display: "none" }} 
                />
                <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>📁</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                  {uploadedDoc ? `Attached: ${uploadedDoc}` : "Click to Upload Medical Report / Doctor Note"}
                </span>
                {!uploadedDoc && <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginTop: 4 }}>PDF, JPG or PNG (Max 10MB)</span>}
              </div>
            </div>
            <div style={{ background: "#fff8f8", borderLeft: `3px solid ${RM}`, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#7f1d1d", lineHeight: 1.6 }}>
              ℹ️ All requests reviewed by medical staff. Emergency requests handled within 30 minutes.
            </div>
            <BtnPrimary onClick={handleSubmit} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>🩸 Submit Blood Request</BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── MY REQUESTS TAB ─── */
const MyRequestsTab = ({ requests = [], onCancel, onNewRequest }) => {
  const currentReq = requests.find(r => ["pending", "approved"].includes(r.status)) || requests[0];
  const statusIndexMap = { pending: 1, approved: 2, fulfilled: 3 };
  const currentStep = currentReq ? (statusIndexMap[currentReq.status] || 1) : 1;
  const fmt = (d) => { if (!d) return "N/A"; const dt = new Date(d); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {currentReq ? (
        <div style={cardStyle(R)}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>Current Active Request</span>
              <span style={{ background: RL, color: R, borderRadius: 4, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>REQ-{currentReq.id?.substring(0, 8).toUpperCase()}</span>
            </div>
            <Pill text={currentReq.status?.toUpperCase()} bg={currentReq.status === "approved" ? "#fef3c7" : currentReq.status === "fulfilled" ? "#dcfce7" : "#e0e7ff"} color={currentReq.status === "approved" ? "#f59e0b" : currentReq.status === "fulfilled" ? "#16a34a" : "#6366f1"} />
          </div>

          {/* Stat strip */}
          <StatStrip stats={[
            { label: "Blood Type", value: currentReq.bloodType, color: R },
            { label: "Quantity", value: `${currentReq.quantity} units` },
            { label: "Requested", value: fmt(currentReq.requestDate), sub: "" },
            { label: "Hospital", value: currentReq.hospitalName || "Partner Hospital" },
          ]} />

          {/* Stepper */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2f6" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Progress</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {STATUS_STEPS.map((step, i) => {
                const done = i < currentStep, active = i === currentStep;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STATUS_STEPS.length - 1 ? 1 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: done ? R : active ? "#fff" : "#f5f5f5", border: active ? `2px solid #6366f1` : done ? "none" : "2px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, boxShadow: active ? "0 0 0 4px rgba(99,102,241,0.12)" : "none" }}>
                        {done ? <span style={{ color: "#fff", fontWeight: 800 }}>✓</span> : active ? "⏳" : <span style={{ color: "#d1d5db" }}>○</span>}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: active || done ? 700 : 400, color: active ? "#1f2937" : done ? R : "#9ca3af", marginTop: 6, whiteSpace: "nowrap" }}>{step}</div>
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: done ? R : "#eef2f6", margin: "0 6px", marginBottom: 20, borderRadius: 2 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: "18px 24px", display: "flex", gap: 10 }}>
            {["pending", "approved"].includes(currentReq.status) && <BtnGhost onClick={() => onCancel(currentReq.id)}>✕ Cancel Request</BtnGhost>}
            <BtnPrimary onClick={onNewRequest}>🚑 Emergency Request</BtnPrimary>
          </div>
        </div>
      ) : (
        <div style={{ ...cardStyle("#9ca3af"), padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1f2937", marginBottom: 6 }}>No active requests</div>
          <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 20 }}>Create a new request to get started.</div>
          <BtnPrimary onClick={onNewRequest}>➕ New Request</BtnPrimary>
        </div>
      )}

      {/* History table */}
      <div style={cardStyle("#6366f1")}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc", fontWeight: 800, fontSize: 15, color: "#1e293b" }}>📋 My Blood Requests History</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Request ID", "Blood Type", "Quantity", "Requested Date", "Status", "Hospital"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = "#fff9f9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} style={{ transition: "background 0.12s" }}>
                  <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, fontSize: 12 }}>REQ-{r.id?.substring(0, 8).toUpperCase()}</td>
                  <td style={TD}><span style={{ background: RL, color: RD, borderRadius: 4, padding: "3px 10px", fontWeight: 800, fontSize: 13 }}>{r.bloodType}</span></td>
                  <td style={TD}>{r.quantity} units</td>
                  <td style={{ ...TD, color: "#6b7280" }}>{fmt(r.requestDate)}</td>
                  <td style={TD}><Pill text={r.status} bg={r.status === "fulfilled" ? "#dcfce7" : r.status === "pending" ? "#e0e7ff" : r.status === "rejected" || r.status === "cancelled" ? RL : "#fef3c7"} color={r.status === "fulfilled" ? "#16a34a" : r.status === "pending" ? "#6366f1" : r.status === "rejected" || r.status === "cancelled" ? R : "#f59e0b"} /></td>
                  <td style={{ ...TD, color: "#6b7280" }}>{r.hospitalName || "Partner Hospital"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── HISTORY TAB ─── */
const HistoryTab = ({ requests = [] }) => {
  const history = requests.filter(r => r.status === "fulfilled");
  const fmt = (d) => { if (!d) return "N/A"; const dt = new Date(d); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
  const totalUnits = history.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Summary strip */}
      <div style={cardStyle("#22c55e")}>
        <StatStrip stats={[
          { label: "Total Completed", value: history.length, color: "#16a34a" },
          { label: "Total Units Received", value: `${totalUnits} units`, color: R },
          { label: "Last Transaction", value: history[0] ? fmt(history[0].requestDate) : "—" },
        ]} />
      </div>

      {/* Table */}
      <div style={cardStyle("#22c55e")}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc", fontWeight: 800, fontSize: 15, color: "#1e293b" }}>🕑 Previous Transaction History</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Transaction ID", "Date", "Blood Type", "Quantity", "Hospital", "Status"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} style={{ transition: "background 0.12s" }}>
                  <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, fontSize: 12 }}>TXN-{h.id?.substring(0, 8).toUpperCase()}</td>
                  <td style={TD}>{fmt(h.requestDate)}</td>
                  <td style={TD}><span style={{ background: RL, color: RD, borderRadius: 4, padding: "3px 10px", fontWeight: 800, fontSize: 13 }}>{h.bloodType}</span></td>
                  <td style={TD}>{h.quantity} units</td>
                  <td style={TD}>{h.hospitalName || "Partner Hospital"}</td>
                  <td style={TD}><Pill text="Delivered" bg="#dcfce7" color="#16a34a" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── DOCUMENTS TAB ─── */
const DocumentsTab = ({ documents, setDocuments }) => {
  const toast = useToast();
  const [dragging, setDragging] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newDoc = {
      icon: file.name.endsWith(".pdf") ? "📄" : "📋",
      name: file.name,
      uploaded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: URL.createObjectURL(file)
    };
    setDocuments([newDoc, ...documents]);
    toast(`Document "${file.name}" uploaded successfully! 📁`, "success");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const newDoc = {
      icon: file.name.endsWith(".pdf") ? "📄" : "📋",
      name: file.name,
      uploaded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: URL.createObjectURL(file)
    };
    setDocuments([newDoc, ...documents]);
    toast(`Document "${file.name}" uploaded successfully! 📁`, "success");
  };

  const handleDelete = (indexToDelete) => {
    const docToDelete = documents[indexToDelete];
    setDocuments(documents.filter((_, idx) => idx !== indexToDelete));
    toast(`Document "${docToDelete.name}" deleted successfully! 🗑`, "success");
  };

  const handleView = (doc) => {
    if (doc.url) {
      window.open(doc.url, "_blank");
    } else {
      setPreviewDoc(doc);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Status legend */}
      <div style={{ ...cardStyle("#6366f1"), padding: "16px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>ℹ️ Status Guide</span>
        {STATUS_MEANING.map((s, i) => (
          <span key={i} style={{ fontSize: 12, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />{s.label}
          </span>
        ))}
      </div>

      {/* Upload zone */}
      <div style={cardStyle(R)}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc", fontWeight: 800, fontSize: 15, color: "#1e293b" }}>📁 My Medical Documents</div>
        <div style={{ padding: "24px" }}>
          <div 
            onClick={() => fileInputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }} 
            onDragLeave={() => setDragging(false)} 
            onDrop={handleDrop}
            style={{ border: `2px dashed ${dragging ? R : RM}`, borderRadius: 10, padding: "36px 20px", textAlign: "center", background: dragging ? "#fff5f5" : "#fffbfb", cursor: "pointer", marginBottom: 16, transition: "all 0.15s" }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: "none" }} 
            />
            <div style={{ fontSize: 36, color: R, marginBottom: 10 }}>☁️</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1f2937", marginBottom: 6 }}>Click to Upload Documents</div>
            <div style={{ color: "#9ca3af", fontSize: 12 }}>Upload prescription, reports, ID proof, or any medical documents</div>
            <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 4 }}>Supported formats: PDF, JPG, PNG (Max 10MB)</div>
          </div>

          {/* File list as rows */}
          {documents.map((doc, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: i < documents.length - 1 ? "1px solid #f5f5f5" : "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fff9f9"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 26 }}>{doc.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1f2937" }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Uploaded {doc.uploaded} · {doc.size}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleView(doc)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#dbeafe", color: "#1d4ed8", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>👁 View</button>
                <button onClick={() => handleDelete(i)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: RL, color: RD, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seeded Document Preview Modal */}
      {previewDoc && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            width: "500px",
            maxWidth: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            border: "1px solid #eef2f6",
            overflow: "hidden"
          }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>👁 Document Preview</span>
              <button onClick={() => setPreviewDoc(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: 50, marginBottom: 12 }}>{previewDoc.icon}</div>
              <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#1f2937" }}>{previewDoc.name}</h4>
              <p style={{ margin: "0 0 20px", fontSize: 11, color: "#9ca3af" }}>Uploaded on {previewDoc.uploaded} · {previewDoc.size}</p>
              
              {/* Simulated document box */}
              <div style={{
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: "10px",
                padding: "24px",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "left",
                fontFamily: "monospace",
                fontSize: 12,
                color: "#334155",
                lineHeight: 1.6
              }}>
                {previewDoc.name.includes("Prescription") ? (
                  <div style={{ width: "100%" }}>
                    <div style={{ fontWeight: "bold", borderBottom: "2px solid #ef4444", paddingBottom: 4, marginBottom: 10, textAlign: "center", fontSize: 14, color: "#ef4444" }}>🏥 METRO HEALTH CLINIC</div>
                    <div><strong>Doctor:</strong> Dr. R. K. Sharma, MD</div>
                    <div><strong>Date:</strong> {previewDoc.uploaded}</div>
                    <div style={{ marginTop: 6 }}><strong>Rx:</strong></div>
                    <div style={{ paddingLeft: 10 }}>• Tab. Iron Supplements (Once daily)</div>
                    <div style={{ paddingLeft: 10 }}>• Blood transfusion support (O+ / O-)</div>
                    <div style={{ marginTop: 20, textAlign: "right", fontStyle: "italic", borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>Authorized Signature ✓</div>
                  </div>
                ) : previewDoc.name.includes("Medical_History") ? (
                  <div style={{ width: "100%" }}>
                    <div style={{ fontWeight: "bold", borderBottom: "2px solid #6366f1", paddingBottom: 4, marginBottom: 10, textAlign: "center", fontSize: 13, color: "#6366f1" }}>📋 MEDICAL CASE REPORT</div>
                    <div><strong>Patient Name:</strong> Amit Sharma</div>
                    <div><strong>Blood Group:</strong> O- (Universal)</div>
                    <div><strong>Condition:</strong> General health evaluation</div>
                    <div><strong>Transfusion History:</strong> None recorded</div>
                    <div><strong>Remarks:</strong> Fully fit for standard therapeutic care.</div>
                  </div>
                ) : previewDoc.name.includes("Aadhar") || previewDoc.name.includes("ID_Proof") ? (
                  <div style={{ width: "100%", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: "bold", borderBottom: "1px solid #10b981", paddingBottom: 4, marginBottom: 8, textAlign: "center", fontSize: 11, color: "#10b981" }}>GOVERNMENT OF INDIA (MOCK ID)</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 40, height: 50, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
                      <div>
                        <div><strong>Name:</strong> Amit Sharma</div>
                        <div><strong>DOB:</strong> 15/08/1990</div>
                        <div><strong>ID Number:</strong> XXXX-XXXX-1234</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ textAlign: "center", fontStyle: "italic", color: "#94a3b8" }}>
                      🔒 Secure Medical Document File
                      <div style={{ marginTop: 6, fontSize: 11 }}>View restricted to authorized medical staff and the patient.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: "1px solid #eef2f6", background: "#f8fafc" }}>
              <button onClick={() => setPreviewDoc(null)} style={{ background: R, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── DASHBOARD VIEW ─── */
const DashboardView = ({ user, bloodStock, onNavigate, pendingActions, onActionClick }) => {
  const myBG = user?.bloodType || "O+";
  const myStock = bloodStock.find(b => b.group === myBG) || { qty: 0, status: "Critical", statusColor: R, statusBg: RL };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Blood availability section */}
      <div style={cardStyle(R)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc" }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>🩸 Current Blood Availability</span>
          <span style={{ background: RL, color: R, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: R, display: "inline-block", animation: "pulse 1.5s infinite" }} />LIVE
          </span>
        </div>

        {/* Your blood group highlight */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderBottom: "1px solid #eef2f6", background: "#fff8f8" }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: R, color: "#fff", fontWeight: 900, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{myBG}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>⭐ Your Blood Group · Priority</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1f2937" }}>{myStock.qty} units</span>
            </div>
            <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (myStock.qty / 50) * 100)}%`, height: "100%", background: R, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>🏥 Central Bank Stock</span>
              <span style={{ fontSize: 11, color: R, fontWeight: 700 }}>{Math.min(100, Math.round((myStock.qty / 50) * 100))}%</span>
            </div>
          </div>
        </div>

        {/* Blood stock table */}
        <div style={{ padding: "16px 24px 6px", borderBottom: "1px solid #eef2f6", background: "#f8fafc" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>⊞ Complete Blood Stock</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Blood Group", "Quantity", "Status"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {bloodStock.map((b, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = "#fff9f9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} style={{ transition: "background 0.12s" }}>
                  <td style={{ ...TD, padding: "11px 16px" }}><span style={{ background: RL, color: RD, borderRadius: 4, padding: "3px 10px", fontWeight: 800, fontSize: 13 }}>{b.group}</span></td>
                  <td style={{ ...TD, padding: "11px 16px", fontWeight: 700 }}>{b.qty} units</td>
                  <td style={{ ...TD, padding: "11px 16px" }}><Pill text={b.status} bg={b.statusBg} color={b.statusColor} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Actions */}
      <div style={cardStyle("#f59e0b")}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc", fontWeight: 800, fontSize: 15, color: "#1e293b" }}>🕐 Pending Actions</div>
        {pendingActions.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: 13, fontWeight: 600 }}>
            🎉 All pending actions completed! Your profile and requests are up to date.
          </div>
        ) : (
          pendingActions.map((a, i) => (
            <div key={i} onClick={() => onActionClick(a)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: i < pendingActions.length - 1 ? "1px solid #f9f9f9" : "none", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fffbeb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 8, background: "#fef9ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{a.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1f2937" }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{a.desc}</div>
                </div>
              </div>
              {a.badge && <Pill text={a.badge} bg={a.badgeBg} color={a.badgeColor} />}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: "#111827", borderRadius: 12, padding: "32px 32px 20px", marginTop: 2, color: "#9ca3af" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, marginBottom: 20 }}>
          <div>
            <div style={{ color: R, fontWeight: 900, fontSize: 18, marginBottom: 10 }}>🩸 Life4U</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 200, margin: 0 }}>Saving lives, one pint at a time.</p>
          </div>
          {[{ title: "Quick Links", items: ["About Us", "Why Donate", "Become a Donor", "Contact"] }, { title: "Legal", items: ["Privacy Policy", "Terms of Service", "Medical Disclaimer"] }].map((col, i) => (
            <div key={i}>
              <div style={{ color: "#fff", fontWeight: 700, marginBottom: 12, fontSize: 13 }}>{col.title}</div>
              {col.items.map(item => <div key={item} style={{ marginBottom: 8, fontSize: 12, cursor: "pointer" }}>{item}</div>)}
            </div>
          ))}
          <div>
            <div style={{ color: "#fff", fontWeight: 700, marginBottom: 12, fontSize: 13 }}>Follow Us</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["f", "𝕏", "📷", "in"].map((s, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, cursor: "pointer" }}>{s}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #374151", paddingTop: 14, textAlign: "center", fontSize: 12 }}>© 2026 Life4U. All rights reserved.</div>
      </footer>
    </div>
  );
};

/* ─── MAIN ─── */
export default function PatientDashboard() {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [bloodStock, setBloodStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState(DOCUMENTS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [pendingActions, setPendingActions] = useState([
    { id: "consent", icon: "📋", title: "Confirm transfusion consent", desc: "Required before procedure", badge: "Urgent", badgeColor: "#ef4444", badgeBg: "#fee2e2" },
    { id: "checkup", icon: "📅", title: "Schedule checkup", desc: "Recommended post-procedure check within 7 days", badge: "Due soon", badgeColor: "#f59e0b", badgeBg: "#fef3c7" },
    { id: "update_med", icon: "📄", title: "Update medical history", desc: "Ensure your records are up to date", badge: null },
  ]);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showCheckupModal, setShowCheckupModal] = useState(false);
  const [checkupData, setCheckupData] = useState({ date: "", time: "09:00 AM" });

  const handleActionClick = (action) => {
    if (action.id === "consent") {
      setShowConsentModal(true);
    } else if (action.id === "checkup") {
      setShowCheckupModal(true);
    } else if (action.id === "update_med") {
      setShowSettingsModal(true);
    }
  };
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodType: "O+",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bloodType: user.bloodType || "O+",
      });
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [reqData, invData] = await Promise.all([requestService.getMyRequests(), inventoryService.get()]);
      setRequests(reqData.requests || []);
      const stockMap = { "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0 };
      if (invData.data && Array.isArray(invData.data)) {
        invData.data.forEach(item => { if (item.status === "available") stockMap[item.bloodType] = (stockMap[item.bloodType] || 0) + (item.quantity || 0); });
      }
      setBloodStock(Object.keys(stockMap).map(group => {
        const qty = stockMap[group];
        let status = "Available", statusColor = "#16a34a", statusBg = "#dcfce7";
        if (qty === 0) { status = "Critical"; statusColor = R; statusBg = RL; }
        else if (qty < 10) { status = "Low"; statusColor = "#f59e0b"; statusBg = "#fef3c7"; }
        else if (qty < 20) { status = "Moderate"; statusColor = "#f59e0b"; statusBg = "#fef3c7"; }
        return { group, qty, status, statusColor, statusBg };
      }));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); const i = setInterval(fetchDashboardData, 3000); return () => clearInterval(i); }, []);

  const handleCancelRequest = async (id) => {
    try { await requestService.cancel(id); toast("Request cancelled ✕", "success"); fetchDashboardData(); } catch (err) { toast(err.message, "error"); }
  };

  const handleAddDocumentFromRequest = (fileName) => {
    const newDoc = {
      icon: fileName.endsWith(".pdf") ? "📄" : "📋",
      name: fileName,
      uploaded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      size: "2.4 MB"
    };
    setDocuments(prevDocs => [newDoc, ...prevDocs]);
  };

  const handleSaveSettings = async () => {
    try {
      const response = await authService.updateProfile(profileData);
      if (updateUser) {
        updateUser(response.data || response.user || { ...user, ...profileData });
      }
      toast("Profile updated successfully! ✅", "success");
      setShowSettingsModal(false);
    } catch (err) {
      toast(err.message || "Failed to update profile", "error");
    }
  };

  const NAV_TABS = [
    { key: "dashboard", label: "Dashboard", icon: "🏥" },
    { key: "myRequests", label: "Request Details", icon: "📋" },
    { key: "history", label: "History", icon: "🕑" },
    { key: "documents", label: "Documents", icon: "📁" },
    { key: "newRequest", label: "New Request", icon: "➕" },
  ];

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "sans-serif", color: R, fontSize: "1.1rem", fontWeight: "bold" }}>
      Loading patient profile details...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#FFF5F5", minHeight: "100vh" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }`}</style>

      {/* Emergency banner */}
      <div style={{ background: `linear-gradient(90deg,#dc2626,#ef4444)`, color: "#fff", padding: "12px 32px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 800 }}>🚨 EMERGENCY NEED?</span>
          <span onClick={() => setView("newRequest")} style={{ textDecoration: "underline", fontWeight: 800, cursor: "pointer", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: 4 }}>
            Click Here for Immediate Blood Request
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <span>📞 Helpline: <strong>1800-123-4567</strong></span>
          <span>🏢 Support Desk: <strong>Helpline</strong></span>
          <span>🏥 Emergency Ward: <strong>Partner Hosp.</strong></span>
        </div>
      </div>

      {/* Navbar */}
      <nav style={{ background: "#fff", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #FCE6E6", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(255,51,102,0.08)" }}>
        {/* Left Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900, fontSize: 20, color: R, cursor: "pointer", padding: "16px 0", flex: 1 }} onClick={() => setView("dashboard")}>
          🩸 Life4U
        </div>

        {/* Center Navigation Tabs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
          {NAV_TABS.filter(t => t.key !== "newRequest").map(t => {
            const isActive = view === t.key;
            return (
              <button key={t.key} onClick={() => setView(t.key)} style={{ padding: "20px 16px", background: "none", border: "none", borderBottom: isActive ? `3px solid ${R}` : "3px solid transparent", fontWeight: isActive ? 700 : 500, fontSize: 13, color: isActive ? R : "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.12s", whiteSpace: "nowrap" }}>
                {t.icon} {t.label}
              </button>
            );
          })}
        </div>

        {/* Right Buttons: Notifications (left of Settings), Settings, New Request, Logout */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, flex: 1 }}>
          {/* Notifications Button */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              🔔
              <span style={{ position: "absolute", top: -2, right: -2, background: R, color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
            </button>
            {showNotifications && (
              <div style={{
                position: "absolute",
                top: "46px",
                right: 0,
                width: "360px",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                border: "1px solid #eef2f6",
                zIndex: 1000,
                overflow: "hidden"
              }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #eef2f6", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>🔔 Notifications & Alerts</span>
                  <span style={{ background: R, color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>3 Active</span>
                </div>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {NOTIFICATIONS.map((n, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "14px 18px", borderBottom: i < NOTIFICATIONS.length - 1 ? "1px solid #f9f9f9" : "none" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{n.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#1f2937", marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, lineHeight: 1.3 }}>{n.desc}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: "#9ca3af" }}>🕐 {n.time}</span>
                          {n.tag && <Pill text={n.tag} bg={n.tagBg} color={n.tagColor} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <button onClick={() => setShowSettingsModal(true)} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: "9px 14px", fontWeight: 700, fontSize: 13, color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            ⚙️ Settings
          </button>

          {/* New Request Button */}
          <button onClick={() => setView("newRequest")} style={{ background: R, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            ➕ New Request
          </button>

          {/* Logout Button */}
          <button onClick={logout} style={{ background: "#1f2937", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            ↪ Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 48px" }}>
        <Hero user={user} view={view} />
        {view === "dashboard" && (
          <DashboardView 
            user={user} 
            bloodStock={bloodStock} 
            onNavigate={setView} 
            pendingActions={pendingActions}
            onActionClick={handleActionClick}
          />
        )}
        {view === "myRequests" && <MyRequestsTab requests={requests} onCancel={handleCancelRequest} onNewRequest={() => setView("newRequest")} />}
        {view === "history" && <HistoryTab requests={requests} />}
        {view === "documents" && <DocumentsTab documents={documents} setDocuments={setDocuments} />}
        {view === "newRequest" && <NewRequestView onBack={() => setView("myRequests")} user={user} onAddDocument={handleAddDocumentFromRequest} />}
      </div>

      {/* Settings Modal Overlay */}
      {showSettingsModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            width: "550px",
            maxWidth: "90%",
            maxHeight: "85vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #eef2f6"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc" }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>⚙️ Account & Medical Settings</span>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              {/* Account Details */}
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>👤 Account Information</h3>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} 
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} 
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Email Address</label>
                <input 
                  type="email" 
                  value={profileData.email} 
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} 
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} 
                />
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Phone Number</label>
                <input 
                  type="text" 
                  value={profileData.phone} 
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} 
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} 
                />
              </div>
              
              {/* Medical Details */}
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>🏥 Medical Profile</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Blood Group</label>
                  <div style={{ padding: "10px 14px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, fontWeight: 700, color: R }}>
                    {profileData.bloodType}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Patient ID</label>
                  <div style={{ padding: "10px 14px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, fontFamily: "monospace", color: "#475569" }}>
                    {user?.patientId || (user?.id ? 'PAT-' + user.id.substring(0, 8).toUpperCase() : "USER")}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: "1px solid #eef2f6", background: "#f8fafc", borderRadius: "0 0 16px 16px" }}>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: "#fff", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSaveSettings} style={{ background: R, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfusion Consent Modal */}
      {showConsentModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            width: "500px",
            maxWidth: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            border: "1px solid #eef2f6",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc" }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>📋 Patient Transfusion Consent</span>
              <button onClick={() => setShowConsentModal(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: "0 0 16px" }}>
                I hereby authorize Dr. R. K. Sharma and associates to administer blood transfusions as deemed medically necessary. 
                I understand the benefits and risks associated with this procedure, and confirm that I have been given the opportunity to ask questions.
              </p>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Electronic Sign-Off</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{user?.name || "Patient"}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Patient Signature · Timestamped Live</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: "1px solid #eef2f6", background: "#f8fafc" }}>
              <button onClick={() => setShowConsentModal(false)} style={{ background: "#fff", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => {
                setPendingActions(pendingActions.filter(a => a.id !== "consent"));
                toast("Consent Form signed and saved successfully! ✅", "success");
                setShowConsentModal(false);
              }} style={{ background: R, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Sign & Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Checkup Modal */}
      {showCheckupModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            width: "450px",
            maxWidth: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            border: "1px solid #eef2f6",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #eef2f6", background: "#f8fafc" }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>📅 Schedule Checkup Slot</span>
              <button onClick={() => setShowCheckupModal(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Select Date</label>
                <input 
                  type="date" 
                  value={checkupData.date} 
                  onChange={(e) => setCheckupData({ ...checkupData, date: e.target.value })} 
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} 
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Preferred Time</label>
                <select 
                  value={checkupData.time} 
                  onChange={(e) => setCheckupData({ ...checkupData, time: e.target.value })} 
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: "1px solid #eef2f6", background: "#f8fafc" }}>
              <button onClick={() => setShowCheckupModal(false)} style={{ background: "#fff", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => {
                if (!checkupData.date) {
                  toast("Please select a valid date.", "error");
                  return;
                }
                setPendingActions(pendingActions.filter(a => a.id !== "checkup"));
                toast(`Checkup successfully scheduled for ${checkupData.date} at ${checkupData.time}! ✅`, "success");
                setShowCheckupModal(false);
              }} style={{ background: R, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}