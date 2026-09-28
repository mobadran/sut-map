import { useCallback, useEffect, useRef, useState } from "react";
import type { Edge, NavNode, Room, Route } from "../../types/map";
import MapEdges from "./MapEdges";
import MapNodes from "./MapNodes";
import MapRooms from "./MapRooms";
import RouteOverlay from "./RouteOverlay";
import MapControls from "../Controls/MapControls";

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

type P = {
  nodes: NavNode[];
  edges: Edge[];
  rooms: Room[];
  route: Route | null;
  startRoomName: string | null;
  selectedName: string | null;
  onSelectRoom: (name: string) => void;
};

export default function CampusMap(p: P) {
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
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

  return (
    <div
      className="mapbox"
      ref={box}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        setV((c) => ({
          ...c,
          x: c.x + e.clientX - d.x,
          y: c.y + e.clientY - d.y,
        }));
        drag.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={() => (drag.current = null)}
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
          <MapNodes nodes={p.nodes} />
          <MapRooms
            rooms={p.rooms}
            startRoomName={p.startRoomName}
            selectedName={p.selectedName}
            onSelect={p.onSelectRoom}
          />
        </svg>
      </div>
      <MapControls
        onZoomIn={() => zoomCenter(1.3)}
        onZoomOut={() => zoomCenter(1 / 1.3)}
        onReset={fit}
      />
      {!mapUrl && (
        <div className="hint">Placeholder map — add src/assets/SUTMap.png</div>
      )}
    </div>
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
