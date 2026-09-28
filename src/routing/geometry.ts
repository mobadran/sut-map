import type { Point } from "../types/map";
/** Normalized x/y span different lengths; all math is done in "world" space (x scaled by aspect ratio). */
export const ASPECT = 1.6;
export const METERS_PER_UNIT = 120;
export const toWorld = (p: Point): Point => ({ x: p.x * ASPECT, y: p.y });
export const fromWorld = (p: Point): Point => ({ x: p.x / ASPECT, y: p.y });
export const distance = (a: Point, b: Point) => Math.hypot((a.x - b.x) * ASPECT, a.y - b.y);
export const vec = (a: Point, b: Point): Point => ({ x: (b.x - a.x) * ASPECT, y: b.y - a.y });

export function closestPointOnSegment(point: Point, segmentStart: Point, segmentEnd: Point): Point {
  const A = toWorld(segmentStart), B = toWorld(segmentEnd), P = toWorld(point);
  const dx = B.x - A.x, dy = B.y - A.y, l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((P.x - A.x) * dx + (P.y - A.y) * dy) / l2));
  return fromWorld({ x: A.x + t * dx, y: A.y + t * dy });
}

/** Signed angle (deg) from v1 to v2; positive = clockwise on screen = right turn. */
export function angleBetween(v1: Point, v2: Point): number {
  const cross = v1.x * v2.y - v1.y * v2.x, dot = v1.x * v2.x + v1.y * v2.y;
  return (Math.atan2(cross, dot) * 180) / Math.PI;
}

export type Turn = "straight" | "slight-left" | "slight-right" | "left" | "right" | "sharp-left" | "sharp-right";
export function classifyTurn(a: Point, b: Point, c: Point): Turn {
  const v1 = vec(a, b), v2 = vec(b, c);
  if (Math.hypot(v1.x, v1.y) < 1e-6 || Math.hypot(v2.x, v2.y) < 1e-6) return "straight";
  const ang = angleBetween(v1, v2), m = Math.abs(ang), s = ang > 0 ? "right" : "left";
  if (m < 20) return "straight";
  if (m < 60) return `slight-${s}`;
  if (m < 135) return s;
  return `sharp-${s}`;
}
