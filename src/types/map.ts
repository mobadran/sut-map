/** Normalized coordinates, 0..1 on both axes (relative to the map image). */
export type Point = { x: number; y: number };
export type NodeType =
  | "intersection"
  | "corner"
  | "entrance"
  | "stairs";
export interface NavNode {
  id: string;
  type: NodeType;
  position: Point;
}
/** If isGate is true, isOpen is mandatory. Otherwise the edge is always active. */
export type Edge = { id: string; from: string; to: string } & (
  | { isGate?: false; isOpen?: undefined }
  | { isGate: true; isOpen: boolean }
);
/** A destination (NOT a graph node). Multiple records may share a name (multiple entrances). */
export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  entranceEdgeId?: string;
}
export interface MapSearchTarget {
  id: string;
  label: string;
  point: Point;
}
/** A user-placed pin on the map (start or destination). */
export interface MapPin {
  point: Point;       // normalized position on the map
  nodeId?: string;    // if snapped to a predefined nav node
  roomName?: string;  // if snapped to a room
  label?: string;     // display label shown in the sidebar
}

export interface Route {
  startPin: MapPin;
  destPin: MapPin;
  nodeIds: string[];
  edgeIds: string[];
  points: Point[]; // start point + node positions + dest point
  startEntrance: Point; // entry point onto the graph from start
  entrance: Point;      // entry point onto the graph for dest
  length: number; // world-space length
}
