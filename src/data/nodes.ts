import type { NavNode, NodeType } from "../types/map";
const n = (id: string, type: NodeType, x: number, y: number): NavNode => ({ id, type, position: { x, y } });
// Ground floor: a rectangular corridor loop, a central spine, an east wing and stair/elevator stubs.
export const nodes: NavNode[] = [
  n("n1", "entrance", 0.5, 0.92),
  n("n2", "intersection", 0.5, 0.75),
  n("n3", "corner", 0.15, 0.75),
  n("n4", "intersection", 0.15, 0.5),
  n("n5", "corner", 0.15, 0.25),
  n("n6", "intersection", 0.35, 0.25),
  n("n7", "intersection", 0.65, 0.25),
  n("n8", "intersection", 0.85, 0.25),
  n("n9", "intersection", 0.85, 0.5),
  n("n10", "corner", 0.85, 0.75),
  n("n11", "intersection", 0.32, 0.75),
  n("n12", "intersection", 0.68, 0.75),
  n("n13", "intersection", 0.5, 0.25),
  n("n14", "intersection", 0.5, 0.5),
  n("n15", "stairs", 0.07, 0.5),
  n("n17", "stairs", 0.93, 0.5),
  n("n18", "intersection", 0.3, 0.5),
  n("n19", "intersection", 0.7, 0.5),
  n("n20", "corner", 0.93, 0.25),
  n("n21", "corner", 0.93, 0.12),
];
