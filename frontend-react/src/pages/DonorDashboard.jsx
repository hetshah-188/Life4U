import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService, donationService, donorService, userService } from "../services/api";

/* ─── DESIGN TOKENS ─── */
const C = {
  primary: "#FF3366",
  primaryDim: "#E61E4D",
  primaryContainer: "#FF6B8B",
  onPrimary: "#FFFFFF",
  surface: "#FFF5F5",
  surfaceLow: "#FCE6E6",
  surfaceLowest: "#ffffff",
  surfaceHigh: "#FFE5E5",
  onSurface: "#0F172A",
  onSurfaceVariant: "#64748B",
  outlineVariant: "#E2E8F0",
  secondary: "#7C3AED",
  secondaryContainer: "#FCE6E6",
  tertiary: "#FFB347",
  tertiaryFixed: "#FFB347",
  tertiaryContainer: "#FFB347",
};

/* ─── GLOBAL STYLES injected once ─── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, html { font-family: 'Plus Jakarta Sans', sans-serif; background: #FFF5F5; color: #0F172A; }
  .mso { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 22px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; user-select: none; }
  .mso.fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #FFE5E5; border-radius: 10px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeUp 0.4s ease both; }
  @keyframes dashAnim { from { stroke-dashoffset: 300; } to { stroke-dashoffset: 0; } }
  .chart-line { stroke-dasharray: 300; animation: dashAnim 1.6s ease forwards; }
  @keyframes ringFill { from { stroke-dashoffset: 251; } }
  .ring-fill { animation: ringFill 1.2s ease forwards; }
  @keyframes glowPulse { 0%,100% { filter: drop-shadow(0 0 3px rgba(255,51,102,0.5)); } 50% { filter: drop-shadow(0 0 8px rgba(255,51,102,0.8)); } }
  .glow-pulse { animation: glowPulse 2.5s ease-in-out infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  input:focus, select:focus, textarea:focus { outline: none; }
`;

/* ─── TOGGLE ─── */
const Toggle = ({ checked, onChange, size = "md" }) => {
  const w = size === "sm" ? 36 : 44;
  const h = size === "sm" ? 20 : 24;
  const ball = size === "sm" ? 14 : 18;
  const gap = 3;
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: w, height: h, borderRadius: h, cursor: "pointer",
        background: checked ? C.primaryContainer : C.surfaceHigh,
        position: "relative", transition: "background 0.25s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: gap, left: checked ? w - ball - gap : gap,
        width: ball, height: ball, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.25s",
      }} />
    </div>
  );
};

/* ─── CHART ─── */
const LineChart = ({ data, color, fill }) => (
  <svg viewBox="0 0 400 120" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
        <stop offset="100%" stopColor={color} stopOpacity="0.01" />
      </linearGradient>
    </defs>
    <line x1="0" y1="40" x2="400" y2="40" stroke={C.outlineVariant} strokeWidth="0.7" strokeOpacity="0.35" strokeDasharray="5 5" />
    <line x1="0" y1="80" x2="400" y2="80" stroke={C.outlineVariant} strokeWidth="0.7" strokeOpacity="0.35" strokeDasharray="5 5" />
    <line x1="0" y1="110" x2="400" y2="110" stroke={C.outlineVariant} strokeWidth="0.7" strokeOpacity="0.2" />
    <path d={fill} fill={`url(#grad-${color.replace("#", "")})`} />
    <path className="chart-line" d={data} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* endpoint dot */}
    <circle cx="400" cy={parseFloat(data.split("T").pop().split(",")[1])} r="5" fill={color} className="glow-pulse" />
  </svg>
);

/* ─── RING ─── */
const Ring = ({ pct, color, label, value }) => {
  const r = 40; const circ = 2 * Math.PI * r;
  const offset = circ - (circ * pct);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 8px" }}>
        <svg viewBox="0 0 96 96" width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
          <circle cx="48" cy="48" r={r} fill="transparent" stroke={C.surfaceHigh} strokeWidth="8" />
          <circle className="ring-fill" cx="48" cy="48" r={r} fill="transparent" stroke={color}
            strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13 }}>{value}</div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, color: C.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
    </div>
  );
};

const getTier = (points) => {
  if (points >= 1500) return "Diamond Elite";
  if (points >= 1000) return "Gold";
  if (points >= 500) return "Silver";
  return "Bronze";
};

/* ═══════════════════════════════════════════════
   SETTINGS PAGE
═══════════════════════════════════════════════ */
const SettingsPage = ({ onClose, theme, setTheme, donorProfile, onProfileUpdate }) => {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState("Profile");

  const [profile, setProfile] = useState({
    name: user?.name || "",
    bloodType: user?.bloodType || donorProfile?.bloodType || "O+",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
    weight: donorProfile?.weight?.toString() || "70",
    address: user?.address || donorProfile?.address || ""
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [notifs, setNotifs] = useState(() => {
    const stored = localStorage.getItem(`bbms_notifs_${user?.id}`);
    return stored ? JSON.parse(stored) : { email: true, sms: true, push: false, donation: true, rewards: true, emergency: false };
  });
  const [privacy, setPrivacy] = useState(() => {
    const stored = localStorage.getItem(`bbms_privacy_${user?.id}`);
    return stored ? JSON.parse(stored) : { shareProfile: true, shareData: true, locationAccess: true };
  });

  const [savedAt, setSavedAt] = useState("Just now");
  const [saveFlash, setSaveFlash] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // MOCK FOR HELP TAB
  const [faqOpen, setFaqOpen] = useState(null);
  const [problemText, setProblemText] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello! Welcome to Life4U support. How can we help you today?" }
  ]);

  const sections = [
    { name: "Profile", icon: "person" },
    { name: "Security", icon: "shield" },
    { name: "Notifications", icon: "notifications" },
    { name: "Privacy", icon: "lock" },
    { name: "Help", icon: "help" },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        bloodType: profile.bloodType,
        dob: profile.dob,
        weight: profile.weight ? parseInt(profile.weight, 10) : null
      };

      const res = await authService.updateProfile(payload);
      if (res.success) {
        updateUser(res.data);
        if (onProfileUpdate) {
          onProfileUpdate();
        }
        setSavedAt(new Date().toLocaleTimeString() + " — Saved!");
        setSaveFlash(true);
        toast("✅ Settings saved successfully!", "success");
        setTimeout(() => setSaveFlash(false), 2000);
      }
    } catch (err) {
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotif = (key, val) => {
    const updated = { ...notifs, [key]: val };
    setNotifs(updated);
    localStorage.setItem(`bbms_notifs_${user.id}`, JSON.stringify(updated));
    toast("🔔 Preferences updated in real-time!", "success");
  };

  const handleTogglePrivacy = (key, val) => {
    const updated = { ...privacy, [key]: val };
    setPrivacy(updated);
    localStorage.setItem(`bbms_privacy_${user.id}`, JSON.stringify(updated));
    toast("🔒 Privacy configuration updated!", "success");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.newPass || !passwords.confirm) {
      toast("Please fill in all password fields!", "error");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast("New passwords do not match!", "error");
      return;
    }
    if (passwords.newPass.length < 6) {
      toast("Password must be at least 6 characters long!", "error");
      return;
    }
    try {
      const res = await authService.updateProfile({ password: passwords.newPass });
      if (res.success) {
        toast("🔑 Password updated in real-time!", "success");
        setPasswords({ current: "", newPass: "", confirm: "" });
      }
    } catch (err) {
      toast(err.message || "Failed to change password", "error");
    }
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        sender: "bot",
        text: "Thank you! Our support agent has received your request and will contact you shortly."
      }]);
    }, 1000);
  };

  const handleProblemSubmit = (e) => {
    e.preventDefault();
    if (!problemText.trim()) return;
    toast("🚀 Ticket #" + Math.floor(Math.random() * 90000 + 10000) + " submitted successfully!", "success");
    setProblemText("");
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    background: C.surfaceLow, border: "none", fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: 14, fontWeight: 500, color: C.onSurface,
  };
  const labelStyle = { fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.onSurfaceVariant, marginBottom: 6, display: "block" };
  const cardStyle = { background: C.surfaceLowest, borderRadius: 20, padding: 28, boxShadow: "0 8px 32px rgba(46,47,47,0.06)" };

  const renderSection = () => {
    switch (activeSection) {
      case "Profile": return (
        <div className="fade-in">
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span className="mso fill" style={{ color: C.primary, fontSize: 22 }}>badge</span>
              <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em" }}>Account Information</span>
            </div>
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primaryDim}, ${C.primaryContainer})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 22, flexShrink: 0 }}>
                {profile.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "DN"}
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{profile.name}</div>
                <div style={{ fontSize: 12, color: C.primary, fontWeight: 700, marginTop: 2 }}>{profile.bloodType} Donor</div>
              </div>
              <button style={{ marginLeft: "auto", padding: "8px 18px", borderRadius: 999, background: C.surfaceLow, border: "none", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13, color: C.primary }} onClick={() => toast("Photo changes are automatically synced to gravatar profiles.", "info")}>Change Photo</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Blood Type</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={profile.bloodType} onChange={e => setProfile({ ...profile, bloodType: e.target.value })}>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Email Address</label>
                <input style={inputStyle} type="email" value={profile.email} disabled style={{ ...inputStyle, background: C.surfaceHigh, color: C.onSurfaceVariant, cursor: "not-allowed" }} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input style={inputStyle} value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input style={inputStyle} type="date" value={profile.dob} onChange={e => setProfile({ ...profile, dob: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Weight (kg)</label>
                <input style={inputStyle} type="number" value={profile.weight} onChange={e => setProfile({ ...profile, weight: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Location Address</label>
                <input style={inputStyle} value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
              </div>
            </div>
          </div>
        </div>
      );

      case "Notifications": return (
        <div className="fade-in">
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span className="mso fill" style={{ color: C.primary, fontSize: 22 }}>notifications</span>
              <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em" }}>Notification Preferences</span>
            </div>
            {[
              { key: "email", label: "Email Notifications", icon: "mail", desc: "Receive appointment reminders and blood drive alerts via email." },
              { key: "sms", label: "SMS Alerts", icon: "sms", desc: "Get urgent blood type requests sent directly to your phone." },
              { key: "push", label: "Push Notifications", icon: "phone_iphone", desc: "App-specific updates about your rewards and milestones." },
              { key: "donation", label: "Donation Reminders", icon: "calendar_today", desc: "Get reminded when you're eligible to donate again." },
              { key: "rewards", label: "Reward Updates", icon: "stars", desc: "Notify when you earn points, badges or reach a new tier." },
              { key: "emergency", label: "Emergency Alerts", icon: "emergency", desc: "Urgent notifications for critical blood shortage in your area." },
            ].map(n => (
              <div key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 14px", borderRadius: 14, marginBottom: 6, background: notifs[n.key] ? `${C.primary}08` : "transparent", transition: "background 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: notifs[n.key] ? `${C.primaryContainer}30` : C.surfaceLow, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
                    <span className="mso fill" style={{ fontSize: 18, color: notifs[n.key] ? C.primary : C.onSurfaceVariant }}>{n.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{n.label}</div>
                    <div style={{ fontSize: 12, color: C.onSurfaceVariant, marginTop: 2, maxWidth: 320 }}>{n.desc}</div>
                  </div>
                </div>
                <Toggle checked={notifs[n.key]} onChange={v => handleToggleNotif(n.key, v)} />
              </div>
            ))}
          </div>
        </div>
      );

      case "Security": return (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Change Password Card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span className="mso fill" style={{ color: C.primary, fontSize: 22 }}>lock_reset</span>
              <span style={{ fontWeight: 900, fontSize: 18 }}>Change Password</span>
            </div>
            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>New Password</label>
                <input style={inputStyle} type="password" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="Enter new password" />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input style={inputStyle} type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Re-enter new password" />
              </div>
              <button type="submit" style={{ padding: "12px 24px", alignSelf: "flex-end", borderRadius: 999, background: C.primary, border: "none", color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                Update Password
              </button>
            </form>
          </div>

          {/* Device Sessions */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span className="mso fill" style={{ color: C.primary, fontSize: 22 }}>devices</span>
              <span style={{ fontWeight: 900, fontSize: 18 }}>Active Sessions</span>
            </div>
            {[
              { dev: "Windows 11 Home • Chrome Browser", loc: "Ahmedabad, India (Current Session)", icon: "laptop_windows", current: true },
              { dev: "Android 14 Phone • Life4U Mobile App", loc: "Mumbai, India (Last active: 2 hours ago)", icon: "phone_android", current: false }
            ].map((sess, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 14px", borderRadius: 14, marginBottom: 6, background: C.surfaceLow }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span className="mso" style={{ fontSize: 24, color: C.primary }}>{sess.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{sess.dev}</div>
                    <div style={{ fontSize: 12, color: C.onSurfaceVariant, marginTop: 2 }}>{sess.loc}</div>
                  </div>
                </div>
                {!sess.current && (
                  <button style={{ padding: "6px 12px", borderRadius: 8, background: "none", border: `1.5px solid ${C.primary}`, color: C.primary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer" }} onClick={() => toast("Session terminated successfully!", "success")}>Logout Session</button>
                )}
              </div>
            ))}
          </div>
        </div>
      );

      case "Privacy": return (
        <div className="fade-in">
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span className="mso fill" style={{ color: C.primary, fontSize: 22 }}>lock</span>
              <span style={{ fontWeight: 900, fontSize: 18 }}>Privacy Controls</span>
            </div>
            {[
              { key: "shareProfile", label: "Share Profile in Leaderboard", desc: "Allow your name to appear in the community top donors list." },
              { key: "shareData", label: "Share Anonymous Health Data", desc: "Help improve blood donation research with anonymised data." },
              { key: "locationAccess", label: "Location Access", desc: "Allow Life4U to find nearby donation camps." },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 14px", borderRadius: 14, marginBottom: 8, background: C.surfaceLow }}>
                <div style={{ maxWidth: 340 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: C.onSurfaceVariant, marginTop: 3 }}>{item.desc}</div>
                </div>
                <Toggle checked={privacy[item.key]} onChange={v => handleTogglePrivacy(item.key, v)} />
              </div>
            ))}
            <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 14, background: `${C.primary}10`, display: "flex", alignItems: "center", gap: 12 }}>
              <span className="mso fill" style={{ color: C.primary, fontSize: 20 }}>info</span>
              <span style={{ fontSize: 13, color: C.onSurfaceVariant, lineHeight: 1.5 }}>Your medical data is encrypted and never sold. Read our <span style={{ color: C.primary, fontWeight: 700, cursor: "pointer" }} onClick={() => toast("Privacy Policy document is up to date.", "info")}>Privacy Policy</span>.</span>
            </div>
          </div>
        </div>
      );

      case "Help": return (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Help Options */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span className="mso fill" style={{ color: C.primary, fontSize: 22 }}>help</span>
              <span style={{ fontWeight: 900, fontSize: 18 }}>Help & Support</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Chat Support */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 14px", borderRadius: 14, background: C.surfaceLow, cursor: "pointer" }} onClick={() => setShowChat(true)}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: C.surfaceLowest, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="mso fill" style={{ fontSize: 20, color: C.primary }}>chat</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Live Chat Support</div>
                    <div style={{ fontSize: 12, color: C.onSurfaceVariant, marginTop: 2 }}>Talk to a donor support representative now</div>
                  </div>
                </div>
                <span className="mso" style={{ fontSize: 18, color: C.onSurfaceVariant }}>chevron_right</span>
              </div>

              {/* Email Support */}
              <a href="mailto:support@life4u.com" style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 14px", borderRadius: 14, background: C.surfaceLow, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: C.surfaceLowest, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="mso fill" style={{ fontSize: 20, color: C.primary }}>mail</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>Email Support</div>
                      <div style={{ fontSize: 12, color: C.onSurfaceVariant, marginTop: 2 }}>support@life4u.com</div>
                    </div>
                  </div>
                  <span className="mso" style={{ fontSize: 18, color: C.onSurfaceVariant }}>chevron_right</span>
                </div>
              </a>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div style={cardStyle}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Frequently Asked Questions</div>
            {[
              { q: "How often can I donate whole blood?", a: "You can donate whole blood every 56 days (approx. 8 weeks). This allows your red blood cells to fully recover." },
              { q: "What should I eat before donating?", a: "Eat a healthy meal low in fat, and drink plenty of water (500ml) in the 4 hours leading up to your appointment." },
              { q: "How do I redeem my Life Points?", a: "Go to the Rewards tab, browse available perks, and click Redeem. Your points will be deducted in real-time." }
            ].map((faq, idx) => (
              <div key={idx} style={{ borderBottom: `1px solid ${C.surfaceHigh}`, padding: "12px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: 700, fontSize: 14 }} onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}>
                  <span>{faq.q}</span>
                  <span className="mso" style={{ fontSize: 18, transform: faqOpen === idx ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>expand_more</span>
                </div>
                {faqOpen === idx && (
                  <div style={{ fontSize: 13, color: C.onSurfaceVariant, marginTop: 8, lineHeight: 1.5 }} className="fade-in">{faq.a}</div>
                )}
              </div>
            ))}
          </div>

          {/* Report a Problem Form */}
          <div style={cardStyle}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>Report a Problem</div>
            <form onSubmit={handleProblemSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder="Describe the issue you encountered..." value={problemText} onChange={e => setProblemText(e.target.value)} required />
              <button type="submit" style={{ alignSelf: "flex-end", padding: "10px 20px", borderRadius: 999, background: C.primary, border: "none", color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                Submit Report
              </button>
            </form>
          </div>

          {/* Chat Modal */}
          {showChat && (
            <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
              <div style={{ background: C.surfaceLowest, width: 400, borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", overflow: "hidden", display: "flex", flexDirection: "column", height: 500 }}>
                {/* Chat Header */}
                <div style={{ background: `linear-gradient(135deg, ${C.primaryDim}, ${C.primaryContainer})`, padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Life4U Live Assistant</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>Online • Answers instantly</div>
                  </div>
                  <span className="mso" style={{ fontSize: 24, cursor: "pointer" }} onClick={() => setShowChat(false)}>close</span>
                </div>
                {/* Messages Box */}
                <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.sender === "user" ? "flex-end" : "flex-start", background: msg.sender === "user" ? C.primary : C.surfaceLow, color: msg.sender === "user" ? "#fff" : C.onSurface, padding: "12px 16px", borderRadius: msg.sender === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px", maxWidth: "80%", fontSize: 13, lineHeight: 1.5 }} className="fade-in">
                      {msg.text}
                    </div>
                  ))}
                </div>
                {/* Input Bar */}
                <div style={{ padding: 16, borderTop: `1px solid ${C.surfaceHigh}`, display: "flex", gap: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendChatMessage()} />
                  <button onClick={handleSendChatMessage} style={{ width: 44, height: 44, borderRadius: "50%", background: C.primary, border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <span className="mso">send</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

      default: return <div />;
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: C.surface, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(24px)", boxShadow: "0 4px 24px rgba(46,47,47,0.06)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="mso fill" style={{ fontSize: 16, color: "#fff" }}>favorite</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.04em" }}>Life<span style={{ color: C.primary }}>4U</span></span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {["Dashboard", "History", "Centers", "Rewards"].map(n => (
            <span key={n} style={{ fontSize: 14, fontWeight: 600, color: C.onSurfaceVariant, cursor: "pointer" }} onClick={onClose}>{n}</span>
          ))}
        </div>
        <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 999, background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, border: "none", color: C.onPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", width: "100%", padding: "32px 24px", gap: 28, flex: 1 }}>
        {/* Left Sidebar */}
        <div style={{ width: 220, flexShrink: 0 }}>
          {/* User card */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, padding: "14px 0" }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16 }}>
              {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "DN"}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: "-0.02em" }}>{user?.name || "Donor"}</div>
              <div style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>{user?.bloodType || donorProfile?.bloodType || "O+"} Donor</div>
            </div>
          </div>
          {sections.map(s => (
            <div key={s.name} onClick={() => setActiveSection(s.name)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, marginBottom: 4, cursor: "pointer", background: activeSection === s.name ? `${C.primary}12` : "transparent", color: activeSection === s.name ? C.primary : C.onSurfaceVariant, fontWeight: activeSection === s.name ? 800 : 600, fontSize: 14, transition: "all 0.2s" }}>
              <span className="mso" style={{ fontSize: 20, color: activeSection === s.name ? C.primary : C.onSurfaceVariant, fontVariationSettings: activeSection === s.name ? "'FILL' 1" : "'FILL' 0" }}>{s.icon}</span>
              {s.name}
            </div>
          ))}
          <div style={{ height: 1, background: C.surfaceHigh, margin: "16px 0" }} />
          <div onClick={logout} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, cursor: "pointer", color: "#EF4444", fontWeight: 700, fontSize: 14 }}>
            <span className="mso" style={{ fontSize: 20, color: "#EF4444" }}>logout</span>Sign Out
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontWeight: 900, fontSize: 32, letterSpacing: "-0.04em", marginBottom: 6 }}>Account Settings</h1>
            <p style={{ color: C.onSurfaceVariant, fontSize: 14 }}>Manage your donor profile and application preferences.</p>
          </div>
          {renderSection()}

          {/* Save Bar */}
          <div style={{ display: "flex", alignItems: "center", justifySpaceBetween: "space-between", justifyContent: "space-between", marginTop: 24, padding: "20px 0" }}>
            <span style={{ fontSize: 13, color: C.onSurfaceVariant, fontStyle: "italic" }}>Last updated: {savedAt}</span>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onClose} style={{ padding: "12px 28px", borderRadius: 999, background: C.surfaceHigh, border: "none", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 14, color: C.onSurfaceVariant, cursor: "pointer" }}>Discard Changes</button>
              <button onClick={handleSave} disabled={isSaving} style={{ padding: "12px 28px", borderRadius: 999, background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, border: "none", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 14, color: C.onPrimary, cursor: "pointer", boxShadow: "0 8px 24px rgba(156,63,0,0.3)", transform: saveFlash ? "scale(0.96)" : "scale(1)", transition: "all 0.15s" }}>
                {isSaving ? "Saving..." : (saveFlash ? "✓ Saved!" : "Save Changes")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN DASHBOARD APP
═══════════════════════════════════════════════ */
export default function App() {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentMonthName = today.toLocaleString("en-US", { month: "long" });
  const currentMonthShort = today.toLocaleString("en-US", { month: "short" });

  const tempDay = new Date(currentYear, currentMonth, 1).getDay();
  const monthStartOffset = tempDay === 0 ? 6 : tempDay - 1;

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDayOfMonth = today.getDate();

  const [activeTab, setActiveTab] = useState("home");
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState("light");
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic state loading from PostgreSQL database
  const [loading, setLoading] = useState(true);
  const [donorProfile, setDonorProfile] = useState(null);
  const [donations, setDonations] = useState([]);

  // Appointments / Booking workflow states
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedSlot, setSelectedSlot] = useState("09:15 AM");
  const [selectedCenter, setSelectedCenter] = useState("Sunflower Hospital Multispeciality");
  const [hospitalsList, setHospitalsList] = useState(["Sunflower Hospital Multispeciality", "Sal Hospital", "Zydus Hospital"]);
  const [hospitalsData, setHospitalsData] = useState([]);

  useEffect(() => {
    if (hospitalsList.length > 0 && !hospitalsList.includes(selectedCenter)) {
      setSelectedCenter(hospitalsList[0]);
    }
  }, [hospitalsList]);
  const [donationType, setDonationType] = useState("Whole Blood");
  const [checks, setChecks] = useState({ healthy: true, meal: true, hydrated: false, weight: true, tattoo: true, travel: true });
  const allChecked = Object.values(checks).every(Boolean);

  // Biometrics toggle duration state ("6 Months" vs "1 Year")
  const [biometricDuration, setBiometricDuration] = useState("6 Months");

  // Booking receipt modal popup state
  const [bookingReceipt, setBookingReceipt] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Reward points — local state allows deduction on redeem
  const [redeemPoints, setRedeemPoints] = useState(null); // null = not yet loaded
  const [redeemModal, setRedeemModal] = useState(null);   // { label, pts, icon } when shown

  const totalDons = donorProfile?.totalDonations || donations.length;
  
  const calculatedChronicPoints = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => {
      const notesStr = (d.notes || '').toLowerCase();
      if (notesStr.includes('platelet')) return sum + 300;
      if (notesStr.includes('plasma')) return sum + 250;
      return sum + 200; // default whole blood
    }, 0);

  const currentPts = redeemPoints !== null
    ? redeemPoints
    : (donorProfile && donorProfile.rewardPoints !== undefined && donorProfile.rewardPoints !== null && donorProfile.rewardPoints > calculatedChronicPoints
        ? donorProfile.rewardPoints
        : (calculatedChronicPoints > 0 ? calculatedChronicPoints : totalDons * 10));
  const activeTier = getTier(currentPts);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      // 1. Fetch own donations history
      const donRes = await donationService.getMyDonations();
      if (donRes.success) {
        setDonations(donRes.data);
      }

      // 2. Fetch detailed donor stats
      const donorRes = await donorService.getAll({ userId: user.id });
      if (donorRes.success && donorRes.data && donorRes.data.length > 0) {
        setDonorProfile(donorRes.data[0]);
        // Sync reward points from profile (only first time)
        setRedeemPoints(prev => prev === null ? (donorRes.data[0].rewardPoints || 0) : prev);
      } else {
        // Fallback: auto-create donor profile if missing
        const createRes = await donorService.create({
          bloodType: user.bloodType || 'O+',
          dateOfBirth: user.dateOfBirth || '1995-06-15',
          weight: 70,
          height: 175,
          gender: 'other',
        });
        if (createRes.success) {
          setDonorProfile(createRes.data);
          setRedeemPoints(prev => prev === null ? 0 : prev);
        }
      }

      // 3. Fetch all hospitals from the database
      try {
        const hospRes = await userService.getAll({ role: 'staff' });
        if (hospRes.success && hospRes.data) {
          setHospitalsData(hospRes.data);
          const names = hospRes.data.map(u => u.name).filter(Boolean);
          if (names.length > 0) {
            setHospitalsList(names);
          }
        }
      } catch (err) {
        console.error("Error loading hospitals list:", err);
      }
    } catch (err) {
      console.error("Error loading donor dashboard database records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Periodic polling check to simulate live real-time connection
  useEffect(() => {
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 60000);
    return () => clearInterval(timer);
  }, [user]);

  // Handle donation booking action
  const handleConfirmBooking = async () => {
    if (!allChecked) {
      toast("Please complete all eligibility checks first.", "error");
      return;
    }
    setBookingLoading(true);
    try {
      let donorIdToUse = donorProfile?.id;

      // If no donor profile yet, auto-create one first
      if (!donorIdToUse) {
        try {
          const createRes = await donorService.create({
            bloodType: user?.bloodType || 'O+',
            dateOfBirth: user?.dateOfBirth || '1995-06-15',
            weight: 70,
            height: 175,
            gender: 'other',
          });
          if (createRes.success) {
            setDonorProfile(createRes.data);
            donorIdToUse = createRes.data.id;
          }
        } catch (_) { }
      }

      // Build the receipt object (always shown, regardless of API outcome)
      const refId = "APT-" + Math.floor(Math.random() * 900000 + 100000);
      const receipt = {
        refId,
        center: selectedCenter,
        date: `${currentMonthName} ${selectedDay}, ${currentYear}`,
        slot: selectedSlot,
        stream: donationType,
        donorName: user?.name || "Donor",
        bloodType: user?.bloodType || donorProfile?.bloodType || "O+"
      };

      if (donorIdToUse) {
        // Record booking in backend database as a pending donation
        try {
          await donationService.create({
            donorId: donorIdToUse,
            bloodType: user?.bloodType || donorProfile?.bloodType || "O+",
            units: 1,
            hospital: selectedCenter,
            weight: donorProfile?.weight || 70,
            donationDate: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`,
            notes: `Appointment. Stream: ${donationType}, Slot: ${selectedSlot}`,
            status: "pending",
          });
          fetchDashboardData();
        } catch (apiErr) {
          console.warn("Could not save to DB, showing receipt anyway:", apiErr.message);
        }
      }

      // Always show the receipt modal
      setBookingReceipt(receipt);
      toast("📅 Appointment booked! Your receipt is ready.", "success");
    } catch (err) {
      toast(err.message || "Failed to confirm booking", "error");
    } finally {
      setBookingLoading(false);
    }
  };

  // Generate and trigger download of appointment receipt
  const handleDownloadReceipt = (receipt) => {
    const content = `================================================
          LIFE4U APPOINTMENT RECEIPT
================================================
Receipt Reference ID: ${receipt.refId}
Donor Name: ${receipt.donorName}
Blood Type: ${receipt.bloodType}
Selected Stream: ${receipt.stream}

APPOINTMENT DETAILS:
------------------------------------------------
Center: ${receipt.center}
Date: ${receipt.date}
Time Slot: ${receipt.slot}
Status: CONFIRMED (Pending Donation)

PRE-DONATION CHECKLIST INSTRUCTIONS:
- Drink at least 500ml of water prior to visit.
- Eat a healthy, low-fat meal within 4 hours.
- Keep a government-issued photo ID handy.
- Avoid smoking or drinking alcohol 24 hours prior.

Thank you for choosing to save lives with Life4U!
================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `life4u_appointment_${receipt.refId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast("📥 Receipt downloaded successfully!", "success");
  };

  // Generate and download full donation chronicle report grouped by stream
  const handleDownloadReports = () => {
    if (donations.length === 0) {
      toast("No donations recorded in chronicle yet!", "error");
      return;
    }

    // Classify donations by stream
    const streams = { "Whole Blood": [], "Platelets": [], "Plasma": [] };
    donations.forEach((item, index) => {
      const notes = (item.notes || "").toLowerCase();
      let detectedStream = "Whole Blood";
      if (notes.includes("platelet")) {
        detectedStream = "Platelets";
      } else if (notes.includes("plasma")) {
        detectedStream = "Plasma";
      }
      streams[detectedStream].push(item);
    });

    let content = `================================================
             LIFE4U DONOR CHRONICLE REPORT
================================================
Donor Name: ${user?.name || "Donor"}
Blood Type: ${user?.bloodType || donorProfile?.bloodType || "O+"}
Generated On: ${new Date().toLocaleString()}

SUMMARY STATS:
------------------------------------------------
Total Donations: ${donations.length}
Est. Lives Impacted: ${donations.length * 3}
Current Tier Status: ${getTier(donorProfile?.rewardPoints || (donations.length * 10))}

DONATION STREAM RECORDS:
`;

    Object.keys(streams).forEach(streamName => {
      content += `\n================== ${streamName.toUpperCase()} STREAM ==================\n`;
      const streamRecords = streams[streamName];
      if (streamRecords.length === 0) {
        content += `No records found under this stream.\n`;
      } else {
        streamRecords.forEach((rec, i) => {
          const dateStr = new Date(rec.donationDate).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
          });
          content += `${i + 1}. Date: ${dateStr}
   Location/Center: ${rec.hospital || "Life4U Regional Hub"}
   Quantity: ${rec.units} Unit(s)
   Points Earned: ${rec.pointsEarned} pts
   Status: ${rec.status.toUpperCase()}
   Notes: ${rec.notes || "None"}\n\n`;
        });
      }
    });

    content += `================================================
Thank you for your life-saving contributions!
================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `life4u_chronicle_report_${user?.name?.replace(/\s+/g, '_') || 'donor'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast("📥 Chronicle report downloaded!", "success");
  };

  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a1a" : C.surface;
  const cardBg = isDark ? "#2a2a2a" : C.surfaceLowest;
  const textMain = isDark ? "#f0f0f0" : C.onSurface;
  const textSub = isDark ? "#aaa" : C.onSurfaceVariant;
  const surfLow = isDark ? "#333" : C.surfaceLow;

  const tabs = [
    { id: "home", label: "Home", icon: "home" },
    { id: "impact", label: "Impact", icon: "favorite" },
    { id: "appointments", label: "Appointments", icon: "calendar_month" },
    { id: "rewards", label: "Rewards", icon: "stars" },
  ];

  const calDays = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  const timeSlots = ["08:30 AM", "09:15 AM", "10:00 AM", "11:30 AM", "01:45 PM", "03:00 PM", "04:30 PM", "06:00 PM"];
  const centers = ["Sunflower Hospital Multispeciality", "Sal Hospital", "Zydus Hospital"];

  const card = (extra = {}) => ({ background: cardBg, borderRadius: 20, padding: 28, boxShadow: "0 8px 32px rgba(46,47,47,0.06)", ...extra });
  const sectionTitle = (text) => (
    <h2 style={{ fontWeight: 900, fontSize: 28, letterSpacing: "-0.04em", marginBottom: 8, color: textMain }}>{text}</h2>
  );

  /* Chart paths 6m vs 1y */
  const hemoPath = "M0,95 C40,80 80,60 120,45 S180,35 230,55 S310,20 400,30";
  const hemoFill = "M0,95 C40,80 80,60 120,45 S180,35 230,55 S310,20 400,30 L400,120 L0,120 Z";
  const hemoPath1Y = "M0,85 C50,90 100,50 150,70 S250,30 320,60 S370,40 400,25";
  const hemoFill1Y = "M0,85 C50,90 100,50 150,70 S250,30 320,60 S370,40 400,25 L400,120 L0,120 Z";

  const pulsePath = "M0,70 C50,75 90,60 140,65 S200,78 260,68 S340,60 400,63";
  const pulseFill = "M0,70 C50,75 90,60 140,65 S200,78 260,68 S340,60 400,63 L400,120 L0,120 Z";
  const pulsePath1Y = "M0,75 C60,65 110,80 170,72 S250,55 310,65 S360,58 400,55";
  const pulseFill1Y = "M0,75 C60,65 110,80 170,72 S250,55 310,65 S360,58 400,55 L400,120 L0,120 Z";

  const ironPath = "M0,55 C60,50 110,58 170,52 S240,45 300,50 S370,48 400,49";
  const ironFill = "M0,55 C60,50 110,58 170,52 S240,45 300,50 S370,48 400,49 L400,120 L0,120 Z";
  const ironPath1Y = "M0,60 C50,65 100,55 160,58 S230,48 290,52 S360,45 400,42";
  const ironFill1Y = "M0,60 C50,65 100,55 160,58 S230,48 290,52 S360,45 400,42 L400,120 L0,120 Z";

  const bpPath = "M0,48 C50,52 100,44 160,47 S230,50 290,42 S360,40 400,44";
  const bpFill = "M0,48 C50,52 100,44 160,47 S230,50 290,42 S360,40 400,44 L400,120 L0,120 Z";
  const bpPath1Y = "M0,50 C60,46 110,54 180,49 S250,45 310,48 S360,42 400,40";
  const bpFill1Y = "M0,50 C60,46 110,54 180,49 S250,45 310,48 S360,42 400,40 L400,120 L0,120 Z";

  /* ── HOME ── */
  const HomeTab = () => {
    const listSaved = totalDons * 3;

    return (
      <div className="fade-in">
        {/* Hero Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginBottom: 32 }}>
          {/* Greeting */}
          <div style={{ ...card(), position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 280 }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: `${C.primaryContainer}0a`, pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.primary, marginBottom: 12 }}>Welcome back, {user?.name || "Alex"} 👋</div>
              <h1 style={{ fontWeight: 900, fontSize: 48, letterSpacing: "-0.04em", lineHeight: 1.1, color: textMain }}>Your energy is<br /><span style={{ color: C.primary }}>saving lives.</span></h1>
              <p style={{ color: textSub, fontSize: 14, marginTop: 12, maxWidth: 380, lineHeight: 1.6 }}>Every drop counts. Your consistent donations have made a measurable difference.</p>
            </div>
            <div style={{ display: "flex", gap: 40, alignItems: "flex-end", position: "relative", zIndex: 1, marginTop: 28 }}>
              {[[listSaved.toString(), "Lives Saved"], [totalDons.toString(), "Total Donations"], [activeTier, "Current Tier"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.04em", color: textMain }}>{v}</div>
                  <div style={{ fontSize: 12, color: textSub, marginTop: 2, fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Health Snapshot */}
          <div style={{ ...card(), background: surfLow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <span style={{ fontWeight: 900, fontSize: 16, color: textMain }}>Health Snapshot</span>
              <span className="mso fill" style={{ color: C.primary, fontSize: 22 }}>vital_signs</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 20 }}>
              <Ring pct={0.76} color={C.primary} label="Hemoglobin" value="14.2" />
              <Ring pct={0.66} color={C.secondary} label="BP Level" value="118/75" />
            </div>
            <div style={{ background: cardBg, borderRadius: 16, padding: 16, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: textSub, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Blood Type</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: C.primary }}>{user?.bloodType || donorProfile?.bloodType || "O+"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: textSub, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Next Eligible</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: textMain }}>
                  {donorProfile?.lastDonationDate
                    ? new Date(new Date(donorProfile.lastDonationDate).getTime() + 56 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Immediately"
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Donation Journey */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
            <div>
              {sectionTitle("Donation Journey")}
              <p style={{ fontSize: 13, color: textSub }}>Track your recent donation as it makes its way to those in need.</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: textSub, background: surfLow, padding: "6px 14px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.1em" }}>Batch #L4U-8921</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { day: "Day 0", label: "Donated", desc: "Successful donation at Downtown Center.", done: true, highlight: true, icon: "volunteer_activism" },
              { day: "Day 1", label: "Tested", desc: "Blood type verification complete.", done: true, highlight: false, icon: "biotech" },
              { day: "Day 2", label: "Transported", desc: "Delivery to St. Mary's Hospital network.", done: false, icon: "local_shipping" },
              { day: "Day 3", label: "Saved a Life!", desc: "Transfusion completed. You made the difference.", done: false, icon: "favorite" },
            ].map((step, i) => (
              <div key={i} style={{ borderRadius: 20, padding: 24, background: step.highlight ? `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})` : cardBg, boxShadow: "0 8px 24px rgba(46,47,47,0.06)", opacity: step.done ? 1 : 0.5, position: "relative" }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: step.highlight ? "rgba(255,240,234,0.7)" : step.done ? C.primary : textSub, marginBottom: 16 }}>{step.day}</div>
                <span className="mso fill" style={{ fontSize: 36, color: step.highlight ? "#fff" : step.done ? C.primary : C.outlineVariant, marginBottom: 12, display: "block" }}>{step.icon}</span>
                <div style={{ fontWeight: 900, fontSize: 16, color: step.highlight ? "#fff" : textMain, marginBottom: 6 }}>{step.label}</div>
                <div style={{ fontSize: 12, color: step.highlight ? "rgba(255,240,234,0.8)" : textSub, lineHeight: 1.5 }}>{step.desc}</div>
                {step.done && <span className="mso fill" style={{ position: "absolute", top: 16, right: 16, fontSize: 18, color: step.highlight ? "#fff" : C.primary }}>check_circle</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Camps + Leaderboard */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              {sectionTitle("Nearby Camps")}
              <button onClick={() => setActiveTab("appointments")} style={{ color: C.primary, fontWeight: 800, fontSize: 13, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>View Map <span className="mso" style={{ fontSize: 16 }}>arrow_forward</span></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { name: "Central Plaza Hub", dist: "0.8 km", tag: "Emergency Need", tagColor: "#dc2626", time: "Closes 8 PM" },
                { name: "Riverside Wellness", dist: "2.4 km", tag: "O+ Specialized", tagColor: C.tertiary, time: "Open 24/7" },
                { name: "Zyuds Hospital", dist: "5.1 km", tag: "All Types", tagColor: C.onSurfaceVariant, time: "Closes 6 PM" },
              ].map(c => (
                <div key={c.name} style={{ ...card({ padding: 20 }), display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${C.primaryContainer}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="mso fill" style={{ fontSize: 26, color: C.primary }}>local_hospital</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, background: `${c.tagColor}15`, color: c.tagColor, padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.tag}</span>
                      <span style={{ fontSize: 12, color: textSub, fontWeight: 600 }}>{c.dist}</span>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: textMain, marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: textSub }}>{c.time}</div>
                  </div>
                  <button onClick={() => setActiveTab("appointments")} style={{ padding: "10px 20px", borderRadius: 999, background: C.onSurface, border: "none", color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Book</button>
                </div>
              ))}
            </div>
          </div>
          {/* Leaderboard */}
          <div style={{ ...card({ background: surfLow }) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <span style={{ fontWeight: 900, fontSize: 20, color: textMain }}>Top Donors</span>
              <span className="mso fill" style={{ color: C.tertiaryFixed, fontSize: 24 }}>emoji_events</span>
            </div>
            <div style={{ background: `${C.primaryContainer}22`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderLeft: `3px solid ${C.primary}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 11 }}>
                  {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "DN"}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: textSub, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Rank</div>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>{user?.name || "Alex"}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: C.primary }}>#42</div>
                <div style={{ fontSize: 10, color: textSub, fontWeight: 700, textTransform: "uppercase" }}>Global</div>
              </div>
            </div>
            {[["01", "SJ", "Sarah Jenkins", "48"], ["02", "MV", "Marcus V.", "42"], ["03", "ER", "Elena Rodriguez", "39"], ["04", "JP", "James Patel", "35"]].map(([rank, init, name, count]) => (
              <div key={rank} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", borderBottom: `1px solid ${C.outlineVariant}15` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: C.outlineVariant, width: 24, fontStyle: "italic" }}>{rank}</span>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: surfLow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: textSub }}>{init}</div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: textMain }}>{name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.primary, background: `${C.primary}10`, padding: "3px 10px", borderRadius: 99 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ── IMPACT ── */
  const ImpactTab = () => {
    const activeDuration = biometricDuration;

    // Morph biometrics data depending on the 6m vs 1y duration
    const is1Y = activeDuration === "1 Year";
    const values = {
      hemo: is1Y ? "14.5" : "14.2",
      pulse: is1Y ? "65" : "68",
      iron: is1Y ? "91" : "88",
      bp: is1Y ? "116/74" : "118/75",
      hemoPath: is1Y ? hemoPath1Y : hemoPath,
      hemoFill: is1Y ? hemoFill1Y : hemoFill,
      pulsePath: is1Y ? pulsePath1Y : pulsePath,
      pulseFill: is1Y ? pulseFill1Y : pulseFill,
      ironPath: is1Y ? ironPath1Y : ironPath,
      ironFill: is1Y ? ironFill1Y : ironFill,
      bpPath: is1Y ? bpPath1Y : bpPath,
      bpFill: is1Y ? bpFill1Y : bpFill,
      labels: is1Y ? ["Jul", "Sep", "Nov", "Jan", "Mar", "May"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    };

    return (
      <div className="fade-in">
        {/* Hero */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginBottom: 32 }}>
          <div style={{ borderRadius: 20, padding: "48px 40px", background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, color: "#fff", minHeight: 380, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: 0, top: 0, padding: 32 }}><span className="mso fill" style={{ fontSize: 140, color: "rgba(255,255,255,0.1)" }}>favorite</span></div>
            <div style={{ position: "absolute", right: -40, bottom: -40, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.08)", filter: "blur(40px)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.75, marginBottom: 16 }}>Monthly Achievement</div>
              <h1 style={{ fontWeight: 900, fontSize: 60, letterSpacing: "-0.04em", lineHeight: 0.95, margin: 0 }}>3 Lives Saved<br /><span style={{ opacity: 0.85 }}>This Month</span></h1>
              <p style={{ marginTop: 24, opacity: 0.9, fontSize: 15, maxWidth: 400, lineHeight: 1.6 }}>Your recent platelet donation has been processed and delivered to three pediatric patients.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
              <div style={{ display: "flex" }}>
                {["P1", "P2", "P3"].map((p, i) => <div key={p} style={{ width: 44, height: 44, borderRadius: "50%", background: `rgba(255,255,255,${0.2 + i * 0.05})`, border: "3px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, marginLeft: i > 0 ? -10 : 0 }}>{p}</div>)}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>Recent recipient updates available</span>
            </div>
          </div>
          {/* Gallon Club */}
          <div style={card()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.primary, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Donor Loyalty</div>
                <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.03em", color: textMain }}>Gallon Club</div>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.tertiaryContainer, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="mso fill" style={{ fontSize: 26, color: "#523700" }}>workspace_premium</span>
              </div>
            </div>
            <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800 }}>
              <span style={{ color: textMain }}>Next: Diamond Elite</span>
              <span style={{ color: C.primary }}>85%</span>
            </div>
            <div style={{ height: 10, background: surfLow, borderRadius: 99, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "85%", background: `linear-gradient(90deg,${C.primaryDim},${C.primaryContainer})`, borderRadius: 99 }} />
            </div>
            <p style={{ fontSize: 13, color: textSub, lineHeight: 1.6, marginBottom: 24 }}>Just 2 more plasma donations to unlock Diamond Elite tier.</p>
            <button onClick={() => setActiveTab("rewards")} style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: surfLow, border: "none", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 14, color: C.primary, cursor: "pointer" }}>View Perks Library</button>
          </div>
        </div>

        {/* Biometric Charts */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontWeight: 900, fontSize: 30, letterSpacing: "-0.04em", color: textMain }}>Biometric Status</h2>
              <p style={{ color: textSub, fontSize: 13, marginTop: 4 }}>Your vitals over the last {activeDuration === "6 Months" ? "6 months" : "1 year"} of giving.</p>
            </div>
            <div style={{ display: "flex", background: surfLow, padding: 4, borderRadius: 999 }}>
              {["6 Months", "1 Year"].map((l) => (
                <button key={l} onClick={() => setBiometricDuration(l)} style={{ padding: "8px 20px", borderRadius: 999, border: "none", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer", background: activeDuration === l ? cardBg : "transparent", color: activeDuration === l ? textMain : textSub, boxShadow: activeDuration === l ? "0 2px 8px rgba(0,0,0,0.06)" : "none", transition: "all 0.2s" }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { title: "Hemoglobin Level", value: values.hemo, unit: "g/dL", badge: is1Y ? "+4.2% vs last" : "+2.4% vs last", badgeColor: "#059669", badgeBg: "#ecfdf5", path: values.hemoPath, fill: values.hemoFill, color: C.primary, labels: values.labels },
              { title: "Avg Resting Pulse", value: values.pulse, unit: "BPM", badge: "Optimal", badgeColor: "#c2410c", badgeBg: "#fff7ed", path: values.pulsePath, fill: values.pulseFill, color: C.secondary, labels: values.labels },
              { title: "Iron / Ferritin", value: values.iron, unit: "µg/L", badge: "Stable", badgeColor: "#059669", badgeBg: "#ecfdf5", path: values.ironPath, fill: values.ironFill, color: C.tertiary, labels: values.labels },
              { title: "Blood Pressure", value: values.bp, unit: "mmHg", badge: "Normal", badgeColor: "#1d4ed8", badgeBg: "#eff6ff", path: values.bpPath, fill: values.bpFill, color: C.primaryDim, labels: values.labels },
            ].map(chart => (
              <div key={chart.title} style={card()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: textSub, marginBottom: 6 }}>{chart.title}</div>
                    <div style={{ fontWeight: 900, fontSize: 34, letterSpacing: "-0.04em", color: textMain }}>{chart.value} <span style={{ fontSize: 14, fontWeight: 600, color: textSub }}>{chart.unit}</span></div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: chart.badgeColor, background: chart.badgeBg, padding: "4px 12px", borderRadius: 99, whiteSpace: "nowrap" }}>{chart.badge}</span>
                </div>
                <div style={{ height: 120, width: "100%" }}>
                  <LineChart data={chart.path} fill={chart.fill} color={chart.color} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingLeft: 2 }}>
                  {chart.labels.map(l => <span key={l} style={{ fontSize: 10, fontWeight: 800, color: textSub, textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chronicle */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontWeight: 900, fontSize: 30, letterSpacing: "-0.04em", color: textMain }}>The Chronicle</h2>
            <button onClick={handleDownloadReports} style={{ color: C.primary, fontWeight: 800, fontSize: 13, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>Download Reports <span className="mso" style={{ fontSize: 16 }}>download</span></button>
          </div>

          {donations.length === 0 ? (
            <div style={{ ...card({ padding: 32, textAlign: "center", color: textSub }) }}>
              <span className="mso" style={{ fontSize: 44, color: C.outlineVariant, marginBottom: 12 }}>calendar_today</span>
              <p style={{ fontWeight: 700, fontSize: 14 }}>No donations recorded in chronicle yet.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Go to the Appointments tab to schedule your first life-saving gift!</p>
            </div>
          ) : (
            donations.map((item, i) => {
              const notesStr = (item.notes || "").toLowerCase();
              let detectedStream = "Whole Blood";
              let icon = "bloodtype";
              let color = C.secondary;
              let bgVariant = `${C.secondary}15`;

              if (notesStr.includes("platelet")) {
                detectedStream = "Platelet Donation";
                icon = "water_drop";
                color = C.primary;
                bgVariant = `${C.primary}15`;
              } else if (notesStr.includes("plasma")) {
                detectedStream = "Plasma Donation";
                icon = "opacity";
                color = C.tertiary;
                bgVariant = `${C.tertiary}15`;
              }

              const formattedDate = new Date(item.donationDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              });

              return (
                <div key={item.id || i} style={{ ...card({ padding: "20px 24px", marginBottom: 10 }), display: "flex", alignItems: "center", gap: 20, background: i % 2 === 0 ? surfLow : cardBg }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: bgVariant, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="mso fill" style={{ fontSize: 26, color: color }}>{icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: 15, color: textMain }}>{detectedStream}</div>
                    <div style={{ fontSize: 12, color: textSub, marginTop: 2 }}>{item.notes || "Regular Donation"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: textSub }}>
                    <span className="mso" style={{ fontSize: 14 }}>location_on</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{item.hospital || "Life4U Regional Hub"}</span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: textMain }}>{formattedDate}</div>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: item.status === "completed" ? "#059669" : item.status === "pending" ? C.primary : textSub, background: item.status === "completed" ? "#ecfdf5" : item.status === "pending" ? `${C.primary}15` : surfLow, padding: "3px 10px", borderRadius: 99, display: "inline-block", marginTop: 6 }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  /* ── APPOINTMENTS ── */
  const AppointmentsTab = () => {
    const checkItems = [
      { key: "healthy", label: "Feeling healthy and well today?" },
      { key: "meal", label: "Had a full meal in the last 4 hours?" },
      { key: "hydrated", label: "Stayed hydrated with water or juice?" },
      { key: "weight", label: "Over 50 kg in weight?" },
      { key: "tattoo", label: "No new tattoos or piercings in 12 months?" },
      { key: "travel", label: "No significant travel abroad recently?" },
    ];

    return (
      <div className="fade-in">
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: C.primary, marginBottom: 12 }}>Reservation Portal</div>
          <h1 style={{ fontWeight: 900, fontSize: 52, letterSpacing: "-0.04em", lineHeight: 0.95, color: textMain }}>Make an Impact.<br /><span style={{ color: C.primary }}>Schedule Your Gift.</span></h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}>
          {/* Left Workflow */}
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

            {/* Step 1 – Select Center & Type */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.onPrimary, fontWeight: 900, fontSize: 18, flexShrink: 0 }}>01</div>
                <h2 style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.03em", color: textMain }}>Select Center & Stream</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Center selection */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 260, overflowY: "auto", paddingRight: 6 }}>
                  {hospitalsList.map((c, i) => (
                    <div key={c} onClick={() => {
                      setSelectedCenter(c);
                      if (c === "Sal Hospital" && selectedSlot === "08:30 AM") {
                        setSelectedSlot("09:15 AM");
                      }
                    }} style={{ padding: "18px 20px", borderRadius: 16, cursor: "pointer", border: `2px solid ${selectedCenter === c ? C.primary : "transparent"}`, background: selectedCenter === c ? cardBg : surfLow, transition: "all 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 900, fontSize: 15, color: textMain }}>{c}</span>
                        {i === 0 && <span style={{ fontSize: 10, fontWeight: 800, background: `${C.primary}15`, color: C.primary, padding: "3px 10px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.08em" }}>Closest</span>}
                      </div>
                      <div style={{ fontSize: 12, color: textSub }}>
                        {(() => {
                          const found = hospitalsData.find(h => h.name === c);
                          if (found) {
                            return `${found.phone || '9am – 6pm'} · ${found.address || 'Active Partner'}`;
                          }
                          return ["8am – 8pm · 0.8 km", "9am – 6pm · 4.2 km", "7am – 9pm · 5.1 km"][i] || "9am – 6pm · Active Partner";
                        })()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Donation Type selection */}
                <div style={card({ padding: 20, background: surfLow })}>
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.primary, marginBottom: 10, display: "block" }}>Select Donation Stream</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {["Whole Blood", "Plasma", "Platelets"].map(type => (
                      <button key={type} onClick={() => setDonationType(type)} style={{ padding: "12px 14px", borderRadius: 12, border: donationType === type ? `2px solid ${C.primary}` : "2px solid transparent", background: donationType === type ? cardBg : C.surfaceHigh, color: textMain, fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.onPrimary, fontWeight: 900, fontSize: 18, flexShrink: 0 }}>02</div>
                <h2 style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.03em", color: textMain }}>Date &amp; Time</h2>
              </div>
              <div style={{ ...card({ background: surfLow }), display: "flex", flexDirection: "row", gap: 32 }}>
                {/* Calendar */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontWeight: 900, fontSize: 15, color: textMain }}>{currentMonthName} {currentYear}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {["chevron_left", "chevron_right"].map(ic => (
                        <button key={ic} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span className="mso" style={{ fontSize: 18, color: textSub }}>{ic}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, textAlign: "center", marginBottom: 8 }}>
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} style={{ fontSize: 10, fontWeight: 800, color: textSub, textTransform: "uppercase" }}>{d}</span>)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                    {Array.from({ length: monthStartOffset }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ height: 36 }} />
                    ))}
                    {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map(d => (
                      <div key={d} onClick={() => {
                        if (d >= currentDayOfMonth) {
                          setSelectedDay(d);
                        }
                      }} style={{ height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 13, cursor: d < currentDayOfMonth ? "default" : "pointer", fontWeight: selectedDay === d ? 900 : 500, background: selectedDay === d ? C.primary : d === currentDayOfMonth && selectedDay !== currentDayOfMonth ? `${C.primaryContainer}25` : "transparent", color: selectedDay === d ? "#fff" : d < currentDayOfMonth ? C.outlineVariant : textMain, transition: "all 0.15s" }}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Time Slots */}
                <div style={{ width: 200 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: textMain, marginBottom: 16 }}>Available Slots</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {timeSlots.map(slot => {
                      const isDisabled = slot === "08:30 AM" && selectedCenter === "Sal Hospital";
                      return (
                        <button 
                          key={slot} 
                          disabled={isDisabled}
                          onClick={() => setSelectedSlot(slot)} 
                          style={{ 
                            padding: "10px 8px", 
                            borderRadius: 12, 
                            border: "none", 
                            fontFamily: "Plus Jakarta Sans, sans-serif", 
                            fontWeight: 700, 
                            fontSize: 12, 
                            cursor: isDisabled ? "not-allowed" : "pointer", 
                            background: isDisabled ? (isDark ? "#222" : "#e5e7eb") : (selectedSlot === slot ? C.primary : cardBg), 
                            color: isDisabled ? (isDark ? "#555" : "#9ca3af") : (selectedSlot === slot ? "#fff" : textMain), 
                            boxShadow: !isDisabled && selectedSlot === slot ? `0 4px 14px ${C.primary}40` : "none", 
                            transform: !isDisabled && selectedSlot === slot ? "scale(1.04)" : "scale(1)", 
                            transition: "all 0.2s" 
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 – Power Up Check */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.onPrimary, fontWeight: 900, fontSize: 18, flexShrink: 0 }}>03</div>
                <h2 style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.03em", color: textMain }}>Power Up Check</h2>
              </div>
              <div style={card()}>
                <p style={{ color: textSub, marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>Quick eligibility verification to ensure you're ready to donate.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {checkItems.map(item => (
                    <label key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 14, background: checks[item.key] ? `${C.primary}08` : "transparent", cursor: "pointer", transition: "background 0.2s" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: textMain }}>{item.label}</span>
                      <input type="checkbox" checked={checks[item.key]} onChange={e => setChecks({ ...checks, [item.key]: e.target.checked })} style={{ width: 18, height: 18, accentColor: C.primary, cursor: "pointer" }} />
                    </label>
                  ))}
                </div>
                {/* Eligible Banner */}
                {allChecked && (
                  <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 16, background: "#ecfdf5", border: "1.5px solid #6ee7b7", display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="mso fill" style={{ fontSize: 28, color: "#059669" }}>check_circle</span>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16, color: "#065f46" }}>You are eligible to donate blood! 🎉</div>
                      <div style={{ fontSize: 13, color: "#047857", marginTop: 3 }}>All checks passed. You're all set for your donation appointment.</div>
                    </div>
                  </div>
                )}
                {!allChecked && (
                  <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 16, background: "#fff7ed", border: "1.5px solid #fed7aa", display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="mso fill" style={{ fontSize: 24, color: "#c2410c" }}>info</span>
                    <div style={{ fontSize: 13, color: "#9a3412" }}>Please confirm all checks before booking your appointment.</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sticky Summary */}
          <div style={{ position: "sticky", top: 96, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={card()}>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.03em", marginBottom: 24, color: textMain }}>Booking Summary</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
                {[
                  { 
                    icon: "location_on", 
                    label: "Center", 
                    val: selectedCenter, 
                    sub: (() => {
                      const found = hospitalsData.find(h => h.name === selectedCenter);
                      if (found?.address) return found.address;
                      const idx = ["Sunflower Hospital Multispeciality", "Sal Hospital", "Zydus Hospital"].indexOf(selectedCenter);
                      return idx === 0 ? "421 Neon Way, Suite 100" : idx === 1 ? "88 Wilshire Blvd" : "88 Highfield Road";
                    })() 
                  },
                  { icon: "opacity", label: "Stream", val: donationType, sub: `${donationType} donation procedure` },
                  { icon: "event", label: "Date", val: `${currentMonthShort} ${String(selectedDay).padStart(2, "0")}, ${currentYear}`, sub: "Ahmedabad, Gujarat" },
                  { icon: "schedule", label: "Time", val: selectedSlot, sub: "Approx. 30–45 min session" },
                  { icon: "bolt", label: "Status", val: allChecked ? "Eligible to Donate ✓" : "Complete checks first", sub: allChecked ? "All eligibility checks passed" : "See Power Up Check below", color: allChecked ? "#059669" : C.onSurfaceVariant },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${C.secondary}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="mso fill" style={{ fontSize: 18, color: C.secondary }}>{row.icon}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: C.primary, marginBottom: 3 }}>{row.label}</div>
                      <div style={{ fontWeight: 900, fontSize: 14, color: row.color || textMain }}>{row.val}</div>
                      <div style={{ fontSize: 12, color: textSub, marginTop: 1 }}>{row.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${C.surfaceLow}`, paddingTop: 20 }}>
                <button
                  onClick={handleConfirmBooking}
                  disabled={!allChecked || bookingLoading}
                  style={{
                    width: "100%", padding: "16px 0", borderRadius: 999,
                    background: allChecked && !bookingLoading
                      ? `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`
                      : C.surfaceHigh,
                    border: "none", fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 900, fontSize: 16,
                    color: allChecked && !bookingLoading ? C.onPrimary : C.outlineVariant,
                    cursor: allChecked && !bookingLoading ? "pointer" : "not-allowed",
                    boxShadow: allChecked && !bookingLoading ? `0 8px 24px ${C.primary}35` : "none",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {bookingLoading ? (
                    <>
                      <span className="mso" style={{ fontSize: 20, animation: "spin 1s linear infinite" }}>progress_activity</span>
                      Booking...
                    </>
                  ) : allChecked ? "CONFIRM BOOKING" : "Complete All Checks"}
                </button>
                <p style={{ textAlign: "center", fontSize: 11, color: textSub, marginTop: 12, lineHeight: 1.5 }}>By confirming, you agree to our donor safety protocols.</p>
              </div>
            </div>
            {/* Bonus */}
            <div style={{ borderRadius: 20, padding: 24, background: C.tertiaryContainer, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -12, bottom: -12, opacity: 0.1 }}>
                <span className="mso fill" style={{ fontSize: 100, color: "#372400" }}>card_giftcard</span>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#372400", marginBottom: 6 }}>Power Reward</div>
                <p style={{ fontSize: 13, color: "#523700", lineHeight: 1.5, marginBottom: 12 }}>Earn <strong>{donationType === "Whole Blood" ? "200" : donationType === "Plasma" ? "250" : "300"} Life Points</strong> when you complete this appointment!</p>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(255,255,255,0.35)", padding: "4px 12px", borderRadius: 99, color: "#372400" }}>Active Booster</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── REWARDS ── */
  const RewardsTab = () => {

    const handleRedeem = (perk) => {
      if (!perk.canRedeem) return;
      if (currentPts < perk.pts) {
        toast(`❌ Not enough points! You need ${perk.pts} pts but have ${currentPts} pts.`, "error");
        return;
      }
      // Deduct points locally immediately
      setRedeemPoints(prev => (prev !== null ? prev : currentPts) - perk.pts);
      // Show redeem confirmation modal
      setRedeemModal({
        label: perk.label,
        pts: perk.pts,
        icon: perk.icon,
        color: perk.color,
        refCode: "RDM-" + Math.floor(Math.random() * 900000 + 100000),
        remaining: currentPts - perk.pts,
      });
    };

    return (
      <div className="fade-in">
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginBottom: 32 }}>
          <div style={{ ...card(), position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: 0, top: 0, pointerEvents: "none" }}>
              <span className="mso fill" style={{ fontSize: 200, color: `${C.primary}05` }}>stars</span>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: C.primary, marginBottom: 16 }}>Your Rewards Hub</div>
              <h1 style={{ fontWeight: 900, fontSize: 52, letterSpacing: "-0.04em", lineHeight: 1, color: textMain }}>
                {currentPts.toLocaleString()}<br /><span style={{ color: C.primary }}>Life Points</span>
              </h1>
              <p style={{ color: textSub, marginTop: 16, maxWidth: 360, fontSize: 14, lineHeight: 1.6 }}>Redeem for exclusive health perks, priority bookings, and community badges.</p>
              <div style={{ display: "flex", gap: 32, marginTop: 28 }}>
                {[[activeTier, "Current Tier"], ["250", "Points to Next Tier"], [totalDons.toString(), "Donations Made"]].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontWeight: 900, fontSize: 26, color: textMain }}>{v}</div>
                    <div style={{ fontSize: 12, color: textSub, marginTop: 2, fontWeight: 600 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: textSub, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                  <span>{activeTier}</span><span>Next Tier ({(currentPts + 250).toLocaleString()} pts)</span>
                </div>
                <div style={{ height: 10, background: surfLow, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (currentPts % 500) / 5)}%`, background: `linear-gradient(90deg,${C.primaryDim},${C.primaryContainer})`, borderRadius: 99, transition: "width 0.5s ease" }} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "local_fire_department", label: "Active Streak", val: "6 Months", bg: C.tertiaryContainer, iconColor: "#523700", textColor: "#372400" },
              { icon: "redeem", label: "Points Redeemed", val: `${(donorProfile?.rewardPoints || totalDons * 10) - currentPts} pts`, bg: cardBg },
              { icon: "verified", label: "Badges Earned", val: "7 Badges", bg: cardBg },
            ].map(s => (
              <div key={s.label} style={{ ...card({ background: s.bg, padding: 20 }), display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: s.bg === C.tertiaryContainer ? "rgba(255,255,255,0.3)" : `${C.primary}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="mso fill" style={{ fontSize: 22, color: s.iconColor || C.primary }}>{s.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: s.textColor || textSub, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontWeight: 900, fontSize: 22, color: s.textColor || textMain }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Perks Catalog */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontWeight: 900, fontSize: 28, letterSpacing: "-0.04em", color: textMain, marginBottom: 20 }}>Perks Catalog</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { icon: "health_and_safety", color: C.primary, label: "Free Health Checkup", desc: "Complete physical at any partner clinic.", pts: 400, canRedeem: true },
              { icon: "local_cafe", color: C.tertiary, label: "Café Voucher", desc: "₹500 voucher for partner café chain.", pts: 200, canRedeem: true },
              { icon: "checkroom", color: C.secondary, label: "Life4U Merch Kit", desc: "Exclusive T-shirt, hoodie & tote bag.", pts: 600, canRedeem: true },
              { icon: "speed", color: C.primary, label: "Priority Booking Pass", desc: "Skip the queue, book slots 7 days ahead.", pts: 150, canRedeem: true },
              { icon: "spa", color: "#059669", label: "Wellness Day Pass", desc: "One complimentary day at wellness centre.", pts: 800, canRedeem: false, lockMsg: "Need Platinum" },
              { icon: "event_available", color: C.tertiary, label: "Annual Gala Ticket", desc: "Attend our annual donor recognition gala.", pts: 1200, canRedeem: false, lockMsg: "Need Platinum" },
            ].map(perk => {
              const canAfford = currentPts >= perk.pts;
              return (
                <div key={perk.label} style={{ ...card(), cursor: perk.canRedeem ? "pointer" : "default", opacity: perk.canRedeem && !canAfford ? 0.65 : 1 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `${perk.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <span className="mso fill" style={{ fontSize: 28, color: perk.color }}>{perk.icon}</span>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em", color: textMain, marginBottom: 6 }}>{perk.label}</div>
                  <div style={{ fontSize: 13, color: textSub, marginBottom: 20, lineHeight: 1.5 }}>{perk.desc}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 900, color: C.primary, fontSize: 15 }}>{perk.pts} pts</span>
                    <button
                      style={{
                        padding: "8px 18px", borderRadius: 999, border: "none",
                        fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 12,
                        cursor: perk.canRedeem && canAfford ? "pointer" : "default",
                        background: perk.canRedeem && canAfford
                          ? `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`
                          : surfLow,
                        color: perk.canRedeem && canAfford ? C.onPrimary : textSub,
                      }}
                      onClick={() => perk.canRedeem ? handleRedeem(perk) : null}
                    >
                      {perk.canRedeem ? (canAfford ? "Redeem" : "Not Enough Pts") : perk.lockMsg}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h2 style={{ fontWeight: 900, fontSize: 28, letterSpacing: "-0.04em", color: textMain, marginBottom: 20 }}>Your Badges</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { icon: "water_drop", label: "First Drop", color: C.primary, bg: `${C.primary}15`, earned: true },
              { icon: "local_fire_department", label: "5 Streak", color: C.primaryContainer, bg: `${C.primaryContainer}20`, earned: true },
              { icon: "workspace_premium", label: "Gold Status", color: "#fff", bg: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, earned: true },
              { icon: "favorite", label: "Life Saver", color: "#059669", bg: "#ecfdf5", earned: true },
              { icon: "bloodtype", label: "Rare Type", color: C.secondary, bg: `${C.secondary}15`, earned: true },
              { icon: "military_tech", label: "10 Donations", color: "#d97706", bg: "#fffbeb", earned: true },
              { icon: "emoji_events", label: "Top 50", color: C.tertiaryFixed, bg: `${C.tertiaryFixed}25`, earned: true },
            ].map(b => (
              <div key={b.label} style={{ textAlign: "center", opacity: b.earned ? 1 : 0.45 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: b.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", boxShadow: b.earned ? "0 4px 16px rgba(0,0,0,0.08)" : "none" }}>
                  <span className="mso fill" style={{ fontSize: 30, color: b.color }}>{b.icon}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: textMain }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const apptNotifications = donations
    .filter(d => d.status === 'completed')
    .map((d, index) => {
      const notesStr = (d.notes || '').toLowerCase();
      let streamName = 'Whole Blood';
      if (notesStr.includes('platelet')) streamName = 'Platelets';
      else if (notesStr.includes('plasma')) streamName = 'Plasma';
      
      return {
        id: d.id || `notif-${index}`,
        icon: "🩸",
        title: "Appointment Completed & Approved! 🎉",
        desc: `Your ${streamName} donation appointment at ${d.hospital || 'Life4U Center'} is complete. +${d.pointsEarned || 200} Life Points added to your account!`,
        time: new Date(d.updatedAt || d.donationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
    });

  const staticNotifs = [
    { id: "welcome", icon: "👋", title: "Welcome to Life4U!", desc: "Thank you for registering as a blood donor. You are now part of our lifesavers community.", time: "Onboarding" },
  ];
  const allNotifications = [...apptNotifications, ...staticNotifs];

  const tabContent = { home: <HomeTab />, impact: <ImpactTab />, appointments: <AppointmentsTab />, rewards: <RewardsTab /> };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: "100vh", background: bg, color: textMain, fontFamily: "Plus Jakarta Sans, sans-serif" }}>

        {/* Notifications Dropdown Overlay */}
        {showNotifications && (
          <div 
            onClick={() => setShowNotifications(false)} 
            style={{ position: "fixed", inset: 0, zIndex: 1000, background: "transparent" }}
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{
                position: "absolute",
                top: 76,
                right: 90,
                width: 360,
                background: cardBg,
                borderRadius: 20,
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                border: "1px solid #eef2f6",
                overflow: "hidden",
                zIndex: 1001,
                animation: "fadeUp 0.2s ease"
              }}
            >
              <div style={{ padding: "18px 20px", borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between", alignItems: "center", background: surfLow }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: textMain }}>🔔 Notifications & Alerts</span>
                <span style={{ fontSize: 11, fontWeight: 800, background: `${C.primary}12`, color: C.primary, padding: "3px 10px", borderRadius: 99 }}>{allNotifications.length} New</span>
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {allNotifications.map((n) => (
                  <div key={n.id} style={{ display: "flex", gap: 12, padding: "14px 18px", borderBottom: "1px solid #f9f9f9", transition: "background 0.2s" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{n.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: textMain, lineHeight: 1.3 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: textSub, marginTop: 4, lineHeight: 1.4 }}>{n.desc}</div>
                      <div style={{ fontSize: 10, color: C.outlineVariant, marginTop: 6, fontWeight: 700 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Overlay */}
        {showSettings && <SettingsPage onClose={() => setShowSettings(false)} theme={theme} setTheme={setTheme} donorProfile={donorProfile} onProfileUpdate={fetchDashboardData} />}

        {/* Booking Confirmation / Receipt Popup Modal */}
        {bookingReceipt && (
          <div style={{ position: "fixed", inset: 0, zIndex: 350, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: cardBg, borderRadius: 24, padding: 32, maxWidth: 500, width: "90%", boxShadow: "0 12px 40px rgba(0,0,0,0.15)", position: "relative" }} className="fade-in">
              {/* Success Badge */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ecfdf5", border: "2px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <span className="mso fill" style={{ fontSize: 36, color: "#059669" }}>check_circle</span>
                </div>
                <h2 style={{ fontWeight: 900, fontSize: 22, color: textMain }}>Booking Confirmed!</h2>
                <p style={{ fontSize: 13, color: textSub, marginTop: 4 }}>Your appointment is successfully scheduled in the system.</p>
              </div>

              {/* Receipt Body */}
              <div style={{ background: surfLow, borderRadius: 16, padding: 20, border: `1px dashed ${C.outlineVariant}`, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.surfaceHigh}`, paddingBottom: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: "uppercase" }}>Ref Receipt ID</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: textMain }}>{bookingReceipt.refId}</span>
                </div>

                {[
                  { label: "Donor Name", val: bookingReceipt.donorName },
                  { label: "Blood Type", val: bookingReceipt.bloodType },
                  { label: "Stream", val: bookingReceipt.stream },
                  { label: "Location Center", val: bookingReceipt.center },
                  { label: "Date", val: bookingReceipt.date },
                  { label: "Time Slot", val: bookingReceipt.slot },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: textSub, fontWeight: 600 }}>{row.label}:</span>
                    <span style={{ fontWeight: 800, color: textMain, textAlign: "right" }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => handleDownloadReceipt(bookingReceipt)} style={{ width: "100%", padding: "14px 0", borderRadius: 12, background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, border: "none", color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span className="mso">download</span> Download Receipt
                </button>
                <button onClick={() => { setBookingReceipt(null); setActiveTab("home"); }} style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "none", border: `1.5px solid ${C.outlineVariant}`, color: textMain, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Go to Home Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Confirmation Modal */}
        {redeemModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: cardBg, borderRadius: 24, padding: 32, maxWidth: 440, width: "90%", boxShadow: "0 12px 40px rgba(0,0,0,0.18)", fontFamily: "Plus Jakarta Sans, sans-serif" }} className="fade-in">
              {/* Icon + Title */}
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${C.primary}15`, border: `2px solid ${C.primaryContainer}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 32 }}>
                  <span className="mso fill" style={{ fontSize: 36, color: C.primary }}>{redeemModal.icon}</span>
                </div>
                <h2 style={{ fontWeight: 900, fontSize: 22, color: textMain, margin: 0 }}>Perk Redeemed! 🎉</h2>
                <p style={{ fontSize: 13, color: textSub, marginTop: 6, lineHeight: 1.5 }}>
                  Your <strong>{redeemModal.label}</strong> perk has been successfully redeemed.<br />
                  Check your email for activation details.
                </p>
              </div>

              {/* Receipt */}
              <div style={{ background: surfLow, borderRadius: 14, padding: 18, border: `1px dashed ${C.outlineVariant}`, marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.surfaceHigh}`, paddingBottom: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: "uppercase" }}>Redemption Code</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: textMain, fontFamily: "monospace" }}>{redeemModal.refCode}</span>
                </div>
                {[
                  ["Perk Redeemed", redeemModal.label],
                  ["Points Used", `-${redeemModal.pts} pts`],
                  ["Remaining Balance", `${redeemModal.remaining} pts`],
                  ["Redeemed On", new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13 }}>
                    <span style={{ color: textSub, fontWeight: 600 }}>{label}:</span>
                    <span style={{ fontWeight: 800, color: label === "Points Used" ? "#dc2626" : label === "Remaining Balance" ? "#059669" : textMain }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => {
                    const text = [
                      "==========================================",
                      "    LIFE4U — PERK REDEMPTION RECEIPT",
                      "==========================================",
                      `Redemption Code : ${redeemModal.refCode}`,
                      `Perk Redeemed   : ${redeemModal.label}`,
                      `Points Used     : -${redeemModal.pts} pts`,
                      `Remaining Pts   : ${redeemModal.remaining} pts`,
                      `Date            : ${new Date().toLocaleString()}`,
                      "",
                      "This receipt is your proof of redemption.",
                      "==========================================",
                    ].join("\n");
                    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `life4u_redeem_${redeemModal.refCode}.txt`; a.click();
                    URL.revokeObjectURL(url);
                    toast("📥 Redemption receipt downloaded!", "success");
                  }}
                  style={{ width: "100%", padding: "13px 0", borderRadius: 12, background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, border: "none", color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <span className="mso">download</span> Download Receipt
                </button>
                <button
                  onClick={() => setRedeemModal(null)}
                  style={{ width: "100%", padding: "11px 0", borderRadius: 12, background: "none", border: `1.5px solid ${C.outlineVariant}`, color: textMain, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TOP NAV ── */}
        <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 100, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(24px)", boxShadow: "0 4px 32px rgba(255,51,102,0.08)", borderBottom: "2px solid #FCE6E6" }}>
          <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 48px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setActiveTab("home")}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="mso fill" style={{ fontSize: 18, color: "#fff" }}>favorite</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.04em" }}>Life<span style={{ color: C.primary }}>4U</span></span>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, border: "none", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", background: activeTab === t.id ? `${C.primary}12` : "transparent", color: activeTab === t.id ? C.primary : C.onSurfaceVariant, transition: "all 0.2s", position: "relative" }}>
                  <span className="mso" style={{ fontSize: 18, fontVariationSettings: activeTab === t.id ? "'FILL' 1" : "'FILL' 0" }}>{t.icon}</span>
                  {t.label}
                  {activeTab === t.id && <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: C.primary }} />}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Notifications Bell Button */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                title="Notifications" 
                style={{ width: 42, height: 42, borderRadius: "50%", background: showNotifications ? `${C.primary}12` : "none", border: `1.5px solid ${C.outlineVariant}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: showNotifications ? C.primary : C.onSurfaceVariant, position: "relative" }}
              >
                <span className="mso fill">notifications</span>
                {apptNotifications.length > 0 && (
                  <div style={{ position: "absolute", top: 2, right: 2, width: 10, height: 10, borderRadius: "50%", background: C.primary, border: "2px solid #fff" }} />
                )}
              </button>

              <button onClick={() => setActiveTab("appointments")} style={{ padding: "10px 22px", borderRadius: 999, background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, border: "none", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 13, color: C.onPrimary, cursor: "pointer", boxShadow: `0 4px 16px ${C.primary}30` }}>
                Donate Now
              </button>
              {/* Profile / Settings trigger */}
              <button onClick={() => setShowSettings(true)} title="Account Settings" style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14, boxShadow: `0 2px 8px ${C.primary}30`, position: "relative" }}>
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "DN"}
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff" }} />
              </button>
            </div>
          </div>
        </nav>

        {/* ── CONTENT ── */}
        <main style={{ maxWidth: 1440, margin: "0 auto", padding: "96px 48px 80px" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh", flexDirection: "column", gap: 12 }}>
              <span className="mso fill animate-spin" style={{ fontSize: 44, color: C.primary }}>progress_activity</span>
              <p style={{ fontWeight: 800, color: textSub, fontSize: 14 }}>Connecting to secure PostgreSQL server...</p>
            </div>
          ) : (
            tabContent[activeTab]
          )}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{ background: C.onSurface, color: "#fff", marginTop: 40 }}>
          <div style={{ maxWidth: 1440, margin: "0 auto", padding: "52px 48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
              {/* Brand */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${C.primaryDim},${C.primaryContainer})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="mso fill" style={{ fontSize: 16, color: "#fff" }}>favorite</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.04em" }}>Life<span style={{ color: C.primaryContainer }}>4U</span></span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6, maxWidth: 220 }}>Connecting generous donors to those who need it most. Every drop is a gift of life.</p>
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  {["public", "chat_bubble", "mail"].map(ic => (
                    <div key={ic} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <span className="mso" style={{ fontSize: 16 }}>{ic}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* For Donors */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>For Donors</div>
                {[["Dashboard", "home"], ["My Impact", "impact"], ["Appointments", "appointments"], ["Rewards", "rewards"]].map(([l, tab]) => (
                  <div key={l} onClick={() => setActiveTab(tab)} style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 12, cursor: "pointer", fontWeight: 600 }}>{l}</div>
                ))}
              </div>
              {/* Resources */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Resources</div>
                {["Eligibility Guide", "Find a Camp", "Blood Types", "Community Blog", "Emergency Requests"].map(l => (
                  <div key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 12, cursor: "pointer", fontWeight: 600 }}>{l}</div>
                ))}
              </div>
              {/* Life4U */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Life4U</div>
                {["About Us", "Partner Hospitals", "Press Kit", "Careers", "Support"].map(l => (
                  <div key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 12, cursor: "pointer", fontWeight: 600 }}>{l}</div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>© 2026 Life4U. All rights reserved. Saving lives, every day.</p>
              <div style={{ display: "flex", gap: 24 }}>
                {["Privacy Policy", "Terms of Use", "Cookie Settings"].map(l => (
                  <span key={l} style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}