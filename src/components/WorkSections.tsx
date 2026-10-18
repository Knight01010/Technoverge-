"use client";

import { useRef, useState } from "react";
import { Branches, Cabinet, Dish, Loupe, Padlock, Sieve } from "@lucasmarkes/hairline/react";
import Reveal from "@/components/Reveal";
import { CASES, IND, LIFE } from "@/content/site";

const TABS = ["Challenge", "Approach", "Outcome"];
const FIGS = { loupe: Loupe, sieve: Sieve, branches: Branches, cabinet: Cabinet, padlock: Padlock, dish: Dish } as const;

/** Industries list and the case study carousel share state: picking an industry jumps to its case. */
export function IndustriesAndCases() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const [tab, setTab] = useState<number[]>(CASES.map(() => 0));
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scrollTrack = (dir: number) => {
    const t = trackRef.current;
    if (t) t.scrollBy({ left: dir * Math.min(560, t.clientWidth), behavior: reduced() ? "auto" : "smooth" });
  };
  const pick = (i: number) => {
    const cs = IND[i][2];
    const behavior = reduced() ? "auto" : "smooth";
    if (cs >= 0 && trackRef.current && cardRefs.current[cs]) {
      const t = trackRef.current, c = cardRefs.current[cs]!;
      t.scrollTo({ left: c.offsetLeft - t.offsetLeft - 32, behavior });
      document.getElementById("cases")?.scrollIntoView({ behavior, block: "start" });
      setActive(cs);
    } else {
      document.getElementById("contact")?.scrollIntoView({ behavior, block: "end" });
    }
  };

  return (
    <>
      <section id="industries" className="d2">
        <div className="wrap sec" style={{ paddingBottom: 104 }}>
          <div className="split" style={{ alignItems: "end", marginBottom: 48 }}>
            <div className="col" style={{ gap: 22 }}><span className="lbl">Industries</span><Reveal className="disp h2">Built for places that can’t pause.</Reveal></div>
            <p className="lead">The refinery was one example. The same layers protect banks, hospitals, factories and campuses across the GCC.</p>
          </div>
          <div className="col" style={{ borderTop: "1px solid rgba(21,25,26,.16)" }}>
            {IND.map((d, i) => (
              <button key={d[0]} type="button" className="row ind-row" onClick={() => pick(i)}
                style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr) auto", gap: 24, alignItems: "center", padding: "26px 8px", border: "none", borderBottom: "1px solid rgba(21,25,26,.1)", background: "transparent", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontFamily: "var(--display)", fontStretch: "125%", textTransform: "uppercase", fontSize: "clamp(24px,2.2vw,34px)", fontWeight: 500, letterSpacing: "-.01em" }}>{d[0]}</span>
                <span style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-3)" }}>{d[1]}</span>
                <span className="go" style={{ fontSize: 15, color: "var(--accent)", whiteSpace: "nowrap" }}>{d[2] >= 0 ? "Case study →" : "Talk to us →"}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="cases" className="d2" style={{ background: "#FAFAF8" }}>
        <div className="wrap" style={{ paddingTop: 104, paddingBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div className="col" style={{ gap: 22 }}><span className="lbl">Case studies</span><Reveal className="disp h2" style={{ maxWidth: "15ch" }}>Secured without stopping operations.</Reveal></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="ghost" onClick={() => scrollTrack(-1)} aria-label="Previous case study" style={{ width: 52, height: 52, justifyContent: "center", padding: 0 }}>←</button>
            <button type="button" className="btn" onClick={() => scrollTrack(1)} aria-label="Next case study" style={{ width: 52, height: 52, justifyContent: "center", padding: 0 }}>→</button>
          </div>
        </div>
        <div ref={trackRef} className="cases-track"
          style={{ display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory", scrollPadding: "0 32px", padding: "8px max(32px, calc((100vw - 1296px) / 2)) 104px", scrollbarWidth: "none" }}>
          {CASES.map((c, i) => {
            const ti = tab[i];
            return (
              <article key={c.title} ref={(el) => { cardRefs.current[i] = el; }}
                style={{ flex: "0 0 min(520px, 86vw)", scrollSnapAlign: "start", padding: 6, borderRadius: 8, background: i === active ? "rgba(47,91,64,.12)" : "rgba(21,25,26,.035)", border: `1px solid ${i === active ? "rgba(47,91,64,.28)" : "rgba(21,25,26,.06)"}` }}>
                <div className="col" style={{ height: "100%", minHeight: 520, padding: 32, borderRadius: 6, background: "#fff", gap: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span className="lbl" style={{ color: "var(--ink)" }}>{c.sector}</span><span className="lbl">{c.region}</span></div>
                  <h3 style={{ margin: 0, fontSize: 26, fontWeight: 400, letterSpacing: "-.025em", lineHeight: 1.2, textWrap: "balance" }}>{c.title}</h3>
                  <div role="tablist" aria-label="Case study detail" style={{ display: "flex", gap: 4, background: "rgba(21,25,26,.05)", borderRadius: 6, padding: 4, alignSelf: "flex-start" }}>
                    {TABS.map((nm, k) => (
                      <button key={nm} type="button" role="tab" aria-selected={k === ti} onClick={() => setTab((a) => a.map((v, j) => (j === i ? k : v)))}
                        style={{ fontSize: 14, padding: "8px 16px", minHeight: 40, borderRadius: 4, border: "none", cursor: "pointer", background: k === ti ? "#fff" : "transparent", color: k === ti ? "var(--ink)" : "var(--ink-3)", boxShadow: k === ti ? "0 6px 16px -10px rgba(21,25,26,.4)" : "none", transition: "all 180ms cubic-bezier(.32,.72,0,1)" }}>
                        {nm}
                      </button>
                    ))}
                  </div>
                  <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 8, fontSize: 16, lineHeight: 1.5, color: "#2A302F", minHeight: 156 }}>
                    {c.tabs[ti].map((p) => <li key={p}>{p}</li>)}
                  </ul>
                  <span style={{ fontSize: 13, color: "var(--mute)", marginTop: "auto" }}>Client confidential. Detailed outcomes available under NDA.</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

export function Lifecycle() {
  return (
    <section id="lifecycle" className="d2">
      <div className="wrap sec" style={{ paddingTop: 104 }}>
        <div className="split" style={{ alignItems: "end", marginBottom: 48 }}>
          <div className="col" style={{ gap: 22 }}><span className="lbl">How we work</span><Reveal className="disp h2">A lifecycle, not a handoff.</Reveal></div>
          <p className="lead">Six stages, run by one team. What we learn after go-live feeds straight back into the next assessment.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", borderTop: "1px solid rgba(21,25,26,.14)" }}>
          {LIFE.map(([title, desc, fig]) => {
            const Fig = FIGS[fig as keyof typeof FIGS];
            return (
              <div key={title} className="col" style={{ padding: "22px 22px 26px 0", gap: 12, borderBottom: "1px solid rgba(21,25,26,.08)" }}>
                <div style={{ width: "100%", maxWidth: 180, ["--hairline-plate" as string]: "#F4F4F1", ["--hairline-hi" as string]: "#15191A", ["--hairline-edge" as string]: "#8D9493", ["--hairline-mid" as string]: "#C3C8C6", ["--hairline-lo" as string]: "#E1E4E2", ["--hairline-stroke" as string]: 1 }}>
                  {Fig && <Fig intensity={0.5} theme="light" />}
                </div>
                <span style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-.025em" }}>{title}</span>
                <span style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink-3)" }}>{desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
