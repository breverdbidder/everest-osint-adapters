import { useState, useEffect } from "react";

// House brand colors
const BRAND = {
  navy: "#1E3A5F",
  orange: "#F59E0B",
  bg: "#020617",
  bgCard: "#0F172A",
  bgTab: "#1E293B",
  border: "#334155",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  green: "#22C55E",
  red: "#EF4444",
  blue: "#3B82F6",
  purple: "#A855F7",
};

const STATUS_BADGES = {
  LIVE_AUCTION: { label: "LIVE AUCTION", bg: "#DC2626", color: "#FFF", pulse: true },
  OPPORTUNITY: { label: "OPPORTUNITY", bg: "#16A34A", color: "#FFF", pulse: false },
  DISTRESSED: { label: "DISTRESSED", bg: "#EF4444", color: "#FFF", pulse: false },
  UPCOMING: { label: "UPCOMING", bg: BRAND.orange, color: "#000", pulse: false },
  FILED: { label: "FILED", bg: BRAND.blue, color: "#FFF", pulse: false },
  SOLD: { label: "SOLD", bg: "#F97316", color: "#FFF", pulse: false },
};

const CONFIDENCE_BADGES = {
  VERIFIED: { label: "VERIFIED", bg: "#166534", border: "#22C55E" },
  UNVERIFIED: { label: "UNVERIFIED", bg: "#92400E", border: BRAND.orange },
  INFERRED: { label: "INFERRED", bg: "#1E3A5F", border: "#60A5FA" },
};

const MAP_LEGEND = [
  { icon: "🏠", label: "Foreclosure", desc: "Court-ordered sale" },
  { icon: "📋", label: "Tax Deed", desc: "Tax certificate sale" },
  { icon: "⚖️", label: "Lis Pendens", desc: "Lawsuit filed" },
  { icon: "🔥", label: "Fire/Damage", desc: "NASA FIRMS detection" },
  { icon: "📊", label: "Distressed", desc: "Multiple signals" },
  { icon: "💰", label: "Opportunity", desc: "High score" },
];

// Mock property data
const MOCK_PROPERTY = {
  address: "625 Ocean St, Satellite Beach FL 32937",
  pin: "25-37-15-00-00123.0-0000.00",
  status: "UPCOMING",
  confidence: "VERIFIED",
  confidencePct: 92,
  source: "realauction",
  sourceLabel: "RealAuction.com",
  updatedAgo: "2 hours ago",
  saleDate: "Apr 15, 2026",
  openingBid: 145000,
  assessed: 289000,
  judgment: 312000,
  coords: "28.1687, -80.5901",
  bcpao: {
    assessed: 289000,
    owner: "Smith, John T & Mary L",
    lastSale: { price: 195000, date: "2019-06-14" },
    taxStatus: "DELINQUENT",
    taxYears: 2,
    landValue: 125000,
    buildingValue: 164000,
    yearBuilt: 1972,
    sqft: 1850,
    beds: 3,
    baths: 2,
    source: "bcpao",
    confidence: 95,
    updated: "2hr ago",
  },
  zoning: {
    code: "R-1",
    description: "Single-Family Residential",
    setbacks: { front: 25, side: 7.5, rear: 20 },
    maxHeight: 35,
    far: 0.45,
    lotSize: 7500,
    permitted: ["Single-family dwelling", "ADU (conditional)", "Home occupation"],
    prohibited: ["Multi-family", "Commercial", "Industrial"],
    source: "zoning_codes",
    confidence: 98,
    updated: "1 day ago",
  },
  court: {
    lisPendens: { date: "2025-01-12", case: "05-2025-CA-012345" },
    judgment: { date: "2025-11-03", amount: 312000 },
    plaintiff: "Wells Fargo Bank, N.A.",
    daysToAuction: 164,
    countyAvgDays: 420,
    source: "clerk_brevard",
    confidence: 88,
    updated: "4hr ago",
  },
  scores: {
    opportunity: 78,
    risk: 35,
    distress: 82,
    growth: 65,
    factors: [
      "Tax delinquent 2 years",
      "Lis pendens → judgment (pipeline)",
      "Rising ZHVI in Satellite Beach (+4.2% YoY)",
      "Below-market opening bid (50% of assessed)",
      "Coastal location premium",
    ],
  },
};

function Badge({ type, badges }) {
  const badge = badges[type];
  if (!badge) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.05em",
        background: badge.bg,
        color: badge.color || BRAND.textPrimary,
        border: badge.border ? `1px solid ${badge.border}` : "none",
      }}
    >
      {badge.pulse && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#FFF",
            animation: "pulse 1.5s infinite",
          }}
        />
      )}
      {badge.label}
    </span>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ width: 80, fontSize: 12, color: BRAND.textSecondary }}>{label}</span>
      <div
        style={{
          flex: 1,
          height: 8,
          background: "#1E293B",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
            transition: "width 0.8s ease",
          }}
        />
      </div>
      <span style={{ width: 32, fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function SourceFooter({ source, confidence, updated }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 8,
        marginTop: 8,
        borderTop: `1px solid ${BRAND.border}`,
        fontSize: 10,
        color: BRAND.textMuted,
      }}
    >
      <span>Source: <span style={{ color: BRAND.orange }}>{source}</span></span>
      <span>Confidence: <span style={{ color: confidence >= 80 ? BRAND.green : BRAND.orange }}>{confidence}%</span></span>
      <span>{updated}</span>
    </div>
  );
}

function TabBCPAO({ data }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 13 }}>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>ASSESSED VALUE</span>
          <div style={{ color: BRAND.textPrimary, fontWeight: 600 }}>${data.assessed.toLocaleString()}</div>
        </div>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>LAST SALE</span>
          <div style={{ color: BRAND.textPrimary }}>${data.lastSale.price.toLocaleString()} <span style={{ color: BRAND.textMuted, fontSize: 11 }}>({data.lastSale.date.slice(0, 4)})</span></div>
        </div>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>OWNER</span>
          <div style={{ color: BRAND.textPrimary }}>{data.owner}</div>
        </div>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>TAX STATUS</span>
          <div style={{ color: data.taxStatus === "DELINQUENT" ? BRAND.red : BRAND.green, fontWeight: 600 }}>
            {data.taxStatus} {data.taxYears > 0 && `(${data.taxYears}yr)`}
          </div>
        </div>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>YEAR BUILT</span>
          <div style={{ color: BRAND.textPrimary }}>{data.yearBuilt}</div>
        </div>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>SIZE</span>
          <div style={{ color: BRAND.textPrimary }}>{data.sqft.toLocaleString()} sqft · {data.beds}bd/{data.baths}ba</div>
        </div>
      </div>
      <SourceFooter source={data.source} confidence={data.confidence} updated={data.updated} />
    </div>
  );
}

function TabZoning({ data }) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 4,
            background: BRAND.navy,
            color: BRAND.orange,
            fontWeight: 700,
            fontSize: 14,
            marginRight: 8,
          }}
        >
          {data.code}
        </span>
        <span style={{ color: BRAND.textPrimary, fontSize: 13 }}>{data.description}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 12, marginBottom: 8 }}>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>FRONT</span>
          <div style={{ color: BRAND.textPrimary }}>{data.setbacks.front}ft</div>
        </div>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>SIDE</span>
          <div style={{ color: BRAND.textPrimary }}>{data.setbacks.side}ft</div>
        </div>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>REAR</span>
          <div style={{ color: BRAND.textPrimary }}>{data.setbacks.rear}ft</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 12, marginBottom: 8 }}>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>MAX HEIGHT</span>
          <div style={{ color: BRAND.textPrimary }}>{data.maxHeight}ft</div>
        </div>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>FAR</span>
          <div style={{ color: BRAND.textPrimary }}>{data.far}</div>
        </div>
        <div>
          <span style={{ color: BRAND.textMuted, fontSize: 10 }}>MIN LOT</span>
          <div style={{ color: BRAND.textPrimary }}>{data.lotSize.toLocaleString()} sqft</div>
        </div>
      </div>
      <div style={{ fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: BRAND.green }}>✓ Permitted:</span>{" "}
        <span style={{ color: BRAND.textSecondary }}>{data.permitted.join(" · ")}</span>
      </div>
      <div style={{ fontSize: 11 }}>
        <span style={{ color: BRAND.red }}>✗ Prohibited:</span>{" "}
        <span style={{ color: BRAND.textSecondary }}>{data.prohibited.join(" · ")}</span>
      </div>
      <SourceFooter source={data.source} confidence={data.confidence} updated={data.updated} />
    </div>
  );
}

function TabCourt({ data }) {
  const totalDays = data.countyAvgDays;
  const elapsed = totalDays - data.daysToAuction;
  const pct = Math.min(100, (elapsed / totalDays) * 100);

  return (
    <div>
      <div style={{ fontSize: 12, color: BRAND.textSecondary, marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: BRAND.textPrimary }}>{data.plaintiff}</span>
      </div>
      {/* Timeline */}
      <div style={{ position: "relative", marginBottom: 12, padding: "0 0 0 20px" }}>
        <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: BRAND.border }} />
        {[
          { label: "Lis Pendens Filed", date: data.lisPendens.date, done: true, color: BRAND.blue },
          { label: "Judgment Entered", date: data.judgment.date, amount: data.judgment.amount, done: true, color: BRAND.orange },
          { label: "Estimated Auction", date: `~${data.daysToAuction} days`, done: false, color: BRAND.green },
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: -17,
                top: 2,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: step.done ? step.color : BRAND.bgTab,
                border: `2px solid ${step.color}`,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: BRAND.textPrimary, fontWeight: step.done ? 400 : 600 }}>{step.label}</div>
              <div style={{ fontSize: 11, color: BRAND.textMuted }}>
                {step.date}
                {step.amount && <span style={{ color: BRAND.red }}> · ${step.amount.toLocaleString()}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div style={{ fontSize: 10, color: BRAND.textMuted, marginBottom: 4 }}>
        Pipeline progress (county avg {totalDays} days)
      </div>
      <div style={{ height: 6, background: BRAND.bgTab, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})`, borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: 10, color: BRAND.textMuted, textAlign: "right" }}>{Math.round(pct)}% complete</div>
      <SourceFooter source={data.source} confidence={data.confidence} updated={data.updated} />
    </div>
  );
}

function TabScore({ data }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <ScoreBar label="Opportunity" value={data.opportunity} color={BRAND.green} />
        <ScoreBar label="Risk" value={data.risk} color={BRAND.red} />
        <ScoreBar label="Distress" value={data.distress} color={BRAND.orange} />
        <ScoreBar label="Growth" value={data.growth} color={BRAND.blue} />
      </div>
      <div style={{ fontSize: 10, color: BRAND.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Contributing Factors
      </div>
      {data.factors.map((f, i) => (
        <div key={i} style={{ fontSize: 11, color: BRAND.textSecondary, padding: "2px 0", display: "flex", gap: 6 }}>
          <span style={{ color: BRAND.orange }}>›</span> {f}
        </div>
      ))}
    </div>
  );
}

function PropertyCard({ property, onClose }) {
  const [activeTab, setActiveTab] = useState("bcpao");
  const tabs = [
    { id: "bcpao", label: "BCPAO" },
    { id: "zoning", label: "Zoning" },
    { id: "court", label: "Court" },
    { id: "score", label: "Score" },
  ];

  return (
    <div
      style={{
        width: 360,
        background: BRAND.bgCard,
        borderRadius: 12,
        border: `1px solid ${BRAND.border}`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${BRAND.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <Badge type={property.status} badges={STATUS_BADGES} />
            <Badge type={property.confidence} badges={CONFIDENCE_BADGES} />
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: BRAND.textMuted,
              cursor: "pointer",
              fontSize: 18,
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.textPrimary, marginBottom: 2 }}>
          {property.address}
        </div>
        <div style={{ fontSize: 11, color: BRAND.textMuted, fontFamily: "monospace" }}>{property.pin}</div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 8,
            padding: "6px 10px",
            background: BRAND.bg,
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <div>
            <span style={{ color: BRAND.textMuted }}>Sale: </span>
            <span style={{ color: BRAND.orange, fontWeight: 600 }}>{property.saleDate}</span>
          </div>
          <div>
            <span style={{ color: BRAND.textMuted }}>Source: </span>
            <span style={{ color: BRAND.orange }}>{property.source}</span>
          </div>
          <div>
            <span style={{ color: BRAND.textMuted }}>Conf: </span>
            <span style={{ color: BRAND.green, fontWeight: 600 }}>{property.confidencePct}%</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12 }}>
          <div>
            <span style={{ color: BRAND.textMuted }}>Bid: </span>
            <span style={{ color: BRAND.green, fontWeight: 600 }}>${property.openingBid.toLocaleString()}</span>
          </div>
          <div>
            <span style={{ color: BRAND.textMuted }}>Assessed: </span>
            <span style={{ color: BRAND.textPrimary }}>${property.assessed.toLocaleString()}</span>
          </div>
          <div>
            <span style={{ color: BRAND.textMuted }}>Judgment: </span>
            <span style={{ color: BRAND.red }}>${property.judgment.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${BRAND.border}` }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "8px 0",
              background: activeTab === tab.id ? BRAND.bgTab : "transparent",
              color: activeTab === tab.id ? BRAND.orange : BRAND.textMuted,
              border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${BRAND.orange}` : "2px solid transparent",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.03em",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 14, minHeight: 180 }}>
        {activeTab === "bcpao" && <TabBCPAO data={property.bcpao} />}
        {activeTab === "zoning" && <TabZoning data={property.zoning} />}
        {activeTab === "court" && <TabCourt data={property.court} />}
        {activeTab === "score" && <TabScore data={property.scores} />}
      </div>

      {/* View Source Links */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "8px 14px 10px",
          borderTop: `1px solid ${BRAND.border}`,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "RealAuction", icon: "🔗" },
          { label: "BCPAO", icon: "🔗" },
          { label: "Court Filing", icon: "🔗" },
        ].map((link) => (
          <a
            key={link.label}
            href="#"
            style={{
              fontSize: 11,
              color: BRAND.orange,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {link.icon} {link.label}
          </a>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: BRAND.textMuted }}>{property.coords}</span>
      </div>
    </div>
  );
}

function LegendPanel({ visible, onToggle }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 50,
        left: 16,
        background: BRAND.bgCard,
        border: `1px solid ${BRAND.border}`,
        borderRadius: 10,
        padding: visible ? 14 : 0,
        width: visible ? 220 : "auto",
        transition: "all 0.3s",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          background: visible ? "none" : BRAND.bgCard,
          border: visible ? "none" : `1px solid ${BRAND.border}`,
          color: BRAND.textSecondary,
          cursor: "pointer",
          fontSize: 12,
          padding: visible ? "0 0 8px 0" : "8px 12px",
          borderRadius: visible ? 0 : 10,
          display: "flex",
          alignItems: "center",
          gap: 4,
          width: visible ? "100%" : "auto",
          borderBottom: visible ? `1px solid ${BRAND.border}` : "none",
          marginBottom: visible ? 8 : 0,
        }}
      >
        ⓘ LEGEND {visible ? "▾" : "▸"}
      </button>
      {visible && (
        <>
          <div style={{ fontSize: 9, color: BRAND.textMuted, letterSpacing: "0.08em", marginBottom: 6 }}>
            MAP SYMBOLS
          </div>
          {MAP_LEGEND.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 12 }}>
              <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{item.icon}</span>
              <span style={{ color: BRAND.textPrimary, fontWeight: 500 }}>{item.label}</span>
              <span style={{ color: BRAND.textMuted, fontSize: 10, marginLeft: "auto" }}>{item.desc}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function LiveBar() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 32,
        background: BRAND.bg,
        borderTop: `1px solid ${BRAND.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: 11,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, cursor: "pointer" }}>⏮</span>
        <span style={{ fontSize: 14, cursor: "pointer" }}>⏸</span>
        <span style={{ fontSize: 14, cursor: "pointer" }}>⏭</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 4,
            background: "#16A34A22",
            border: "1px solid #16A34A",
            color: BRAND.green,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.green, animation: "pulse 2s infinite" }} />
          LIVE
        </span>
        <span style={{ color: BRAND.textMuted, padding: "2px 6px", background: BRAND.bgTab, borderRadius: 4 }}>1x</span>
      </div>
      <div style={{ color: BRAND.orange, fontFamily: "monospace", fontSize: 12 }}>
        {time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
        {time.toLocaleTimeString("en-US", { hour12: false })}
      </div>
    </div>
  );
}

export default function PropertyIntelDashboard() {
  const [showCard, setShowCard] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: BRAND.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Mock map background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 60% 40%, #0F2744 0%, ${BRAND.bg} 70%)`,
        }}
      >
        {/* Fake map grid lines */}
        <svg width="100%" height="100%" style={{ opacity: 0.08 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="100%" y2={i * 50} stroke="#3B82F6" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="100%" stroke="#3B82F6" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Map pins */}
        {[
          { x: "58%", y: "35%", icon: "🏠", active: true },
          { x: "42%", y: "52%", icon: "📋", active: false },
          { x: "72%", y: "28%", icon: "⚖️", active: false },
          { x: "35%", y: "68%", icon: "🔥", active: false },
          { x: "65%", y: "60%", icon: "💰", active: false },
          { x: "48%", y: "22%", icon: "📊", active: false },
        ].map((pin, i) => (
          <div
            key={i}
            onClick={() => setShowCard(true)}
            style={{
              position: "absolute",
              left: pin.x,
              top: pin.y,
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
              fontSize: pin.active ? 28 : 20,
              filter: pin.active ? "drop-shadow(0 0 8px rgba(245,158,11,0.6))" : "none",
              transition: "transform 0.2s",
              zIndex: pin.active ? 10 : 1,
            }}
          >
            {pin.icon}
            {pin.active && (
              <div
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  border: `2px solid ${BRAND.orange}`,
                  animation: "pulse 2s infinite",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 44,
          background: `${BRAND.bg}EE`,
          borderBottom: `1px solid ${BRAND.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: BRAND.orange, fontWeight: 800, fontSize: 15 }}>ZONE</span>
          <span style={{ color: BRAND.textPrimary, fontWeight: 800, fontSize: 15 }}>WISE</span>
          <span
            style={{
              color: BRAND.green,
              fontSize: 10,
              fontWeight: 600,
              marginLeft: 4,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: BRAND.green,
                display: "inline-block",
              }}
            />
            LIVE
          </span>
          <span style={{ color: BRAND.textMuted, fontSize: 12, marginLeft: 8 }}>
            🛡 67
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: BRAND.textSecondary }}>
          <span>Layers</span>
          <span>Focus</span>
          <span>EN</span>
        </div>
      </div>

      {/* Property Card */}
      {showCard && (
        <div style={{ position: "absolute", top: 60, right: 16, zIndex: 15 }}>
          <PropertyCard property={MOCK_PROPERTY} onClose={() => setShowCard(false)} />
        </div>
      )}

      {/* Legend */}
      <LegendPanel visible={showLegend} onToggle={() => setShowLegend(!showLegend)} />

      {/* Live Bar */}
      <LiveBar />

      {/* Tap hint */}
      {!showCard && (
        <div
          onClick={() => setShowCard(true)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: `${BRAND.bgCard}DD`,
            border: `1px solid ${BRAND.border}`,
            borderRadius: 8,
            padding: "12px 20px",
            color: BRAND.textSecondary,
            fontSize: 13,
            cursor: "pointer",
            zIndex: 5,
          }}
        >
          Tap any pin to view property intelligence →
        </div>
      )}
    </div>
  );
}
