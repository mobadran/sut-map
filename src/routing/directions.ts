import type { Edge, NavNode, Route } from "../types/map";
import { angleBetween, classifyTurn, vec } from "./geometry";

type Side = "left" | "right";

const sideOf = (turn: string): Side | null =>
  turn.endsWith("left") ? "left" : turn.endsWith("right") ? "right" : null;

const ordinal = (n: number) => {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
};

const nodeLabel = (node: NavNode | undefined): string | undefined => {
  if (!node) return undefined;
  const metadata = node as NavNode & { label?: string; name?: string };
  return metadata.label ?? metadata.name;
};

const nodeKind = (node: NavNode | undefined) => String(node?.type ?? "").toLowerCase();

function pinLabel(pin: Route["startPin"], nodes: Map<string, NavNode>, fallback: string) {
  if (pin.roomName) return pin.roomName;
  const node = pin.nodeId ? nodes.get(pin.nodeId) : undefined;
  return nodeLabel(node) ?? (node ? nodeKind(node) : pin.label) ?? fallback;
}

export function buildDirections(route: Route, navNodes: NavNode[] = [], edges: Edge[] = []): string[] {
  const { points, startPin, destPin } = route;
  const nodes = new Map(navNodes.map((node) => [node.id, node]));
  const startLabel = pinLabel(startPin, nodes, "Start");
  const destLabel = pinLabel(destPin, nodes, "Destination");

  if (route.length < 0.004) {
    return [`You are already at ${destLabel}.`];
  }

  const steps = [`Start at ${startLabel}.`];
  const activeEdges = edges.filter((edge) => !edge.isGate || edge.isOpen);
  let pendingLeft = 0;
  let pendingRight = 0;
  let gaveRouteInstruction = false;

  for (let i = 0; i < route.nodeIds.length; i++) {
    const node = nodes.get(route.nodeIds[i]);
    const incoming = points[i];
    const at = points[i + 1];
    const outgoing = points[i + 2];
    if (!node || !incoming || !at || !outgoing) continue;

    const kind = nodeKind(node);
    const label = nodeLabel(node);
    const nextEdge = edges.find((edge) => edge.id === route.edgeIds[i + 1]);
    if (nextEdge?.transition) {
      const nextFloor = route.pointFloors?.[i + 2];
      const floorName = nextFloor
        ? ({ basement: "Basement", ground: "Ground", floor1: "Floor 1", floor2: "Floor 2", outside: "Outside" } as const)[nextFloor]
        : "the next floor";
      steps.push(nextEdge.transition.kind === "entrance"
        ? `Go through the ${nextEdge.transition.label} to ${floorName}.`
        : `Take the ${nextEdge.transition.label} to ${floorName}.`);
      steps.push(`Continue on ${floorName}.`);
      pendingLeft = 0;
      pendingRight = 0;
      continue;
    }
    if (kind === "stairs" || kind === "door" || kind === "entrance") {
      const place = label ?? (kind === "entrance" ? "the entrance" : `the ${kind}`);
      steps.push(kind === "entrance" || kind === "door"
        ? `Go through ${place}.`
        : `Take ${place}.`);
    }

    const turn = classifyTurn(incoming, at, outgoing);
    const turnSide = sideOf(turn);
    const incomingEdgeId = route.edgeIds[i];
    const outgoingEdgeId = route.edgeIds[i + 1];
    const branches = activeEdges
      .filter((edge) => !edge.transition && edge.id !== incomingEdgeId && (edge.from === node.id || edge.to === node.id))
      .map((edge) => {
        const neighborId = edge.from === node.id ? edge.to : edge.from;
        const neighbor = nodes.get(neighborId);
        if (!neighbor) return null;
        const branchTurn = classifyTurn(incoming, at, neighbor.position);
        return {
          edgeId: edge.id,
          side: sideOf(branchTurn),
          angle: angleBetween(vec(incoming, at), vec(at, neighbor.position)),
        };
      })
      .filter((branch): branch is NonNullable<typeof branch> => branch !== null);
    const leftBranches = branches.filter((branch) => branch.side === "left").sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle));
    const rightBranches = branches.filter((branch) => branch.side === "right").sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle));

    if (branches.length < 2) continue;
    if (!turnSide) {
      pendingLeft += leftBranches.length;
      pendingRight += rightBranches.length;
      continue;
    }

    const sideBranches = turnSide === "left" ? leftBranches : rightBranches;
    const branchIndex = sideBranches.findIndex((branch) => branch.edgeId === outgoingEdgeId);
    if (branchIndex < 0) continue;

    const countBefore = turnSide === "left" ? pendingLeft : pendingRight;
    const turnNumber = countBefore + branchIndex + 1;
    const skipped = turnNumber - 1;
    const junction = label ? ` at ${label}` : "";
    if (skipped === 0) {
      steps.push(`Take the next ${turnSide}${junction}.`);
    } else {
      const skippedName = `${turnSide} turn${skipped === 1 ? "" : "s"}`;
      steps.push(`Go straight, skip the first ${skipped} ${skippedName}, and take the ${ordinal(turnNumber)} ${turnSide}${junction}.`);
    }
    pendingLeft = 0;
    pendingRight = 0;
    gaveRouteInstruction = true;
  }

  if (pendingLeft || pendingRight || !gaveRouteInstruction) steps.push("Continue straight.");

  const lastSegment = [...points].reverse().find((point, index, reversed) =>
    index < reversed.length - 1 && Math.hypot(...Object.values(vec(reversed[index + 1], point))) > 1e-6,
  );
  if (lastSegment) {
    const previous = points[points.lastIndexOf(lastSegment) - 1];
    const toDestination = vec(route.entrance, destPin.point);
    if (previous && Math.hypot(toDestination.x, toDestination.y) > 1e-6) {
      const heading = vec(previous, lastSegment);
      const cross = heading.x * toDestination.y - heading.y * toDestination.x;
      if (Math.abs(cross) >= 1e-4) {
        steps.push(`${destLabel} will be on your ${cross > 0 ? "right" : "left"}.`);
      } else {
        steps.push(`${destLabel} will be straight ahead.`);
      }
    } else {
      steps.push(`You have arrived at ${destLabel}.`);
    }
  }

  return steps;
}
