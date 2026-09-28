import type { NavNode, NodeType } from "../../types/map";
import { W, H } from "./CampusMap";

export const NODE_STYLE: Record<NodeType, { color: string; label: string }> = {
  intersection: { color: "#2563eb", label: "Intersection" },
  corner: { color: "#94a3b8", label: "Corner" },
  entrance: { color: "#059669", label: "Entrance" },
  stairs: { color: "#f59e0b", label: "Stairs" },
  elevator: { color: "#9333ea", label: "Elevator" },
};

export function NodeShape({ type, x, y, r = 1 }: { type: NodeType; x: number; y: number; r?: number }) {
  const c = NODE_STYLE[type].color, p = { fill: c, stroke: "#fff", strokeWidth: 3 };
  if (type === "entrance") return <rect x={x - 12 * r} y={y - 12 * r} width={24 * r} height={24 * r} {...p} />;
  if (type === "stairs") return <polygon points={`${x},${y - 14 * r} ${x + 13 * r},${y + 10 * r} ${x - 13 * r},${y + 10 * r}`} {...p} />;
  if (type === "elevator") return <rect x={x - 12 * r} y={y - 12 * r} width={24 * r} height={24 * r} rx={7} {...p} />;
  if (type === "corner") return <rect x={x - 7 * r} y={y - 7 * r} width={14 * r} height={14 * r} transform={`rotate(45 ${x} ${y})`} {...p} />;
  return <circle cx={x} cy={y} r={10 * r} {...p} />;
}

export default function MapNodes({ nodes }: { nodes: NavNode[] }) {
  return (
    <g>
      {nodes.map((n) => {
        if (n.type === "corner" || n.type === "intersection") return null;
        const x = n.position.x * W, y = n.position.y * H;
        return (
          <g key={n.id}>
            <title>{`Node ${n.id} (${NODE_STYLE[n.type].label})`}</title>
            <NodeShape type={n.type} x={x} y={y} />
          </g>
        );
      })}
    </g>
  );
}
