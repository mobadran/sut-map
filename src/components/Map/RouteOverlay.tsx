import type { NavNode, Route } from "../../types/map";
import { W, H } from "./CampusMap";

export default function RouteOverlay({
  route,
  nodes,
}: {
  route: Route | null;
  nodes: NavNode[];
}) {
  if (!route) return null;
  const pts = route.points.map((p) => `${p.x * W},${p.y * H}`).join(" ");
  const sPin = route.startPin;
  const dPin = route.destPin;
  const sE = route.startEntrance;
  const dE = route.entrance;

  return (
    <g pointerEvents="none">
      {/* Route path lines */}
      <polyline
        points={pts}
        fill="none"
        stroke="#fff"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={pts}
        fill="none"
        stroke="#f97316"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flow"
      />

      {/* Special node markers on path (e.g. stairs, entrance) */}
      {route.nodeIds.map((id) => {
        const n = nodes.find((x) => x.id === id);
        if (!n || n.type === "corner" || n.type === "intersection") return null;
        return (
          <circle
            key={id}
            cx={n.position.x * W}
            cy={n.position.y * H}
            r={14}
            fill="none"
            stroke="#ea580c"
            strokeWidth={4}
          />
        );
      })}

      {/* Start pin */}
      <>
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
      </>

      {/* Destination pin */}
      <>
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
      </>
    </g>
  );
}
