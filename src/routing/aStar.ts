import type { Edge, MapPin, NavNode, Point, Route } from "../types/map";
import { closestPointOnSegment, distance } from "./geometry";

export const isActive = (e: Edge) => !e.isGate || e.isOpen === true;

export function closestPointOnEdge(p: Point, e: Edge, nodes: NavNode[]): Point {
  const a = nodes.find((n) => n.id === e.from)!.position, b = nodes.find((n) => n.id === e.to)!.position;
  return closestPointOnSegment(p, a, b);
}
export function closestActiveEdge(p: Point, nodes: NavNode[], edges: Edge[]): Edge | undefined {
  let best: Edge | undefined, bd = Infinity;
  for (const e of edges) {
    if (!isActive(e)) continue;
    const d = distance(p, closestPointOnEdge(p, e, nodes));
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

const START = "__start";
const DEST = "__dest";

export function findRouteBetweenPoints(
  nodes: NavNode[],
  edges: Edge[],
  startEdge: Edge,
  startPoint: Point,
  destEdge: Edge,
  destPoint: Point
) {
  const pos = new Map<string, Point>(nodes.map((n) => [n.id, n.position]));
  pos.set(START, startPoint);
  pos.set(DEST, destPoint);

  const adj = new Map<string, { to: string; edgeId: string; cost: number }[]>();
  const link = (a: string, b: string, edgeId: string) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push({ to: b, edgeId, cost: distance(pos.get(a)!, pos.get(b)!) });
  };

  for (const e of edges) {
    if (isActive(e)) {
      link(e.from, e.to, e.id);
      link(e.to, e.from, e.id);
    }
  }

  link(START, startEdge.from, startEdge.id);
  link(START, startEdge.to, startEdge.id);
  link(startEdge.from, START, startEdge.id);
  link(startEdge.to, START, startEdge.id);

  link(DEST, destEdge.from, destEdge.id);
  link(DEST, destEdge.to, destEdge.id);
  link(destEdge.from, DEST, destEdge.id);
  link(destEdge.to, DEST, destEdge.id);

  if (startEdge.id === destEdge.id) {
    link(START, DEST, startEdge.id);
    link(DEST, START, startEdge.id);
  }

  const g = new Map([[START, 0]]);
  const prev = new Map<string, { id: string; edgeId: string }>();
  const open = new Set([START]);
  const closed = new Set<string>();
  const h = (id: string) => distance(pos.get(id)!, destPoint);

  while (open.size) {
    let cur = "", bf = Infinity;
    for (const id of open) {
      const f = g.get(id)! + h(id);
      if (f < bf) { bf = f; cur = id; }
    }
    if (cur === DEST) {
      const ids = [DEST];
      const edgeIds: string[] = [];
      for (let c = DEST; prev.has(c); ) {
        const p = prev.get(c)!;
        ids.unshift(p.id);
        edgeIds.unshift(p.edgeId);
        c = p.id;
      }
      const graphNodeIds = ids.filter((id) => id !== START && id !== DEST);
      return {
        nodeIds: graphNodeIds,
        edgeIds,
        points: ids.map((i) => pos.get(i)!),
        length: g.get(DEST)!,
      };
    }
    open.delete(cur);
    closed.add(cur);
    for (const nb of adj.get(cur) ?? []) {
      if (closed.has(nb.to)) continue;
      const ng = g.get(cur)! + nb.cost;
      if (ng < (g.get(nb.to) ?? Infinity)) {
        g.set(nb.to, ng);
        prev.set(nb.to, { id: cur, edgeId: nb.edgeId });
        open.add(nb.to);
      }
    }
  }
  return null;
}

/**
 * Routes between two MapPins. Each pin is either snapped to a node or a
 * free point on an edge. Returns a Route or null if no path exists.
 */
export function planRouteBetweenPins(
  nodes: NavNode[],
  edges: Edge[],
  startPin: MapPin,
  destPin: MapPin
): Route | null {
  const sEdge = closestActiveEdge(startPin.point, nodes, edges);
  const dEdge = closestActiveEdge(destPin.point, nodes, edges);
  if (!sEdge || !dEdge) return null;

  const sPt = closestPointOnEdge(startPin.point, sEdge, nodes);
  const dPt = closestPointOnEdge(destPin.point, dEdge, nodes);

  const res = findRouteBetweenPoints(nodes, edges, sEdge, sPt, dEdge, dPt);
  if (!res) return null;

  return {
    startPin,
    destPin,
    startEntrance: sPt,
    entrance: dPt,
    ...res,
  };
}
