"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { animate, splitText, stagger, utils } from "animejs";
import { Engine, XR } from "@/scene/engine";
import { CLOCK } from "@/content/site";

const PRE_CHECKS: [string, string][] = [["Email gateway", "Checked"], ["Identity", "Checked"], ["IT/OT boundary", "Checked"], ["Monitoring", "Live"]];

type Vis = { i: number; t: number; top: number; cov: number };
type Split = { words: HTMLElement[]; shown: boolean; revert: () => void };

const sm = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Splits a heading into masked words and hides them, ready to rise in. */
function prepWords(el: Element | null): Split | null {
  if (!el) return null;
  const s = splitText(el as HTMLElement, { words: { wrap: "clip" } });
  const words = s.words as HTMLElement[];
  utils.set(words, { y: "110%" });
  return { words, shown: false, revert: () => s.revert() };
}
function showWords(s: Split | null, delay = 0) {
  if (!s || s.shown) return;
  s.shown = true;
  animate(s.words, { y: "0%", duration: 1000, delay: stagger(60, { start: delay }), ease: "outExpo" });
}
function hideWords(s: Split | null) {
  if (!s || !s.shown) return;
  s.shown = false;
  animate(s.words, { y: "110%", duration: 420, ease: "inQuad" });
}

export default function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const checksRef = useRef<HTMLDivElement>(null);
  const preStateRef = useRef<HTMLSpanElement>(null);
  const preBarRef = useRef<HTMLElement>(null);
  const preNRef = useRef<HTMLSpanElement>(null);
  const preLineRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const css = getComputedStyle(root);
    const fam = (v: string, fb: string) => (css.getPropertyValue(v).trim() || fb) + ", Helvetica, Arial, sans-serif";

    // film grain texture for the CSS overlay (desktop only, hidden on phones by CSS)
    try {
      const n = document.createElement("canvas");
      n.width = n.height = 180;
      const g = n.getContext("2d")!;
      const im = g.createImageData(180, 180);
      for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      g.putImageData(im, 0, 0);
      if (grainRef.current) grainRef.current.style.backgroundImage = `url(${n.toDataURL()})`;
    } catch {}

    const engine = new Engine(canvasRef.current!, {
      fonts: { bar: fam("--font-screen", '"Barlow"'), cond: fam("--font-screen-cond", '"Barlow Condensed"'), mono: fam("--font-screen-mono", '"JetBrains Mono"') },
      reduced,
    });
    let ready = false, failed = false;
    engine.init3D().then(() => { ready = true; }).catch((e) => { failed = true; console.error("3D stage failed to start", e); });
    if (process.env.NODE_ENV !== "production") (window as unknown as { __tv: Engine }).__tv = engine;

    const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1 });

    // story DOM, rendered by server components
    const q = <T extends Element>(s: string) => Array.from(document.querySelectorAll<T & HTMLElement>(s));
    const segs = q<HTMLElement>("[data-seg]").sort((a, b) => +a.dataset.seg! - +b.dataset.seg!);
    const scrims: (HTMLElement | undefined)[] = [];
    q<HTMLElement>("[data-scrim]").forEach((el) => { scrims[+el.dataset.scrim!] = el; });
    const caps: (HTMLElement | undefined)[] = [], stms: (HTMLElement | undefined)[] = [], bigs: (Split | null)[] = [];
    q<HTMLElement>("[data-cap]").forEach((el) => { caps[+el.dataset.cap!] = el; });
    q<HTMLElement>("[data-stm]").forEach((el) => { const i = +el.dataset.stm!; stms[i] = el; bigs[i] = prepWords(el.querySelector(".big")); });
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const heroH = prepWords(document.querySelector("[data-hero-h]"));
    const contact = document.querySelector<HTMLElement>("[data-contact]");
    if (contact) contact.style.opacity = "0";
    if (hero) hero.style.opacity = "0";
    const rows = checksRef.current ? Array.from(checksRef.current.querySelectorAll<HTMLElement>("[data-check]")) : [];

    const dots = clockRef.current ? Array.from(clockRef.current.querySelectorAll<HTMLElement>("[data-dot]")) : [];
    const times = clockRef.current ? Array.from(clockRef.current.querySelectorAll<HTMLElement>("[data-time]")) : [];

    let mouse = false, lastMove = 0;
    const onMove = (e: PointerEvent) => {
      mouse = e.pointerType === "mouse"; lastMove = performance.now();
      const w = window.innerWidth || 1, h = Math.min(window.innerHeight || 1, 940);
      engine.ptr.x = (e.clientX / w) * 2 - 1; engine.ptr.y = -((e.clientY / h) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let lastSh: number | null = null, lastVw = 0, preP = 0, preDone = false;
    const t0 = performance.now();

    const update = () => {
      const vh = window.innerHeight || 900, vw = window.innerWidth || 1440;
      const sh0 = Math.min(vh, 940);
      // hold the stage height steady while a phone's address bar slides in and out
      if (lastSh == null || vw !== lastVw || Math.abs(sh0 - lastSh) > 160) { lastSh = sh0; lastVw = vw; root.style.setProperty("--sh", sh0 + "px"); }
      const sh = lastSh;
      const vis: Vis[] = [];
      segs.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - sh)));
        if (r.top < sh && r.bottom > 0) vis.push({ i, t, top: r.top, cov: (Math.min(r.bottom, sh) - Math.max(r.top, 0)) / sh });
        const xr = XR[i];
        let capOp = 0, stmOp = 0;
        const cap = caps[i];
        if (cap) {
          const op = sm(0.04, 0.12, t) * (1 - (xr ? sm(xr[0] - 0.05, xr[0], t) : sm(0.84, 0.95, t)));
          cap.style.opacity = op.toFixed(3);
          cap.style.transform = `translateY(${((1 - sm(0.04, 0.12, t)) * 18).toFixed(1)}px)`;
          capOp = op;
        }
        const st = stms[i];
        if (st) {
          const x = engine.xrShot === i ? engine.xrNow : 0;
          const op = sm(0.55, 0.95, x);
          st.style.opacity = op.toFixed(3);
          stmOp = op;
          if (op > 0.05) showWords(bigs[i]); else if (op < 0.01) hideWords(bigs[i]);
        }
        if (scrims[i]) scrims[i]!.style.opacity = Math.max(capOp, stmOp).toFixed(3);
        if (i === 0 && hero) {
          const op = (preDone ? 1 : 0) * (1 - sm(0.45, 0.8, t));
          hero.style.opacity = op.toFixed(3);
          hero.style.visibility = op < 0.01 ? "hidden" : "visible";
        }
        if (i === 7 && contact) contact.style.opacity = sm(0, 0.3, Math.max(0, Math.min(1, (sh - r.top) / sh))).toFixed(3);
      });

      // preloader
      if (!preDone) {
        const isReady = ready || failed, el = performance.now() - t0;
        // never faster than the checks can be read, never stuck if the stage is slow
        const target = Math.min(isReady ? 1 : 0.88, el / 2600, isReady ? 1 : 0.3 + el / 4000);
        preP += (target - preP) * 0.08;
        if (preBarRef.current) preBarRef.current.style.width = (preP * 100).toFixed(1) + "%";
        if (preNRef.current) preNRef.current.textContent = String(Math.round(preP * 100)).padStart(3, "0");
        if (fillRef.current) fillRef.current.style.clipPath = `inset(0 ${(100 - preP * 100).toFixed(2)}% 0 0)`;
        rows.forEach((row, k) => {
          const shown = preP > k * 0.2 + 0.02, done = preP > (k + 1) * 0.2 + 0.04;
          row.classList.toggle("on", shown);
          if (done !== row.classList.contains("ok")) {
            row.classList.toggle("ok", done);
            const st = row.querySelector<HTMLElement>("[data-status]");
            if (st) st.textContent = done ? st.dataset.done! : "Checking";
          }
        });
        if (preStateRef.current) preStateRef.current.textContent = preP > 0.97 ? "All clear" : "Scanning";
        if (isReady && preP > 0.985 && el > 2700) {
          preDone = true;
          if (preNRef.current) preNRef.current.textContent = "100";
          if (preBarRef.current) preBarRef.current.style.width = "100%";
          if (fillRef.current) fillRef.current.style.clipPath = "inset(0 0 0 0)";
          if (reduced) { if (preRef.current) preRef.current.style.display = "none"; }
          else {
            preRef.current?.classList.add("out"); preLineRef.current?.classList.add("go");
            window.setTimeout(() => { if (preRef.current) preRef.current.style.display = "none"; if (preLineRef.current) preLineRef.current.style.display = "none"; }, 1300);
          }
          showWords(heroH, reduced ? 0 : 520);
        }
      }

      engine.lensOn = mouse && performance.now() - lastMove < 2600;
      const th = engine.three as null | { lensAmt: number; lensP: { x: number; y: number } };
      if (lensRef.current && th) {
        lensRef.current.style.opacity = th.lensAmt.toFixed(3);
        lensRef.current.style.transform = `translate(${(th.lensP.x * vw - 44).toFixed(1)}px,${((1 - th.lensP.y) * sh + engine.LENS_R + 12).toFixed(1)}px)`;
      }

      if (!vis.length) engine.shot = null;
      else if (vis.length === 1) engine.shot = { a: vis[0], b: null, mix: 0 };
      else { const lo = vis[vis.length - 1]; engine.shot = { a: vis[0], b: lo, mix: sm(0, 1, (sh - lo.top) / sh) }; }

      let cur = -1;
      if (engine.shot) { const s = engine.shot.b && engine.shot.mix > 0.5 ? engine.shot.b : engine.shot.a; cur = s.i; }
      const cov = vis.reduce((m, v) => Math.max(m, v.cov), 0);
      if (clockRef.current) clockRef.current.style.opacity = cur >= 1 && cur <= 6 ? (sm(0.82, 0.98, cov) * (1 - sm(0.05, 0.4, engine.xrNow))).toFixed(3) : "0";
      CLOCK.forEach((c, k) => {
        const on = cur >= c[1];
        if (dots[k]) dots[k].style.background = on ? (c[1] <= 3 ? "#A4512B" : "#2F5B40") : "transparent";
        if (times[k]) times[k].style.color = cur === c[1] ? "#15191A" : "#8D9594";
      });
    };

    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      lenis.raf(now);
      if (document.hidden) return;
      if (engine.three) engine.build = reduced ? 1 : Math.min(1, engine.build + dt / 0.9);
      update();
      if (engine.three && engine.shot) engine.frame3D(dt, now / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      lenis.destroy();
      engine.dispose();
      [heroH, ...bigs].forEach((sp) => sp?.revert());
    };
  }, []);

  return (
    <>
      <div ref={preRef} className="pre" role="status" aria-label="Loading MS Technoverge">
        <div className="pre-in">
          <div className="pre-mark" aria-hidden="true">
            <span className="o">MS Technoverge</span>
            <span ref={fillRef} className="f">MS Technoverge</span>
          </div>
          <div ref={checksRef} className="pre-checks" aria-hidden="true">
            {PRE_CHECKS.map(([k, done]) => (
              <div key={k} data-check className="pre-row">
                <span className="k">{k}</span>
                <span className="lead" />
                <span className="st"><i className="pulse" /><span data-status data-done={done}>Checking</span></span>
              </div>
            ))}
          </div>
          <div className="pre-foot">
            <div className="pre-bar"><i ref={preBarRef} /></div>
            <span ref={preStateRef} className="lbl">Scanning</span>
            <span ref={preNRef} className="lbl">000</span>
          </div>
        </div>
      </div>
      <div ref={preLineRef} className="pre-line" aria-hidden="true" />
      <div ref={lensRef} className="lens-lbl" aria-hidden="true">What we see</div>
      <div ref={grainRef} className="grain" aria-hidden="true" />
      <canvas ref={canvasRef} className="stage-canvas" aria-hidden="true" />
      <aside ref={clockRef} className="clock" aria-hidden="true">
        {CLOCK.map(([t]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
            <span data-time className="lbl" style={{ fontSize: 11, transition: "color 200ms ease-out" }}>{t}</span>
            <span data-dot style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid rgba(21,25,26,.35)", transition: "background 200ms ease-out" }} />
          </div>
        ))}
      </aside>
    </>
  );
}
