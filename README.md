# MS Technoverge website

Marketing site for MS Technoverge, cybersecurity for critical industries in the GCC.

The homepage tells one story, a typical attack on a refinery, through a fixed 3D stage. Each scene starts realistic, then scans into a graphite "x-ray" drawing of its network that shows the attack and the control that stops it ("What you see. What we see."). 2D sections slide over the stage between scenes, each with a small interactive demo of the service involved.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- three.js for the stage, with a custom composite pass (x-ray edges, scan line, cursor lens, depth-of-field blur, grain)
- Lenis for smooth scrolling
- Anime.js 4 for the masked word reveals on headlines
- `next/font` for Archivo (display), Geist (text), Geist Mono (labels), plus Barlow and JetBrains Mono drawn into the 3D screens
- `@lucasmarkes/hairline` for the "How we work" line figures

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things live

| Path | What it is |
| --- | --- |
| `src/app/page.tsx` | Page order: story segments interleaved with 2D sections. Server-rendered, so all copy is in the HTML. |
| `src/components/Stage.tsx` | Client controller: canvas, Lenis, render loop, preloader, scroll choreography (captions, statements, story clock, cursor lens label). |
| `src/components/StorySegment.tsx` | A pinned 3D scene. `shot` picks the camera shot, `length` is its scroll length in viewport heights. |
| `src/scene/engine.js` | The 3D world: five sets (office, network room, control room, SOC, refinery), screen textures, network overlay, post-processing and camera shots. |
| `src/scene/engine.d.ts` | Types for the engine. |
| `src/content/site.ts` | Copy and data for the interactive sections, industries and case studies. |
| `src/components/*Demo.tsx`, `Timeline.tsx` | The interactive 2D demos (phishing email, multi-factor switch, network zones, detection timeline). |
| `src/components/WorkSections.tsx` | Industries, case study carousel and lifecycle. |

## How the story is driven

- Each `StorySegment` is a tall section with a sticky stage inside. `Stage` measures every segment each frame and gives the engine a shot index and a progress value (0 to 1), or two shots and a mix when one scene hands over to the next.
- `XR` in `engine.js` sets when each scene scans into x-ray (progress in and out). Captions fade out as the scan starts; the "What we see" statement rises in with it.
- Screens inside the 3D (mail, sign-in log, firewall console, SOC case) are canvas textures redrawn only when their state changes.

## Performance

- Phones (coarse pointer or under 820px wide) get a lower pixel ratio, 2x instead of 4x anti-aliasing, smaller shadow maps and lighter blur. The CSS grain layer is off on phones.
- The stage skips rendering when nothing has changed (no scroll, no pointer, no animation).
- Viewport height is held steady while a phone's address bar slides, so the page does not jump.

## Copy rules

- MS Technoverge does not run a SOC. Detection copy says we make the client's own team see more and act faster.
- The attack story is labelled as a typical pattern; names, hosts and domains are fictional.
- No em dashes in copy.
