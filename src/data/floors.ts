import type { Edge, FloorId, NavNode, NodeType, Room } from "../types/map";

type NodeSeed = { key: string; type: NodeType; x: number; y: number; label?: string };
type EdgeSeed = { key: string; from: string; to: string; gate?: boolean; open?: boolean };
type RoomSeed = { key: string; name: string; x: number; y: number; edge?: string };

export type FloorMap = {
  id: FloorId;
  label: string;
  primaryColor: string;
  nodes: NavNode[];
  edges: Edge[];
  rooms: Room[];
};

const makeFloor = (
  id: FloorId,
  label: string,
  primaryColor: string,
  nodeSeeds: NodeSeed[],
  edgeSeeds: EdgeSeed[],
  roomSeeds: RoomSeed[],
): FloorMap => ({
  id,
  label,
  primaryColor,
  nodes: nodeSeeds.map((node) => ({
    id: `${id}:${node.key}`,
    type: node.type,
    position: { x: node.x, y: node.y },
    floorId: id,
    label: node.label,
  })),
  edges: edgeSeeds.map((edge) => edge.gate
    ? {
        id: `${id}:${edge.key}`,
        from: `${id}:${edge.from}`,
        to: `${id}:${edge.to}`,
        isGate: true as const,
        isOpen: edge.open ?? false,
      }
    : {
        id: `${id}:${edge.key}`,
        from: `${id}:${edge.from}`,
        to: `${id}:${edge.to}`,
      }),
  rooms: roomSeeds.map((room) => ({
    id: `${id}:${room.key}`,
    name: room.name,
    x: room.x,
    y: room.y,
    floorId: id,
    entranceEdgeId: room.edge ? `${id}:${room.edge}` : undefined,
  })),
});

const basement = makeFloor(
  "basement",
  "Basement",
  "#0f9d8a",
  [
    { key: "entry", type: "entrance", x: 0.5, y: 0.92, label: "Basement entry" },
    { key: "south", type: "corner", x: 0.5, y: 0.73 },
    { key: "west", type: "intersection", x: 0.18, y: 0.73 },
    { key: "west-north", type: "intersection", x: 0.18, y: 0.38 },
    { key: "stairs-west", type: "stairs", x: 0.08, y: 0.38, label: "West stairs" },
    { key: "center", type: "intersection", x: 0.5, y: 0.38 },
    { key: "east-north", type: "intersection", x: 0.82, y: 0.38 },
    { key: "stairs-east", type: "stairs", x: 0.92, y: 0.38, label: "East stairs" },
    { key: "east", type: "corner", x: 0.82, y: 0.73 },
  ],
  [
    { key: "entry-south", from: "entry", to: "south" },
    { key: "south-west", from: "south", to: "west" },
    { key: "west-north", from: "west", to: "west-north" },
    { key: "north-west-stairs", from: "west-north", to: "stairs-west" },
    { key: "west-center", from: "west-north", to: "center" },
    { key: "center-east", from: "center", to: "east-north" },
    { key: "east-stairs", from: "east-north", to: "stairs-east" },
    { key: "east-south", from: "east-north", to: "east" },
    { key: "south-east", from: "east", to: "south" },
  ],
  [
    { key: "b001", name: "Gym", x: 0.3, y: 0.15, edge: "west-center" },
    { key: "b002", name: "Prayer Room", x: 0.62, y: 0.15, edge: "center-east" },
    { key: "b010", name: "Storage Room", x: 0.62, y: 0.15, edge: "center-east" },
    { key: "b011", name: "WC", x: 0.72, y: 0.15, edge: "center-east" },
  ],
);

const ground = makeFloor(
  "ground",
  "Ground",
  "#2563eb",
  [
    { key: "n1", type: "entrance", x: 0.5, y: 0.92 },
    { key: "n2", type: "intersection", x: 0.5, y: 0.75 },
    { key: "n3", type: "corner", x: 0.15, y: 0.75 },
    { key: "n4", type: "intersection", x: 0.15, y: 0.5 },
    { key: "n5", type: "corner", x: 0.15, y: 0.25 },
    { key: "n6", type: "intersection", x: 0.35, y: 0.25 },
    { key: "n7", type: "intersection", x: 0.65, y: 0.25 },
    { key: "n8", type: "intersection", x: 0.85, y: 0.25 },
    { key: "n9", type: "intersection", x: 0.85, y: 0.5 },
    { key: "n10", type: "corner", x: 0.85, y: 0.75 },
    { key: "n11", type: "intersection", x: 0.32, y: 0.75 },
    { key: "n12", type: "intersection", x: 0.68, y: 0.75 },
    { key: "n13", type: "intersection", x: 0.5, y: 0.25 },
    { key: "n14", type: "intersection", x: 0.5, y: 0.5 },
    { key: "n15", type: "stairs", x: 0.07, y: 0.5 },
    { key: "n17", type: "stairs", x: 0.93, y: 0.5 },
    { key: "n18", type: "intersection", x: 0.3, y: 0.5 },
    { key: "n19", type: "intersection", x: 0.7, y: 0.5 },
    { key: "n20", type: "corner", x: 0.93, y: 0.25 },
    { key: "n21", type: "corner", x: 0.93, y: 0.12 },
  ],
  [
    { key: "edge-1", from: "n1", to: "n2" },
    { key: "edge-2", from: "n3", to: "n11" },
    { key: "edge-3", from: "n11", to: "n2" },
    { key: "edge-4", from: "n2", to: "n12" },
    { key: "edge-5", from: "n12", to: "n10", gate: true, open: true },
    { key: "edge-6", from: "n3", to: "n4" },
    { key: "edge-7", from: "n4", to: "n5" },
    { key: "edge-8", from: "n5", to: "n6" },
    { key: "edge-9", from: "n6", to: "n13" },
    { key: "edge-10", from: "n13", to: "n7" },
    { key: "edge-11", from: "n7", to: "n8" },
    { key: "edge-12", from: "n8", to: "n9" },
    { key: "edge-13", from: "n9", to: "n10" },
    { key: "edge-14", from: "n2", to: "n14", gate: true, open: false },
    { key: "edge-15", from: "n14", to: "n13" },
    { key: "edge-16", from: "n4", to: "n18" },
    { key: "edge-17", from: "n18", to: "n14" },
    { key: "edge-18", from: "n14", to: "n19" },
    { key: "edge-19", from: "n19", to: "n9" },
    { key: "edge-20", from: "n4", to: "n15" },
    { key: "edge-21", from: "n9", to: "n17" },
    { key: "edge-23", from: "n8", to: "n20", gate: true, open: true },
    { key: "edge-24", from: "n20", to: "n21" },
  ],
  [
    { key: "r1", name: "A001", x: 0.25, y: 0.87 },
    { key: "r2", name: "A002", x: 0.6, y: 0.87 },
    { key: "r3", name: "A010", x: 0.07, y: 0.36 },
    { key: "r4", name: "A011", x: 0.07, y: 0.64 },
    { key: "r5", name: "A020", x: 0.25, y: 0.16 },
    { key: "r6", name: "A020", x: 0.75, y: 0.16 },
    { key: "r7", name: "A021", x: 0.42, y: 0.16 },
    { key: "r8", name: "A030", x: 0.97, y: 0.16 },
    { key: "r9", name: "A041", x: 0.6, y: 0.36 },
    { key: "r10", name: "A050", x: 0.76, y: 0.87 },
    { key: "r11", name: "A005", x: 0.42, y: 0.62, edge: "edge-3" },
  ],
);

const floor1 = makeFloor(
  "floor1",
  "Floor 1",
  "#e66a22",
  [
    { key: "west-stairs", type: "stairs", x: 0.12, y: 0.2, label: "West stairs" },
    { key: "west", type: "corner", x: 0.12, y: 0.48 },
    { key: "west-junction", type: "intersection", x: 0.36, y: 0.48 },
    { key: "east-junction", type: "intersection", x: 0.72, y: 0.48 },
    { key: "east-stairs", type: "stairs", x: 0.9, y: 0.48, label: "East stairs" },
    { key: "south", type: "intersection", x: 0.36, y: 0.82 },
    { key: "south-east", type: "corner", x: 0.72, y: 0.82 },
    { key: "north", type: "corner", x: 0.72, y: 0.2 },
  ],
  [
    { key: "stairs-west", from: "west-stairs", to: "west" },
    { key: "west-run", from: "west", to: "west-junction" },
    { key: "west-east", from: "west-junction", to: "east-junction" },
    { key: "stairs-east", from: "east-junction", to: "east-stairs" },
    { key: "south-run", from: "west-junction", to: "south" },
    { key: "south-cross", from: "south", to: "south-east" },
    { key: "east-south", from: "south-east", to: "east-junction" },
    { key: "north-run", from: "east-junction", to: "north" },
  ],
  [
    { key: "101", name: "A101", x: 0.25, y: 0.32, edge: "west-run" },
    { key: "102", name: "A102", x: 0.46, y: 0.32, edge: "west-east" },
    { key: "110", name: "A110", x: 0.82, y: 0.12, edge: "north-run" },
    { key: "111", name: "A111", x: 0.5, y: 0.9, edge: "south-cross" },
  ],
);

const floor2 = makeFloor(
  "floor2",
  "Floor 2",
  "#8253b8",
  [
    { key: "west-stairs", type: "stairs", x: 0.1, y: 0.78, label: "West stairs" },
    { key: "west", type: "intersection", x: 0.28, y: 0.78 },
    { key: "south", type: "corner", x: 0.28, y: 0.58 },
    { key: "center", type: "intersection", x: 0.55, y: 0.58 },
    { key: "north", type: "intersection", x: 0.55, y: 0.18 },
    { key: "east", type: "corner", x: 0.86, y: 0.18 },
    { key: "east-stairs", type: "stairs", x: 0.94, y: 0.18, label: "East stairs" },
    { key: "east-mid", type: "intersection", x: 0.86, y: 0.58 },
  ],
  [
    { key: "west-stairs", from: "west-stairs", to: "west" },
    { key: "west-south", from: "west", to: "south" },
    { key: "south-center", from: "south", to: "center" },
    { key: "center-north", from: "center", to: "north" },
    { key: "north-east", from: "north", to: "east" },
    { key: "east-stairs", from: "east", to: "east-stairs" },
    { key: "east-down", from: "east", to: "east-mid" },
    { key: "east-mid-center", from: "east-mid", to: "center" },
  ],
  [
    { key: "201", name: "A201", x: 0.12, y: 0.58, edge: "west-south" },
    { key: "202", name: "A202", x: 0.38, y: 0.38, edge: "center-north" },
    { key: "210", name: "A210", x: 0.75, y: 0.08, edge: "north-east" },
    { key: "211", name: "A211", x: 0.95, y: 0.42, edge: "east-down" },
  ],
);

const outside = makeFloor(
  "outside",
  "Outside",
  "#299447",
  [
    { key: "entrance", type: "entrance", x: 0.5, y: 0.88, label: "Main entrance" },
    { key: "plaza", type: "intersection", x: 0.5, y: 0.66 },
    { key: "west-path", type: "corner", x: 0.22, y: 0.5 },
    { key: "west-gate", type: "entrance", x: 0.08, y: 0.3, label: "West gate" },
    { key: "north-path", type: "intersection", x: 0.5, y: 0.34 },
    { key: "east-path", type: "corner", x: 0.78, y: 0.5 },
    { key: "east-gate", type: "entrance", x: 0.92, y: 0.3, label: "East gate" },
    { key: "south-path", type: "corner", x: 0.5, y: 0.16 },
  ],
  [
    { key: "entry-plaza", from: "entrance", to: "plaza" },
    { key: "plaza-west", from: "plaza", to: "west-path" },
    { key: "west-gate", from: "west-path", to: "west-gate" },
    { key: "plaza-north", from: "plaza", to: "north-path" },
    { key: "north-east", from: "north-path", to: "east-path" },
    { key: "east-gate", from: "east-path", to: "east-gate" },
    { key: "north-south", from: "north-path", to: "south-path" },
  ],
  [
    { key: "quad", name: "Central Quad", x: 0.5, y: 0.52, edge: "plaza-north" },
    { key: "bus", name: "Bus Stop", x: 0.92, y: 0.12, edge: "east-gate" },
    { key: "parking", name: "Parking", x: 0.08, y: 0.12, edge: "west-gate" },
  ],
);

export const floors: FloorMap[] = [basement, ground, floor1, floor2, outside];
export const floorById = Object.fromEntries(floors.map((floor) => [floor.id, floor])) as Record<FloorId, FloorMap>;
export const allNodes = floors.flatMap((floor) => floor.nodes);
export const allRooms = floors.flatMap((floor) => floor.rooms);

const transfer = (
  id: string,
  from: string,
  to: string,
  kind: "stairs" | "entrance",
  label: string,
  cost: number,
): Edge => ({ id: `transfer:${id}`, from, to, cost, transition: { kind, label } });

export const transferEdges: Edge[] = [
  transfer("ug-ground-west", "basement:stairs-west", "ground:n15", "stairs", "West stairs", 0.18),
  transfer("ground-floor1-west", "ground:n15", "floor1:west-stairs", "stairs", "West stairs", 0.18),
  transfer("floor1-floor2-west", "floor1:west-stairs", "floor2:west-stairs", "stairs", "West stairs", 0.18),
  transfer("ug-ground-east", "basement:stairs-east", "ground:n17", "stairs", "East stairs", 0.18),
  transfer("ground-floor1-east", "ground:n17", "floor1:east-stairs", "stairs", "East stairs", 0.18),
  transfer("floor1-floor2-east", "floor1:east-stairs", "floor2:east-stairs", "stairs", "East stairs", 0.18),
  transfer("ground-outside", "ground:n1", "outside:entrance", "entrance", "Main entrance", 0.08),
];

export const allEdges = [...floors.flatMap((floor) => floor.edges), ...transferEdges];