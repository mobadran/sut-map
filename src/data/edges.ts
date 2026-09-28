import type { Edge } from "../types/map";
const E = (id: number, from: string, to: string): Edge => ({
  id: `edge-${id}`,
  from,
  to,
});
const G = (id: number, from: string, to: string, isOpen: boolean): Edge => ({
  id: `edge-${id}`,
  from,
  to,
  isGate: true,
  isOpen,
});
export const initialEdges: Edge[] = [
  E(1, "n1", "n2"),
  E(2, "n3", "n11"),
  E(3, "n11", "n2"),
  E(4, "n2", "n12"),
  G(5, "n12", "n10", true), // south-east corridor gate (open)
  E(6, "n3", "n4"),
  E(7, "n4", "n5"),
  E(8, "n5", "n6"),
  E(9, "n6", "n13"),
  E(10, "n13", "n7"),
  E(11, "n7", "n8"),
  E(12, "n8", "n9"),
  E(13, "n9", "n10"),
  G(14, "n2", "n14", false), // central spine gate (open)
  E(15, "n14", "n13"),
  E(16, "n4", "n18"),
  E(17, "n18", "n14"),
  E(18, "n14", "n19"),
  E(19, "n19", "n9"),
  E(20, "n4", "n15"),
  E(21, "n9", "n17"),
  E(22, "n19", "n16"),
  G(23, "n8", "n20", true), // east wing gate (open)
  E(24, "n20", "n21"),
];
