import { useCallback, useEffect, useRef, useState } from "react";
import type { Edge, MapPin, MapSearchTarget, NavNode, Room, Route } from "../../types/map";
import MapEdges from "./MapEdges";
import MapNodes from "./MapNodes";
import MapRooms from "./MapRooms";
import RouteOverlay from "./RouteOverlay";
import MapControls from "../Controls/MapControls";
import { distance } from "../../routing/geometry";

/** SVG user space. W/H must equal ASPECT (1.6) so normalized coords map without distortion. */
export const W = 1600,
  H = 1000;
// Put SUTMap.png in src/assets/. If absent, a placeholder floor plan is drawn instead.
const found = import.meta.glob("../../assets/SUTMap.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const mapUrl = Object.values(found)[0];

/** Threshold in normalized units: if click is within this distance to a node, snap to it. */
const SNAP_THRESHOLD = 0.045;

type P = {
  nodes: NavNode[];
  edges: Edge[];
  rooms: Room[];
  route: Route | null;
  startPin: MapPin | null;
  destPin: MapPin | null;
  pinMode: "start" | "dest" | null;
  locateTarget: MapSearchTarget | null;
  onMapClick: (pin: MapPin) => void;
};

export default function CampusMap(p: P) {
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [v, setV] = useState({ s: 1, x: 0, y: 0 });

  const fit = useCallback(() => {
    const r = box.current!.getBoundingClientRect(),
      s = Math.min(r.width / W, r.height / H);
    setV({ s, x: (r.width - W * s) / 2, y: (r.height - H * s) / 2 });
  }, []);

  const zoomAt = useCallback(
    (f: number, mx: number, my: number) =>
      setV((c) => {
        const s = Math.max(0.15, Math.min(6, c.s * f)),
          k = s / c.s;
        return { s, x: mx - (mx - c.x) * k, y: my - (my - c.y) * k };
      }),
    [],
  );
  const zoomCenter = (f: number) => {
    const r = box.current!.getBoundingClientRect();
    zoomAt(f, r.width / 2, r.height / 2);
  };

  useEffect(() => {
    const el = box.current!;
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(
        e.deltaY < 0 ? 1.12 : 1 / 1.12,
        e.clientX - r.left,
        e.clientY - r.top,
      );
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", wheel);
    };
  }, [fit, zoomAt]);

  useEffect(() => {
    if (!p.locateTarget || !box.current) return;
    const { width, height } = box.current.getBoundingClientRect();
    setV((current) => {
      const s = Math.max(current.s, Math.min(1.6, current.s * 1.25));
      return {
        s,
        x: width / 2 - p.locateTarget!.point.x * W * s,
        y: height / 2 - p.locateTarget!.point.y * H * s,
      };
    });
  }, [p.locateTarget]);

  /** Convert a pointer event position to normalized map coordinates. */
  const toNorm = (clientX: number, clientY: number) => {
    const r = box.current!.getBoundingClientRect();
    return {
      x: (clientX - r.left - v.x) / (W * v.s),
      y: (clientY - r.top - v.y) / (H * v.s),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) > 4) d.moved = true;
    setV((c) => ({
      ...c,
      x: c.x + e.clientX - d.x,
      y: c.y + e.clientY - d.y,
    }));
    drag.current = { x: e.clientX, y: e.clientY, moved: d.moved };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    // Only treat as a click if the pointer didn't move significantly AND we have a pin mode
    if (!d || d.moved || !p.pinMode) return;

    const pt = toNorm(e.clientX, e.clientY);

    // Snap to closest node if within threshold
    let bestNode: NavNode | null = null;
    let bestNodeDist = SNAP_THRESHOLD;
    for (const n of p.nodes) {
      const d = distance(pt, n.position);
      if (d < bestNodeDist) { bestNodeDist = d; bestNode = n; }
    }

    // Also check rooms — prefer them over raw nodes when close
    let bestRoom: Room | null = null;
    let bestRoomDist = SNAP_THRESHOLD;
    for (const r of p.rooms) {
      const d = distance(pt, { x: r.x, y: r.y });
      if (d < bestRoomDist) { bestRoomDist = d; bestRoom = r; }
    }

    if (bestRoom && bestRoomDist <= bestNodeDist) {
      p.onMapClick({
        point: { x: bestRoom.x, y: bestRoom.y },
        roomId: bestRoom.id,
        roomName: bestRoom.name,
        entranceEdgeId: bestRoom.entranceEdgeId,
        label: bestRoom.name,
      });
    } else if (bestNode) {
      p.onMapClick({ point: bestNode.position, nodeId: bestNode.id, label: `${bestNode.type}` });
    } else {
      p.onMapClick({ point: pt, label: "Custom" });
    }
  };

  const startNodeId = p.startPin?.nodeId;
  const destNodeId = p.destPin?.nodeId;

  return (
    <div
      className={`mapbox${p.pinMode ? ` pin-mode-${p.pinMode}` : ""}`}
      ref={box}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        style={{
          width: W,
          height: H,
          transform: `translate(${v.x}px,${v.y}px) scale(${v.s})`,
          transformOrigin: "0 0",
          position: "absolute",
        }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ position: "absolute", inset: 0 }}
        >
          {mapUrl ? (
            <image
              href={mapUrl}
              width={W}
              height={H}
              preserveAspectRatio="none"
            />
          ) : (
            <Placeholder nodes={p.nodes} edges={p.edges} />
          )}
          <MapEdges edges={p.edges} nodes={p.nodes} />
          <RouteOverlay route={p.route} nodes={p.nodes} />
          {/* Free-floating pins (not snapped to a node or room) */}
          {p.startPin && !p.startPin.nodeId && !p.startPin.roomName && (
            <FreePinMarker point={p.startPin.point} color="#10b981" label="START" />
          )}
          {p.destPin && !p.destPin.nodeId && !p.destPin.roomName && (
            <FreePinMarker point={p.destPin.point} color="#f97316" label="DEST" />
          )}
          <MapNodes
            nodes={p.nodes}
            startNodeId={startNodeId}
            destNodeId={destNodeId}
            onNodeClick={(nodeId) => {
              if (!p.pinMode) return;
              const n = p.nodes.find((x) => x.id === nodeId)!;
              p.onMapClick({ point: n.position, nodeId, label: `${n.type}` });
            }}
          />
          <MapRooms
            rooms={p.rooms}
            startRoomId={p.startPin?.roomId ?? null}
            selectedRoomId={p.destPin?.roomId ?? null}
            onSelect={(room) => {
              if (!p.pinMode) return;
              p.onMapClick({
                point: { x: room.x, y: room.y },
                roomId: room.id,
                roomName: room.name,
                entranceEdgeId: room.entranceEdgeId,
                label: room.name,
              });
            }}
          />
          {p.locateTarget && (
            <g pointerEvents="none">
              <circle
                cx={p.locateTarget.point.x * W}
                cy={p.locateTarget.point.y * H}
                r={38}
                fill="#e11d48"
                opacity={0.2}
                className="pulse"
              />
              <text
                x={p.locateTarget.point.x * W}
                y={p.locateTarget.point.y * H - 34}
                textAnchor="middle"
                fontSize={18}
                fontWeight={800}
                fill="#be123c"
                stroke="#fff"
                strokeWidth={5}
                paintOrder="stroke"
              >
                {p.locateTarget.label}
              </text>
            </g>
          )}
        </svg>
      </div>
      <MapControls
        onZoomIn={() => zoomCenter(1.3)}
        onZoomOut={() => zoomCenter(1 / 1.3)}
        onReset={fit}
      />
      {p.pinMode && (
        <div className={`pin-hint pin-hint-${p.pinMode}`}>
          {p.pinMode === "start"
            ? "🚩 Click on the map to set your START point"
            : "📍 Click on the map to set your DESTINATION"}
        </div>
      )}
    </div>
  );
}

function FreePinMarker({ point, color, label }: { point: { x: number; y: number }; color: string; label: string }) {
  const x = point.x * W, y = point.y * H;
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={22} fill={color} opacity={0.25} className="pulse" />
      <circle cx={x} cy={y} r={10} fill={color} stroke="#fff" strokeWidth={3} />
      <text x={x} y={y - 18} textAnchor="middle" fontSize={12} fontWeight={700} fill={color}>
        {label}
      </text>
    </g>
  );
}

function Placeholder({ nodes, edges }: { nodes: NavNode[]; edges: Edge[] }) {
  const pos = (id: string) => nodes.find((n) => n.id === id)!.position;
  return (
    <g>
      <rect width={W} height={H} fill="#eef1f5" />
      <rect
        x={40}
        y={40}
        width={W - 80}
        height={H - 80}
        rx={24}
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth={6}
      />
      {edges.map((e) => (
        <line
          key={e.id}
          x1={pos(e.from).x * W}
          y1={pos(e.from).y * H}
          x2={pos(e.to).x * W}
          y2={pos(e.to).y * H}
          stroke="#e2e8f0"
          strokeWidth={46}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}
