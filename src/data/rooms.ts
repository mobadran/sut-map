import type { Room } from "../types/map";
const r = (id: string, name: string, x: number, y: number, entranceEdgeId?: string): Room => ({ id, name, x, y, entranceEdgeId });
export const rooms: Room[] = [
  r("r1", "A001", 0.25, 0.87), r("r2", "A002", 0.6, 0.87), r("r3", "A010", 0.07, 0.36), r("r4", "A011", 0.07, 0.64),
  // A020 is a large hall with two entrances (two records, same name)
  r("r5", "A020", 0.25, 0.16), r("r6", "A020", 0.75, 0.16),
  r("r7", "A021", 0.42, 0.16),
  r("r8", "A030", 0.97, 0.16),      // east wing, only reachable through gate edge-23
  r("r9", "A041", 0.6, 0.36), r("r10", "A050", 0.76, 0.87),
  // Wall case: the Library corridor (edge-16/17) is geometrically closer, but a wall separates them,
  // so the entrance is pinned to the south corridor edge.
  r("r11", "A005", 0.42, 0.62, "edge-3"),
];
