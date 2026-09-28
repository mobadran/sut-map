import type { NavNode, Route } from "../../types/map";
import { W, H } from "./CampusMap";

export default function RouteOverlay({ route, nodes }: { route: Route | null; nodes: NavNode[] }) {
  if (!route) return null;
  const pts = route.points.map((p) => `${p.x * W},${p.y * H}`).join(" ");
  const e = route.entrance, r = route.room;
  const sE = route.startEntrance, sR = route.startRoom;

  return (
    <g pointerEvents="none">
      {/* Route path lines */}
      <polyline points={pts} fill="none" stroke="#fff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts} fill="none" stroke="#f97316" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" className="flow" />

      {/* Special node markers on path (e.g. stairs, elevator, entrance) */}
      {route.nodeIds.map((id) => {
        const n = nodes.find((x) => x.id === id);
        if (!n || n.type === "corner" || n.type === "intersection") return null;
        return <circle key={id} cx={n.position.x * W} cy={n.position.y * H} r={14} fill="none" stroke="#ea580c" strokeWidth={4} />;
      })}

      {/* Start room stub and marker */}
      {sR && (
        <>
          <line x1={sE.x * W} y1={sE.y * H} x2={sR.x * W} y2={sR.y * H} stroke="#10b981" strokeWidth={4} strokeDasharray="4 7" strokeLinecap="round" />
          <circle cx={sE.x * W} cy={sE.y * H} r={9} fill="#10b981" stroke="#fff" strokeWidth={3} />
          <text x={sR.x * W} y={sR.y * H - 24} textAnchor="middle" fontSize={24}>🚩</text>
        </>
      )}

      {/* Destination room stub and marker */}
      {r && (
        <>
          <line x1={e.x * W} y1={e.y * H} x2={r.x * W} y2={r.y * H} stroke="#ea580c" strokeWidth={4} strokeDasharray="4 7" strokeLinecap="round" />
          <circle cx={e.x * W} cy={e.y * H} r={9} fill="#ea580c" stroke="#fff" strokeWidth={3} />
          <text x={r.x * W} y={r.y * H - 24} textAnchor="middle" fontSize={24}>📍</text>
        </>
      )}
    </g>
  );
}
