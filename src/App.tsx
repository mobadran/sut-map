import { useMemo, useState } from "react";
import CampusMap from "./components/Map/CampusMap";
import { NODE_STYLE, NodeShape } from "./components/Map/MapNodes";
import RoomSearch from "./components/Search/RoomSearch";
import NavigationInstructions from "./components/Navigation/NavigationInstructions";
import { nodes } from "./data/nodes";
import { initialEdges as edges } from "./data/edges";
import { rooms } from "./data/rooms";
import { planRoute } from "./routing/aStar";
import { buildDirections } from "./routing/directions";
import type { NodeType } from "./types/map";

export default function App() {
  const [startRoom, setStartRoom] = useState<string | null>("A001");
  const [destRoom, setDestRoom] = useState<string | null>("A020");

  const uniqueRooms = useMemo(
    () => Array.from(new Set(rooms.map((r) => r.name))).sort(),
    [],
  );

  const route = useMemo(
    () =>
      startRoom && destRoom
        ? planRoute(nodes, edges, rooms, startRoom, destRoom)
        : null,
    [startRoom, destRoom],
  );

  const steps = useMemo(
    () => (route ? buildDirections(route, nodes) : []),
    [route],
  );

  const handleRoomClickOnMap = (name: string) => {
    if (name === startRoom) return;
    setDestRoom(name);
  };

  return (
    <div className="app">
      <aside>
        <h1>🧭 SUT Navigator</h1>

        <section>
          <h3>Start Room</h3>
          <div style={{ marginBottom: "8px" }}>
            <select
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: 500,
              }}
              value={startRoom ?? ""}
              onChange={(e) => setStartRoom(e.target.value || null)}
            >
              <option value="">-- Select Start Room --</option>
              {uniqueRooms.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <RoomSearch
            rooms={rooms}
            selectedName={startRoom}
            onSelect={setStartRoom}
            placeholder="Search start room…"
          />
        </section>

        <section>
          <h3>Destination Room</h3>
          <div style={{ marginBottom: "8px" }}>
            <select
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: 500,
              }}
              value={destRoom ?? ""}
              onChange={(e) => setDestRoom(e.target.value || null)}
            >
              <option value="">-- Select Destination Room --</option>
              {uniqueRooms.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <RoomSearch
            rooms={rooms}
            selectedName={destRoom}
            onSelect={setDestRoom}
            placeholder="Search destination room…"
          />
        </section>

        <section>
          <h3>Directions</h3>
          <NavigationInstructions
            route={route}
            steps={steps}
            startRoomName={startRoom}
            roomName={destRoom}
          />
        </section>

        <section>
          <h3>Legend</h3>
          <div className="legend">
            {(["entrance", "stairs", "elevator"] as NodeType[]).map((t) => (
              <span key={t}>
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <NodeShape type={t} x={14} y={14} r={0.8} />
                </svg>
                {NODE_STYLE[t].label}
              </span>
            ))}
            <span>
              <i style={{ background: "#64748b" }} />
              Walkway
            </span>
            <span>
              <i style={{ background: "#16a34a" }} />
              Open gate
            </span>
            <span>
              <i style={{ background: "#dc2626" }} />
              Closed gate
            </span>
            <span>
              <i style={{ background: "#f97316" }} />
              Route
            </span>
          </div>
        </section>
      </aside>

      <main>
        <CampusMap
          nodes={nodes}
          edges={edges}
          rooms={rooms}
          route={route}
          startRoomName={startRoom}
          selectedName={destRoom}
          onSelectRoom={handleRoomClickOnMap}
        />
      </main>
    </div>
  );
}
