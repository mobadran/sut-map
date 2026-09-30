import type { NavNode, NodeType } from "../../types/map";
import { W, H } from "./CampusMap";

export const NODE_STYLE: Record<NodeType, { color: string; label: string }> = {
  intersection: { color: "#2563eb", label: "Intersection" },
  corner: { color: "#94a3b8", label: "Corner" },
  entrance: { color: "#059669", label: "Entrance" },
  stairs: { color: "#f59e0b", label: "Stairs" },
};

export function NodeShape({
  type,
  x,
  y,
  r = 1,
}: {
  type: NodeType;
  x: number;
  y: number;
  r?: number;
}) {
  const c = NODE_STYLE[type].color,
    p = { fill: c, stroke: "#fff", strokeWidth: 3 };
  if (type === "entrance")
    return (
      <rect
        x={x - 12 * r}
        y={y - 12 * r}
        width={24 * r}
        height={24 * r}
        {...p}
      />
    );
  if (type === "stairs")
    return (
      <polygon
        points={`${x},${y - 14 * r} ${x + 13 * r},${y + 10 * r} ${x - 13 * r},${y + 10 * r}`}
        {...p}
      />
    );
  if (type === "corner")
    return (
      <rect
        x={x - 7 * r}
        y={y - 7 * r}
        width={14 * r}
        height={14 * r}
        transform={`rotate(45 ${x} ${y})`}
        {...p}
      />
    );
  // intersection and default
  return <circle cx={x} cy={y} r={10 * r} {...p} />;
}

type MapNodesProps = {
  nodes: NavNode[];
  startNodeId?: string;
  destNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
};

export default function MapNodes({ nodes, startNodeId, destNodeId, onNodeClick }: MapNodesProps) {
  return (
    <g>
      {nodes.map((n) => {
        const isStart = n.id === startNodeId;
        const isDest = n.id === destNodeId;
        const isCornerOrIntersection = n.type === "corner" || n.type === "intersection";
        // Always hide corners/intersections unless they are the selected start/dest
        if (isCornerOrIntersection && !isStart && !isDest) return null;

        const x = n.position.x * W,
          y = n.position.y * H;

        return (
          <g
            key={n.id}
            style={{ cursor: onNodeClick ? "pointer" : "default" }}
            onPointerDown={onNodeClick ? (e) => e.stopPropagation() : undefined}
            onClick={onNodeClick ? () => onNodeClick(n.id) : undefined}
          >
            <title>{`Node ${n.id} (${NODE_STYLE[n.type].label})`}</title>
            {/* Highlight ring for start/dest */}
            {(isStart || isDest) && (
              <circle
                cx={x}
                cy={y}
                r={22}
                fill={isStart ? "#10b981" : "#f97316"}
                opacity={0.3}
                className="pulse"
              />
            )}
            <NodeShape type={n.type} x={x} y={y} />
            {/* Show label if selected */}
            {(isStart || isDest) && (
              <text
                x={x}
                y={y - 22}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill={isStart ? "#059669" : "#ea580c"}
              >
                {isStart ? "START" : "DEST"}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
