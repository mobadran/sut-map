import type { NavNode, Route } from "../types/map";
import { METERS_PER_UNIT, classifyTurn, distance, vec, type Turn } from "./geometry";

const TURN: Record<Exclude<Turn, "straight">, string> = {
  left: "Turn left",
  right: "Turn right",
  "slight-left": "Bear slightly left",
  "slight-right": "Bear slightly right",
  "sharp-left": "Make a sharp left",
  "sharp-right": "Make a sharp right",
};

export function buildDirections(route: Route, _nodes?: NavNode[]): string[] {
  const { points, startRoom, room } = route;

  if (route.length < 0.004) {
    return [`You are already at ${room.name}.`];
  }

  const m = (i: number) => Math.round(distance(points[i], points[i + 1]) * METERS_PER_UNIT);
  const steps: string[] = [];

  let head = `Start at ${startRoom.name} and walk`, run = m(0);

  for (let i = 1; i < points.length - 1; i++) {
    const t = classifyTurn(points[i - 1], points[i], points[i + 1]);
    if (t === "straight") {
      run += m(i);
      continue;
    }
    steps.push(`${head} ${run} m.`);
    head = `${TURN[t]}, then walk`;
    run = m(i);
  }
  steps.push(`${head} ${run} m.`);

  for (let i = points.length - 2; i >= 0; i--) {
    const d = vec(points[i], points[i + 1]);
    if (Math.hypot(d.x, d.y) < 1e-6) continue;
    const to = vec(route.entrance, { x: room.x, y: room.y });
    const cross = d.x * to.y - d.y * to.x;
    steps.push(`${room.name} is on your ${Math.abs(cross) < 1e-4 ? "front" : cross > 0 ? "right" : "left"}.`);
    break;
  }

  return steps;
}
