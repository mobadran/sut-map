/** Normalized coordinates, 0..1 on both axes (relative to the map image). */
export type Point = { x: number; y: number };
export type NodeType = "intersection" | "corner" | "entrance" | "stairs" | "elevator";
export interface NavNode { id: string; type: NodeType; position: Point }
/** If isGate is true, isOpen is mandatory. Otherwise the edge is always active. */
export type Edge = { id: string; from: string; to: string } & (
  | { isGate?: false; isOpen?: undefined }
  | { isGate: true; isOpen: boolean }
);
/** A destination (NOT a graph node). Multiple records may share a name (multiple entrances). */
export interface Room { id: string; name: string; x: number; y: number; entranceEdgeId?: string }
export interface Route {
  startRoom: Room;
  room: Room;          // destination room
  nodeIds: string[];
  edgeIds: string[];
  points: Point[];     // start entrance point + node positions + final entrance point
  startEntrance: Point;
  entrance: Point;     // closest point on the entrance edge for dest
  length: number;      // world-space length
}
