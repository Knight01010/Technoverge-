export type ShotRef = { i: number; t: number; top?: number; cov?: number };
export type ShotState = { a: ShotRef; b: ShotRef | null; mix: number } | null;

/** Per-segment x-ray timing: [scan in start, scan in end, scan out start, scan out end] in segment progress. */
export const XR: ([number, number, number, number] | null)[];
export const FOCUS: number[];

export class Engine {
  constructor(canvas: HTMLCanvasElement, opts: { fonts: { bar: string; cond: string; mono: string }; reduced: boolean });
  ptr: { x: number; y: number };
  shot: ShotState;
  build: number;
  xrNow: number;
  xrShot: number;
  lensOn: boolean;
  LENS_R: number;
  MOB: boolean;
  three: unknown;
  init3D(): Promise<void>;
  frame3D(dt: number, time: number): void;
  dispose(): void;
}
