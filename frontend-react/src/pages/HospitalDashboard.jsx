import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { bloodbankService, requestService, inventoryService, donorService, donationService } from "../services/api";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from "recharts";

/* ═══════════════════════ CONSTANTS ═══════════════════════ */
const TEAL = "#FF3366";
const TEAL_DARK = "#E61E4D";
const TEAL_LIGHT = "#FF6B8B";

const TABS = [
    { key: "inventory", label: "Inventory Stock", icon: "🩸" },
    { key: "requests", label: "Blood Requests", icon: "📋" },
    { key: "donors", label: "Registered Donors", icon: "👥" },
    { key: "analytics", label: "Analytics & Reports", icon: "📊" },
];

/* ═══════════════════════ SHARED STYLES ═══════════════════════ */
const card = { background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", marginBottom: 20 };
const TH = { padding: "11px 14px", textAlign: "left", fontSize: 13, color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #f0f0f0", background: "#fafafa" };
const TD = { padding: "13px 14px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f8f8f8" };

/* ═══════════════════════ SUB-COMPONENTS ═══════════════════════ */
const HeroStatCard = ({ icon, value, label }) => (
    <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.2)", flex: 1 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>{value}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>{label}</div>
        </div>
    </div>
);

const StatCards = ({ cards }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {cards.map((c, i) => (
            <div key={i} style={{ ...card, marginBottom: 0, borderLeft: `3px solid ${TEAL}` }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 26, color: "#1f2937", marginBottom: 4 }}>{c.value}</div>
                <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>{c.label}</div>
                <div style={{ color: c.subColor, fontSize: 12, fontWeight: 600 }}>{c.sub}</div>
            </div>
        ))}
    </div>
);

const SectionCard = ({ title, children, style }) => (
    <div style={{ ...card, ...style }}>
        {title && <h3 style={{ fontWeight: 700, fontSize: 15, color: "#1f2937", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>{title}</h3>}
        {children}
    </div>
);

const StatusPill = ({ text, sColor, sBg }) => (
    <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: sBg, color: sColor }}>{text}</span>
);

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function HospitalDashboard() {
    const { logout } = useAuth();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState("inventory");

    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [donors, setDonors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [receiptModal, setReceiptModal] = useState(null);
    const [activeApptDetail, setActiveApptDetail] = useState(null);

    const loadDashboardData = async () => {
        try {
            const [statsRes, reqsRes, invRes, donorsRes, apptRes] = await Promise.all([
                bloodbankService.getStats(),
                requestService.getAll(),
                inventoryService.get(),
                donorService.getAll(),
                donationService.getAll({ status: 'pending' }),
            ]);

            setStats(statsRes.data);
            setRequests(reqsRes.data || []);
            setInventory(invRes.data || []);
            setDonors(donorsRes.data || []);
            setAppointments(apptRes.data || []);
        } catch (err) {
            console.error("Error loading hospital dashboard details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(() => {
            loadDashboardData();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleRequestAction = async (id, status) => {
        try {
            await requestService.updateStatus(id, status);
            toast(`Request successfully updated to ${status}! ✅`, "success");
            loadDashboardData();
        } catch (err) {
            toast(err.message, "error");
        }
    };

    const handleAppointmentAction = async (appt, newStatus) => {
        try {
            await donationService.update(appt.id, { status: newStatus });
            toast(`Appointment ${newStatus === 'completed' ? 'completed ✅' : 'cancelled ❌'}`, newStatus === 'completed' ? 'success' : 'error');
            // Show receipt for completed appointments
            if (newStatus === 'completed') {
                const notesStr = appt.notes || '';
                const streamMatch = notesStr.match(/Stream:\s*([^,]+)/);
                const stream = streamMatch ? streamMatch[1].trim() : 'Whole Blood';
                const donor = donors.find(d => d.id === appt.donorId);
                const refId = 'HOSP-' + Math.floor(Math.random() * 900000 + 100000);
                setReceiptModal({
                    refId,
                    donorId: appt.donorId,
                    bloodType: appt.bloodType,
                    stream,
                    hospital: appt.hospital || 'Life4U Center',
                    units: appt.units,
                    date: new Date(appt.donationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    completedAt: new Date().toLocaleString(),
                });
            }
            loadDashboardData();
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    const downloadReceipt = (r) => {
        const text = [
            '================================================',
            '   LIFE4U — HOSPITAL APPOINTMENT RECEIPT',
            '================================================',
            `Receipt Ref ID  : ${r.refId}`,
            `Donor ID        : ${r.donorId}`,
            `Blood Type      : ${r.bloodType}`,
            `Donation Stream : ${r.stream}`,
            `Units Collected : ${r.units}`,
            `Center / Hospital: ${r.hospital}`,
            `Appointment Date : ${r.date}`,
            `Completed At    : ${r.completedAt}`,
            '',
            'Status: COMPLETED — Donation verified by hospital staff.',
            '================================================',
            'Thank you for helping save lives with Life4U!',
        ].join('\n');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `life4u_hospital_receipt_${r.refId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast('📥 Receipt downloaded!', 'success');
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "sans-serif", color: TEAL, fontSize: "1.2rem", fontWeight: "bold" }}>
                Loading hospital dashboards...
            </div>
        );
    }

    // Hero metrics:
    const totalUnitsCount = inventory.filter(i => i.status === "available").reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const pendingRequestsCount = requests.filter(r => r.status === "pending").length;
    const activeDonorsCount = donors.filter(d => d.status === "eligible").length;
    const expiringSoonCount = inventory.filter(i => {
        if (i.status !== "available") return false;
        const daysToExpiry = (new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        return daysToExpiry > 0 && daysToExpiry <= 7;
    }).length;

    const HERO_STATS = [
        { icon: "🩸", value: totalUnitsCount.toString(), label: "Total Units" },
        { icon: "🕐", value: pendingRequestsCount.toString(), label: "Pending Requests" },
        { icon: "⏳", value: expiringSoonCount.toString(), label: "Expiring Soon" },
        { icon: "🤲", value: activeDonorsCount.toString(), label: "Active Donors" },
    ];

    // Dynamic Calculations for Analytics & Cards
    const totalInv = inventory.length;
    const usedInv = inventory.filter(i => i.status === 'used').length;
    const utilizationRate = totalInv > 0 ? Math.round((usedInv / totalInv) * 100) : 0;

    const totalRequests = requests.length;
    const fulfilledRequests = requests.filter(r => r.status === 'fulfilled').length;
    const fulfillmentRate = totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 100;

    const getAvgResponseTime = () => {
        let totalTime = 0;
        let count = 0;
        requests.forEach(r => {
            if (r.status === 'fulfilled' && r.fulfillmentDate) {
                const diff = new Date(r.fulfillmentDate) - new Date(r.createdAt);
                if (diff > 0) {
                    totalTime += diff;
                    count++;
                }
            }
        });
        if (count === 0) return "Fast";
        const avgMinutes = Math.round(totalTime / (count * 60 * 1000));
        if (avgMinutes < 60) return `${avgMinutes}min`;
        const avgHours = Math.round(avgMinutes / 60);
        if (avgHours < 24) return `${avgHours}hr`;
        return `${Math.round(avgHours / 24)}d`;
    };
    const avgResponseTime = getAvgResponseTime();

    const getUsageTrend = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const trendData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            trendData.push({
                month: months[d.getMonth()],
                year: d.getFullYear(),
                "Units Used": 0
            });
        }
        requests.forEach(r => {
            if (r.status === 'fulfilled') {
                const date = new Date(r.fulfillmentDate || r.updatedAt || r.createdAt);
                const m = months[date.getMonth()];
                const y = date.getFullYear();
                const match = trendData.find(t => t.month === m && t.year === y);
                if (match) {
                    match["Units Used"] += (r.quantity || 0);
                }
            }
        });
        return trendData;
    };
    const usageTrend = getUsageTrend();

    const getPerformanceMetrics = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const lastMonth = (currentMonth - 1 + 12) % 12;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        let thisMonthReqs = 0;
        let lastMonthReqs = 0;
        requests.forEach(r => {
            const date = new Date(r.createdAt);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                thisMonthReqs++;
            } else if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
                lastMonthReqs++;
            }
        });
        
        let thisMonthFulfilled = 0;
        let lastMonthFulfilled = 0;
        requests.forEach(r => {
            if (r.status === 'fulfilled') {
                const date = new Date(r.fulfillmentDate || r.updatedAt);
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    thisMonthFulfilled++;
                } else if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
                    lastMonthFulfilled++;
                }
            }
        });
        
        let thisMonthDonations = 0;
        let lastMonthDonations = 0;
        appointments.forEach(a => {
            if (a.status === 'completed') {
                const date = new Date(a.updatedAt || a.donationDate);
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    thisMonthDonations += (a.units || 1);
                } else if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
                    lastMonthDonations += (a.units || 1);
                }
            }
        });
        
        const calcPctChange = (curr, prev) => {
            if (prev === 0) return curr > 0 ? `+${curr * 100}%` : '0%';
            const diff = ((curr - prev) / prev) * 100;
            return `${diff >= 0 ? '+' : ''}${Math.round(diff)}%`;
        };
        
        return [
            {
                metric: "Total Requests",
                thisMonth: thisMonthReqs.toString(),
                lastMonth: lastMonthReqs.toString(),
                change: calcPctChange(thisMonthReqs, lastMonthReqs),
                pos: thisMonthReqs >= lastMonthReqs
            },
            {
                metric: "Fulfilled Requests",
                thisMonth: thisMonthFulfilled.toString(),
                lastMonth: lastMonthFulfilled.toString(),
                change: calcPctChange(thisMonthFulfilled, lastMonthFulfilled),
                pos: thisMonthFulfilled >= lastMonthFulfilled
            },
            {
                metric: "Donations Received (Units)",
                thisMonth: thisMonthDonations.toString(),
                lastMonth: lastMonthDonations.toString(),
                change: calcPctChange(thisMonthDonations, lastMonthDonations),
                pos: thisMonthDonations >= lastMonthDonations
            },
            {
                metric: "Eligible Donors",
                thisMonth: activeDonorsCount.toString(),
                lastMonth: donors.length.toString(),
                change: donors.length > 0 ? `${Math.round((activeDonorsCount / donors.length) * 100)}% active` : "0% active",
                pos: true
            }
        ];
    };
    const perfMetrics = getPerformanceMetrics();


    // Inventory Tab metrics:
    const INV_CARDS = [
        { icon: "🩸", value: totalUnitsCount.toString(), label: "Total Units", sub: "Available stock", subColor: TEAL },
        { icon: "📈", value: `${utilizationRate}%`, label: "Utilization Rate", sub: "Used vs Total", subColor: TEAL },
        { icon: "⏳", value: expiringSoonCount.toString(), label: "Expiring Soon", sub: "Within 7 days", subColor: expiringSoonCount > 0 ? "#ef4444" : TEAL },
        { icon: "📋", value: pendingRequestsCount.toString(), label: "Pending Requests", sub: "Requires Dispatch", subColor: pendingRequestsCount > 0 ? "#f59e0b" : TEAL },
    ];

    // Complete Blood Stock:
    const stockMap = { "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0 };
    inventory.forEach(i => {
        if (i.status === "available") stockMap[i.bloodType] = (stockMap[i.bloodType] || 0) + (i.quantity || 0);
    });
    const BLOOD_STOCK = Object.keys(stockMap).map(type => {
        const units = stockMap[type];
        let status = "Available";
        let sColor = "#16a34a";
        let sBg = "#dcfce7";
        if (units === 0) {
            status = "Critical";
            sColor = "#dc2626";
            sBg = "#fee2e2";
        } else if (units < 5) {
            status = "Low";
            sColor = "#ef4444";
            sBg = "#fee2e2";
        } else if (units < 15) {
            status = "Moderate";
            sColor = "#f59e0b";
            sBg = "#fef3c7";
        }
        return { type, units, status, sColor, sBg, trend: "≈ Stable", up: null };
    });

    const BLOOD_DIST = BLOOD_STOCK.map(b => ({ name: b.type, Units: b.units }));

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    /* ── INVENTORY TAB ── */
    const InventoryTab = () => (
        <div>
            <StatCards cards={INV_CARDS} />

            <SectionCard title="🩸 Current Blood Stock Levels">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Blood Type", "Units Available", "Status", "Trend", "Last Checked"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>
                        {BLOOD_STOCK.map((b, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                <td style={{ ...TD, fontWeight: 700, color: TEAL }}>{b.type}</td>
                                <td style={TD}>{b.units} units</td>
                                <td style={TD}><StatusPill text={b.status} sColor={b.sColor} sBg={b.sBg} /></td>
                                <td style={{ ...TD, color: "#6b7280" }}>{b.trend}</td>
                                <td style={{ ...TD, color: "#9ca3af" }}>Just now</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </SectionCard>

            <SectionCard title="🗄 Storage & Expiry Shelf Details">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Blood Type", "Collection Date", "Expiry Date", "Storage Location", "Shelf ID", "Status"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>
                        {inventory.map((s, i) => {
                            const isExpired = new Date(s.expiryDate) < new Date();
                            return (
                                <tr key={s.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                    <td style={{ ...TD, fontWeight: 700, color: TEAL }}>{s.bloodType}</td>
                                    <td style={TD}>{formatDate(s.collectionDate)}</td>
                                    <td style={TD}>{formatDate(s.expiryDate)}</td>
                                    <td style={TD}>{s.storageLocation || "Cold Room"}</td>
                                    <td style={TD}>{s.storageShelf || "N/A"}</td>
                                    <td style={TD}>
                                        <StatusPill
                                            text={s.status}
                                            sColor={s.status === "available" ? "#16a34a" : s.status === "expired" || isExpired ? "#dc2626" : "#f59e0b"}
                                            sBg={s.status === "available" ? "#dcfce7" : s.status === "expired" || isExpired ? "#fee2e2" : "#fef3c7"}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </SectionCard>

        </div>
    );

    /* ── REQUESTS TAB ── */
    const RequestsTab = () => {
        const activeRequests = requests.filter(r => ["pending", "approved"].includes(r.status));
        const completedRequests = requests.filter(r => r.status === "fulfilled");

        return (
            <div>
                <StatCards cards={[
                    { icon: "🕐", value: pendingRequestsCount.toString(), label: "Pending Requests", sub: "Action Required", subColor: "#ef4444" },
                    { icon: "✅", value: completedRequests.length.toString(), label: "Fulfilled Overall", sub: "Completed matches", subColor: TEAL },
                    { icon: "⚡", value: avgResponseTime, label: "Avg Response Time", sub: "Highly Efficient", subColor: TEAL },
                    { icon: "📊", value: `${fulfillmentRate}%`, label: "Fulfillment Rate", sub: "Optimal output", subColor: TEAL },
                ]} />

                <SectionCard title="📋 Active Patient Blood Requests">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>{["Request ID", "Patient Name", "Blood Type", "Quantity", "Urgency", "Requested", "Status", "Actions"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                        <tbody>
                            {activeRequests.map((r, i) => (
                                <tr key={r.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                    <td style={{ ...TD, fontWeight: 700 }}>REQ-{r.id?.substring(0, 8).toUpperCase()}</td>
                                    <td style={TD}>{r.recipientName || "General patient"}</td>
                                    <td style={{ ...TD, fontWeight: 700, color: TEAL }}>{r.bloodType}</td>
                                    <td style={TD}>{r.quantity} units</td>
                                    <td style={TD}>
                                        <StatusPill
                                            text={r.urgency}
                                            sColor={r.urgency === "emergency" || r.urgency === "critical" ? "#dc2626" : r.urgency === "urgent" ? "#d97706" : "#3b82f6"}
                                            sBg={r.urgency === "emergency" || r.urgency === "critical" ? "#fee2e2" : r.urgency === "urgent" ? "#fef3c7" : "#eff6ff"}
                                        />
                                    </td>
                                    <td style={{ ...TD, color: "#6b7280" }}>{formatDate(r.requestDate)}</td>
                                    <td style={TD}>
                                        <StatusPill
                                            text={r.status}
                                            sColor={r.status === "approved" ? "#f59e0b" : "#6366f1"}
                                            sBg={r.status === "approved" ? "#fef3c7" : "#e0e7ff"}
                                        />
                                    </td>
                                    <td style={TD}>
                                        {r.status === "pending" ? (
                                            <button
                                                onClick={() => handleRequestAction(r.id, "approved")}
                                                style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: TEAL, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                                            >
                                                Approve
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRequestAction(r.id, "fulfilled")}
                                                style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                                            >
                                                Dispatch
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionCard>

                <SectionCard title="🕑 Completed Requests (Fulfilled)">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>{["Request ID", "Patient Name", "Blood Type", "Fulfilled On", "Actions"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                        <tbody>
                            {completedRequests.map((r, i) => (
                                <tr key={r.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                    <td style={{ ...TD, fontWeight: 700 }}>REQ-{r.id?.substring(0, 8).toUpperCase()}</td>
                                    <td style={TD}>{r.recipientName || "Trauma Patient"}</td>
                                    <td style={{ ...TD, fontWeight: 700, color: TEAL }}>{r.bloodType}</td>
                                    <td style={TD}>{formatDate(r.fulfillmentDate)}</td>
                                    <td style={TD}><StatusPill text="Fulfilled" sColor="#16a34a" sBg="#dcfce7" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionCard>
            </div>
        );
    };

    /* ── DONORS TAB ── */
    const DonorsTab = () => (
        <div>
            <StatCards cards={[
                { icon: "👥", value: donors.length.toString(), label: "Registered Donors", sub: "Life saving partners", subColor: TEAL },
                { icon: "✅", value: activeDonorsCount.toString(), label: "Active Donors", sub: `${Math.round((activeDonorsCount / (donors.length || 1)) * 100)}% Eligible`, subColor: TEAL },
                { icon: "🩸", value: appointments.length.toString(), label: "Pending Appointments", sub: "Awaiting confirmation", subColor: appointments.length > 0 ? "#f59e0b" : TEAL },
                { icon: "📅", value: appointments.filter(a => new Date(a.donationDate).toDateString() === new Date().toDateString()).length.toString(), label: "Today's Slots", sub: "Scheduled today", subColor: TEAL },
            ]} />

            <SectionCard title="≡ Registered Donors Directory">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Donor ID", "Blood Group", "Last Checkup Date", "Total Donations", "Status", "Contact Preference"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>
                        {donors.map((d, i) => (
                            <tr key={d.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                <td style={{ ...TD, fontFamily: "monospace", fontSize: 12 }}>DON-{d.id?.substring(0, 8).toUpperCase()}</td>
                                <td style={{ ...TD, fontWeight: 700, color: TEAL }}>{d.bloodType}</td>
                                <td style={TD}>{formatDate(d.lastCheckupDate)}</td>
                                <td style={TD}>{d.totalDonations} donations</td>
                                <td style={TD}>
                                    <StatusPill text={d.status} sColor={d.status === "eligible" ? "#16a34a" : "#ef4444"} sBg={d.status === "eligible" ? "#dcfce7" : "#fee2e2"} />
                                </td>
                                <td style={TD}>{d.contactPreference?.toUpperCase() || "PHONE"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </SectionCard>

            <SectionCard title="📅 Pending Donor Appointments (Real-Time)">
                {appointments.length === 0 ? (
                    <div style={{ padding: "20px 0", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
                        ✅ No pending appointments. All bookings have been processed.
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>{["Appt ID", "Donor ID", "Blood Type", "Stream", "Center", "Booked On", "Appt Date", "Status", "Actions"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                        <tbody>
                            {appointments.map((a, i) => {
                                const notesStr = a.notes || '';
                                const streamMatch = notesStr.match(/Stream:\s*([^,]+)/);
                                const stream = streamMatch ? streamMatch[1].trim() : 'Whole Blood';
                                return (
                                    <tr key={a.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                        <td style={{ ...TD, fontFamily: "monospace", fontSize: 12 }}>
                                            <span 
                                                onClick={() => setActiveApptDetail(a)} 
                                                style={{ color: TEAL, cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}
                                                title="View Details"
                                            >
                                                APT-{a.id?.substring(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ ...TD, fontFamily: "monospace", fontSize: 12 }}>DON-{a.donorId?.substring(0, 8).toUpperCase()}</td>
                                        <td style={{ ...TD, fontWeight: 700, color: TEAL }}>{a.bloodType}</td>
                                        <td style={TD}>{stream}</td>
                                        <td style={TD}>{a.hospital || 'Life4U Center'}</td>
                                        <td style={{ ...TD, color: "#6b7280" }}>{formatDate(a.createdAt)}</td>
                                        <td style={{ ...TD, fontWeight: 700, color: '#1e293b' }}>{formatDate(a.donationDate)}</td>
                                        <td style={TD}><StatusPill text="Pending" sColor="#d97706" sBg="#fef3c7" /></td>
                                        <td style={TD}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    onClick={() => handleAppointmentAction(a, 'completed')}
                                                    style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: TEAL, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                                >
                                                    ✅ Complete
                                                </button>
                                                <button
                                                    onClick={() => handleAppointmentAction(a, 'cancelled')}
                                                    style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                                >
                                                    ❌ Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </SectionCard>
        </div>
    );

    /* ── ANALYTICS TAB ── */
    const AnalyticsTab = () => (
        <div>
            <SectionCard title="📈 Blood Usage Trend (Monthly)">
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={usageTrend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={TEAL} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="Units Used" stroke={TEAL} strokeWidth={2.5} fill="url(#tealGrad)" dot={{ r: 4, fill: TEAL }} activeDot={{ r: 6 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="📊 Blood Type Distribution">
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={BLOOD_DIST} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: "rgba(16,185,129,0.05)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }} />
                        <Bar dataKey="Units" fill={TEAL} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="🎯 Key Performance Indicators">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                    {[
                        { value: `${fulfillmentRate}%`, label: "Request Fulfillment Rate" },
                        { value: avgResponseTime, label: "Avg Response Time" },
                        { value: activeDonorsCount.toString(), label: "Active Donors Available" },
                        { value: `${utilizationRate}%`, label: "Inventory Utilization" },
                    ].map((k, i) => (
                        <div key={i} style={{ textAlign: "center", padding: "20px 0", border: "1px solid #f0f0f0", borderRadius: 12 }}>
                            <div style={{ fontWeight: 800, fontSize: 28, color: TEAL, marginBottom: 6 }}>{k.value}</div>
                            <div style={{ color: "#6b7280", fontSize: 13 }}>{k.label}</div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SectionCard title="📋 Operational Performance Metrics">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Metric", "This Month", "Last Month", "Change"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>
                        {perfMetrics.map((m, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                <td style={{ ...TD, fontWeight: 500 }}>{m.metric}</td>
                                <td style={{ ...TD, fontWeight: 700 }}>{m.thisMonth}</td>
                                <td style={{ ...TD, color: "#6b7280" }}>{m.lastMonth}</td>
                                <td style={TD}>
                                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: m.pos ? "#dcfce7" : "#fee2e2", color: m.pos ? "#16a34a" : "#dc2626" }}>
                                        {m.change}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </SectionCard>
        </div>
    );

    const renderTab = () => {
        switch (activeTab) {
            case "inventory": return <InventoryTab />;
            case "requests": return <RequestsTab />;
            case "donors": return <DonorsTab />;
            case "analytics": return <AnalyticsTab />;
            default: return null;
        }
    };

    return (
        <>
        {/* Active Appointment Detail Modal */}
        {activeApptDetail && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 500, width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', position: 'relative', border: '1px solid #eef2f6', fontFamily: "'Segoe UI', sans-serif" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontWeight: 800, fontSize: 18, color: '#1e293b', margin: 0 }}>📋 Appointment Details</h2>
                        <button onClick={() => setActiveApptDetail(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', marginBottom: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>👤 Donor Information</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                            {[
                                ['Donor ID', `DON-${activeApptDetail.donorId?.substring(0, 8).toUpperCase()}`],
                                ['Name', donors.find(d => d.id === activeApptDetail.donorId)?.user?.name || activeApptDetail.donor?.user?.name || 'N/A'],
                                ['Email', donors.find(d => d.id === activeApptDetail.donorId)?.user?.email || activeApptDetail.donor?.user?.email || 'N/A'],
                                ['Phone', donors.find(d => d.id === activeApptDetail.donorId)?.user?.phone || 'N/A'],
                                ['Blood Type', activeApptDetail.bloodType],
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>{label}:</span>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{val}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ fontSize: 11, fontWeight: 800, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em', borderTop: '1px solid #e2e8f0', paddingTop: 12, marginBottom: 12 }}>📅 Appointment Details</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                            {[
                                ['Appt ID', `APT-${activeApptDetail.id?.substring(0, 8).toUpperCase()}`],
                                ['Date', formatDate(activeApptDetail.donationDate)],
                                ['Time Slot', (activeApptDetail.notes || '').match(/Slot:\s*([^,]+)/)?.[1] || '09:15 AM'],
                                ['Donation Stream', (activeApptDetail.notes || '').match(/Stream:\s*([^,]+)/)?.[1] || 'Whole Blood'],
                                ['Status', activeApptDetail.status.toUpperCase()],
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>{label}:</span>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{val}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ fontSize: 11, fontWeight: 800, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em', borderTop: '1px solid #e2e8f0', paddingTop: 12, marginBottom: 12 }}>🏥 Hospital Details</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                ['Center', activeApptDetail.hospital || 'Life4U Regional Hub'],
                                ['Address', activeApptDetail.hospital === "Sunflower Hospital Multispeciality" ? "421 Neon Way, Suite 100" : activeApptDetail.hospital === "Sal Hospital" ? "88 Wilshire Blvd" : "88 Highfield Road"],
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>{label}:</span>
                                    <span style={{ fontWeight: 700, color: '#1e293b', textAlign: 'right', maxWidth: '60%' }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => setActiveApptDetail(null)} style={{ width: '100%', padding: '11px 0', borderRadius: 10, background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`, border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                        Close Details
                    </button>
                </div>
            </div>
        )}

        {/* Hospital Receipt Confirmation Modal */}
        {receiptModal && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 480, width: '90%', boxShadow: '0 12px 40px rgba(0,0,0,0.18)', position: 'relative', fontFamily: "'Segoe UI', sans-serif" }}>
                    {/* Green Badge */}
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', border: '2px solid #6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 32 }}>✅</div>
                        <h2 style={{ fontWeight: 900, fontSize: 20, color: '#1f2937', margin: 0 }}>Appointment Completed!</h2>
                        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Donation confirmed and recorded in the system.</p>
                    </div>
                    {/* Receipt Details */}
                    <div style={{ background: '#f9fafb', borderRadius: 14, padding: 18, border: '1px dashed #d1d5db', marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginBottom: 10 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: TEAL, textTransform: 'uppercase' }}>Receipt Ref ID</span>
                            <span style={{ fontSize: 13, fontWeight: 900, color: '#1f2937', fontFamily: 'monospace' }}>{receiptModal.refId}</span>
                        </div>
                        {[
                            ['Donor ID', `DON-${receiptModal.donorId?.substring(0, 8).toUpperCase()}`],
                            ['Blood Type', receiptModal.bloodType],
                            ['Donation Stream', receiptModal.stream],
                            ['Units Collected', `${receiptModal.units} unit(s)`],
                            ['Center / Hospital', receiptModal.hospital],
                            ['Appointment Date', receiptModal.date],
                            ['Completed At', receiptModal.completedAt],
                        ].map(([label, val]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13 }}>
                                <span style={{ color: '#6b7280', fontWeight: 600 }}>{label}:</span>
                                <span style={{ fontWeight: 800, color: '#1f2937', textAlign: 'right', maxWidth: '55%' }}>{val}</span>
                            </div>
                        ))}
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button onClick={() => downloadReceipt(receiptModal)} style={{ width: '100%', padding: '13px 0', borderRadius: 10, background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`, border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            📥 Download Hospital Receipt
                        </button>
                        <button onClick={() => setReceiptModal(null)} style={{ width: '100%', padding: '11px 0', borderRadius: 10, background: 'none', border: '1.5px solid #d1d5db', color: '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#FFF5F5", minHeight: "100vh" }}>
            {/* Emergency Banner */}
            <div style={{ background: "linear-gradient(90deg,#ef4444,#f87171)", color: "#fff", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, fontSize: 13 }}>
                <span>⚠️ Immediate Support Needed?</span>
                <span style={{ textDecoration: "underline", fontWeight: 700 }}>Central Helpline Active</span>
                <span style={{ opacity: 0.8 }}>• 24/7 Support Desk: 1800-123-4567</span>
            </div>

            {/* Navbar */}
            <nav style={{ background: "#fff", padding: "14px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 12px rgba(255,51,102,0.08)", borderBottom: "2px solid #FCE6E6" }}>
                {/* Left Side: Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 20, color: "#ef4444", flex: 1 }}>
                    🩸 Life4U
                </div>
                
                {/* Middle: Centered Tab Navigation */}
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            padding: "8px 16px", borderRadius: 10, border: "none",
                            fontWeight: 600, fontSize: 13, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                            background: activeTab === tab.key ? `linear-gradient(135deg,${TEAL_DARK},${TEAL})` : "transparent",
                            color: activeTab === tab.key ? "#fff" : "#6b7280",
                            transition: "all 0.15s",
                        }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right Side: Logout Button */}
                <div style={{ display: "flex", justifyContent: "flex-end", flex: 1 }}>
                    <button onClick={logout} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 24, padding: "8px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                        Logout
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 48px" }}>
                {/* Hero Banner */}
                <div style={{
                    background: `linear-gradient(135deg, ${TEAL_DARK} 0%, ${TEAL} 55%, ${TEAL_LIGHT} 100%)`,
                    borderRadius: 20, padding: "28px 32px", marginBottom: 20,
                    position: "relative", overflow: "hidden",
                }}>
                    <div style={{ position: "absolute", right: 80, top: 10, width: 130, height: 130, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
                    <div style={{ position: "absolute", right: 20, top: 50, width: 80, height: 80, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                            🏥 Hospital Partner Dashboard
                        </h1>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {HERO_STATS.map((s, i) => <HeroStatCard key={i} {...s} />)}
                    </div>
                </div>

                {/* Tab Content */}
                {renderTab()}

                {/* Footer */}
                <footer style={{ background: "#111827", borderRadius: 16, padding: "32px 32px 20px", marginTop: 20, color: "#9ca3af" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, marginBottom: 20 }}>
                        <div>
                            <div style={{ color: "#ef4444", fontWeight: 800, fontSize: 18, marginBottom: 10 }}>🩸 Life4U</div>
                            <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 200 }}>Saving lives, one pint at a time.</p>
                        </div>
                        {[{ title: "Quick Links", items: ["About Us", "Why Donate", "Become a Donor", "Contact"] },
                        { title: "Legal", items: ["Privacy Policy", "Terms of Service", "Medical Disclaimer"] }
                        ].map((col, i) => (
                            <div key={i}>
                                <div style={{ color: "#fff", fontWeight: 700, marginBottom: 12 }}>{col.title}</div>
                                {col.items.map(item => <div key={item} style={{ marginBottom: 8, fontSize: 13 }}>{item}</div>)}
                            </div>
                        ))}
                        <div>
                            <div style={{ color: "#fff", fontWeight: 700, marginBottom: 12 }}>Follow Us</div>
                            <div style={{ display: "flex", gap: 10 }}>
                                {[
                                    { icon: "fa-brands fa-facebook-f", color: "#3b5998" },
                                    { icon: "fa-brands fa-twitter", color: "#1da1f2" },
                                    { icon: "fa-brands fa-instagram", color: "#e1306c" },
                                    { icon: "fa-brands fa-linkedin-in", color: "#0077b5" }
                                ].map((s, i) => (
                                    <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", cursor: "pointer", transition: "background 0.2s" }} title={s.icon.split(" ")[2]}>
                                        <i className={s.icon}></i>
                                    </div>
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