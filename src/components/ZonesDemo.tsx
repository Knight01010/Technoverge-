"use client";

import { useState } from "react";
import { FLOWS } from "@/content/site";

const ALERT = "#A4512B";

export default function ZonesDemo() {
  const [flow, setFlow] = useState(0);
  const f = FLOWS[flow];
  const ok = f[5] === "ok";

  return (
    <div className="card split" style={{ padding: 24, gridTemplateColumns: "minmax(0,3fr) minmax(260px,2fr)", gap: 32, alignItems: "center", boxShadow: "none" }}>
      <svg viewBox="0 0 820 380" role="img" aria-label="Network zones and the selected connection" style={{ width: "100%", height: "auto", display: "block" }}>
        <g fill="none" stroke="#C3C8C6" strokeWidth="1.5">
          <rect x="20" y="40" width="210" height="130" rx="6" /><rect x="305" y="40" width="210" height="130" rx="6" /><rect x="590" y="40" width="210" height="130" rx="6" />
          <rect x="20" y="230" width="210" height="110" rx="6" /><rect x="590" y="230" width="210" height="110" rx="6" />
          <line x1="552" y1="20" x2="552" y2="360" strokeDasharray="4 6" />
        </g>
        <g fontFamily="var(--sans)" fontSize="17" fill="#15191A">
          <text x="40" y="80">Office network</text><text x="325" y="80">DMZ</text><text x="610" y="80">Control network</text><text x="40" y="270">Internet</text><text x="610" y="270">Safety systems</text>
        </g>
        <g fontFamily="var(--mono)" fontSize="12" fill="#6B7375" letterSpacing="1">
          <text x="40" y="104">IT · LAPTOPS, EMAIL</text><text x="325" y="104">JUMP HOST · HISTORIAN COPY</text><text x="610" y="104">OT · PLCS, OPERATOR SCREENS</text><text x="40" y="294">VENDORS, ATTACKERS</text><text x="610" y="294">SIS · ISOLATED</text><text x="560" y="372">IT/OT FIREWALL</text>
        </g>
        {FLOWS.map((p, k) => (
          <path key={p[0]} d={p[4]} fill="none" style={{ stroke: flow === k ? (p[5] === "ok" ? "#2F5B40" : ALERT) : "rgba(21,25,26,0)", strokeWidth: 3, strokeDasharray: p[5] === "ok" ? "none" : "8 7", transition: "stroke 240ms ease-out" }} />
        ))}
        <g style={{ opacity: f[5] === "deny" ? 1 : 0, transition: "opacity 240ms ease-out" }}>
          <circle cx="552" cy="140" r="16" fill="#fff" stroke={ALERT} strokeWidth="2" />
          <path d="M545 133 L559 147 M559 133 L545 147" stroke={ALERT} strokeWidth="2.5" />
        </g>
      </svg>
      <div className="col" style={{ gap: 10 }}>
        {FLOWS.map((p, k) => (
          <button key={p[0]} type="button" className="chip" aria-pressed={flow === k} onClick={() => setFlow(k)}
            style={{ display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", border: `1px solid ${flow === k ? "rgba(21,25,26,.4)" : "rgba(21,25,26,.12)"}`, background: flow === k ? "var(--paper)" : "#fff" }}>
            <span style={{ fontWeight: 500, fontSize: 16 }}>{p[0]}</span>
            <span style={{ fontSize: 14, color: "var(--ink-3)" }}>{p[1]}</span>
          </button>
        ))}
        <div className="col" aria-live="polite" style={{ gap: 6, padding: "16px 18px", marginTop: 6, borderLeft: `4px solid ${ok ? "#2F5B40" : ALERT}`, background: ok ? "#E8F1EB" : "#F8E6DF", color: ok ? "#24533A" : "#7E3A1A" }}>
          <span className="lbl" style={{ color: "inherit" }}>{f[2]}</span>
          <span style={{ fontSize: 15, lineHeight: 1.55 }}>{f[3]}</span>
        </div>
      </div>
    </div>
  );
}
