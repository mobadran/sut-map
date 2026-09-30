import type { Edge, FloorId, NavNode, Route } from "../../types/map";
import type { FloorMap } from "../../data/floors";
import { W, H } from "./CampusMap";

export default function RouteOverlay({
  route,
  nodes,
  edges,
  floors,
  floorId,
  primaryColor,
}: {
  route: Route | null;
  nodes: NavNode[];
  edges: Edge[];
  floors: FloorMap[];
  floorId: FloorId;
  primaryColor: string;
}) {
  if (!route) return null;
  const pointFloors = route.pointFloors ?? route.points.map(() => route.startPin.floorId ?? "ground");
  const localSegments = route.points.flatMap((point, index) => {
    const next = route.points[index + 1];
    return next && pointFloors[index] === floorId && pointFloors[index + 1] === floorId
      ? [{ from: point, to: next, key: index }]
      : [];
  });
  const sPin = route.startPin;
  const dPin = route.destPin;
  const sE = route.startEntrance;
  const dE = route.entrance;
  const floorName = (id: FloorId) => floors.find((floor) => floor.id === id)?.label ?? id;
  const transitions = route.edgeIds.flatMap((edgeId, index) => {
    const edge = edges.find((item) => item.id === edgeId);
    const fromFloor = pointFloors[index];
    const toFloor = pointFloors[index + 1];
    if (!edge?.transition || fromFloor === toFloor || (fromFloor !== floorId && toFloor !== floorId)) return [];
    return [{
      key: edgeId,
      point: fromFloor === floorId ? route.points[index] : route.points[index + 1],
      destination: floorName(fromFloor === floorId ? toFloor : fromFloor),
      kind: edge.transition.kind,
      label: edge.transition.label,
    }];
  });
  const onCurrentFloor = (pin: typeof sPin) => (pin.floorId ?? "ground") === floorId;

  return (
    <g pointerEvents="none">
      {localSegments.map(({ from, to, key }) => (
        <g key={key}>
          <line x1={from.x * W} y1={from.y * H} x2={to.x * W} y2={to.y * H} stroke="#fff" strokeWidth={16} strokeLinecap="round" />
          <line x1={from.x * W} y1={from.y * H} x2={to.x * W} y2={to.y * H} stroke={primaryColor} strokeWidth={9} strokeLinecap="round" className="flow" />
        </g>
      ))}

      {/* Special node markers on path (e.g. stairs, entrance) */}
      {route.nodeIds.map((id) => {
        const n = nodes.find((x) => x.id === id);
        if (!n || n.floorId !== floorId || n.type === "corner" || n.type === "intersection") return null;
        return (
          <circle
            key={id}
            cx={n.position.x * W}
            cy={n.position.y * H}
            r={14}
            fill="none"
            stroke={primaryColor}
            strokeWidth={4}
          />
        );
      })}

      {onCurrentFloor(sPin) && <>
        {/* connector from pin to entrance on graph */}
        <line
          x1={sPin.point.x * W}
          y1={sPin.point.y * H}
          x2={sE.x * W}
          y2={sE.y * H}
          stroke="#10b981"
          strokeWidth={4}
          strokeDasharray="4 7"
          strokeLinecap="round"
        />
        {/* entrance dot on graph */}
        <circle
          cx={sE.x * W}
          cy={sE.y * H}
          r={9}
          fill="#10b981"
          stroke="#fff"
          strokeWidth={3}
        />
        {/* pin marker */}
        <text
          x={sPin.point.x * W}
          y={sPin.point.y * H - 20}
          textAnchor="middle"
          fontSize={28}
        >
          🚩
        </text>
      </>}

      {onCurrentFloor(dPin) && <>
        {/* connector from entrance on graph to pin */}
        <line
          x1={dE.x * W}
          y1={dE.y * H}
          x2={dPin.point.x * W}
          y2={dPin.point.y * H}
          stroke="#ea580c"
          strokeWidth={4}
          strokeDasharray="4 7"
          strokeLinecap="round"
        />
        {/* entrance dot on graph */}
        <circle
          cx={dE.x * W}
          cy={dE.y * H}
          r={9}
          fill="#ea580c"
          stroke="#fff"
          strokeWidth={3}
        />
        {/* pin marker */}
        <text
          x={dPin.point.x * W}
          y={dPin.point.y * H - 20}
          textAnchor="middle"
          fontSize={28}
        >
          📍
        </text>
      </>}

      {transitions.map(({ key, point, destination, kind, label }) => (
        <g key={key} transform={`translate(${point.x * W} ${point.y * H})`}>
          <circle r={24} fill="#fff" stroke={primaryColor} strokeWidth={5} />
          <text y={7} textAnchor="middle" fontSize={20} fontWeight={800} fill={primaryColor}>
            {kind === "entrance" ? "↗" : "↕"}
          </text>
          <g transform="translate(34 -18)">
            <rect width={220} height={40} rx={6} fill={primaryColor} />
            <text x={10} y={16} fontSize={11} fontWeight={800} fill="#fff">{label.toUpperCase()}</text>
            <text x={10} y={31} fontSize={11} fontWeight={700} fill="#fff">TO {destination.toUpperCase()}</text>
          </g>
        </g>
      ))}
    </g>
  );
}
