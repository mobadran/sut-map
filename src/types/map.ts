/** Normalized coordinates, 0..1 on both axes (relative to the map image). */
export type Point = { x: number; y: number };
export type FloorId = "basement" | "ground" | "floor1" | "floor2" | "outside";
export type TransitionKind = "stairs" | "entrance";
export type NodeType =
  | "intersection"
  | "corner"
  | "entrance"
  | "stairs";
export interface NavNode {
  id: string;
  type: NodeType;
  position: Point;
  floorId?: FloorId;
  label?: string;
}
/** If isGate is true, isOpen is mandatory. Otherwise the edge is always active. */
export type Edge = {
  id: string;
  from: string;
  to: string;
  cost?: number;
  transition?: { kind: TransitionKind; label: string };
} & (
  | { isGate?: false; isOpen?: undefined }
  | { isGate: true; isOpen: boolean }
);
/** A destination (NOT a graph node). Multiple records may share a name (multiple entrances). */
export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  floorId?: FloorId;
  entranceEdgeId?: string;
}
export interface MapSearchTarget {
  id: string;
  label: string;
  point: Point;
  floorId?: FloorId;
}
/** A user-placed pin on the map (start or destination). */
export interface MapPin {
  point: Point;       // normalized position on the map
  floorId?: FloorId;
  nodeId?: string;    // if snapped to a predefined nav node
  roomId?: string;    // identifies one specific room entrance
  roomName?: string;  // if snapped to a room
  entranceEdgeId?: string;
  label?: string;     // display label shown in the sidebar
}

export interface Route {
  startPin: MapPin;
  destPin: MapPin;
  nodeIds: string[];
  pointFloors?: FloorId[];
  edgeIds: string[];
  points: Point[]; // start point + node positions + dest point
  startEntrance: Point; // entry point onto the graph from start
  entrance: Point;      // entry point onto the graph for dest
  length: number; // world-space length
}
