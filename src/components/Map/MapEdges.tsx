import type { Edge, NavNode } from "../../types/map";
import { W, H } from "./CampusMap";

export default function MapEdges({ edges, nodes, primaryColor }: { edges: Edge[]; nodes: NavNode[]; primaryColor: string }) {
  const pos = (id: string) => nodes.find((n) => n.id === id)!.position;
  return (
    <g>
      {edges.map((e) => {
        const a = pos(e.from), b = pos(e.to);
        const closed = e.isGate && !e.isOpen;
        const [x1, y1, x2, y2] = [a.x * W, a.y * H, b.x * W, b.y * H];
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        return (
          <g key={e.id}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              strokeWidth={e.isGate ? 7 : 5}
              strokeLinecap="round"
              stroke={closed ? "#dc2626" : e.isGate ? "#16a34a" : primaryColor}
              strokeDasharray={e.isGate ? "14 8" : undefined}
              opacity={closed ? 0.6 : 0.9}
            />
            {e.isGate && (
              <g>
                <title>{`Gate ${e.id}: ${closed ? "CLOSED" : "OPEN"}`}</title>
                <circle cx={mx} cy={my} r={20} fill="#fff" stroke={closed ? "#dc2626" : "#16a34a"} strokeWidth={4} />
                <text x={mx} y={my + 7} textAnchor="middle" fontSize={22}>{closed ? "🚫" : "🚪"}</text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
