import { useEffect, useMemo, useState } from "react";
import CampusMap from "./components/Map/CampusMap";
import { NODE_STYLE, NodeShape } from "./components/Map/MapNodes";
import NavigationInstructions from "./components/Navigation/NavigationInstructions";
import RoomSearch from "./components/Search/RoomSearch";
import { nodes } from "./data/nodes";
import { initialEdges as edges } from "./data/edges";
import { rooms } from "./data/rooms";
import { planRouteBetweenPins } from "./routing/aStar";
import { buildDirections } from "./routing/directions";
import type { MapPin, MapSearchTarget, NodeType } from "./types/map";

type PinMode = "start" | "dest" | null;

export default function App() {
  const [startPin, setStartPin] = useState<MapPin | null>(null);
  const [destPin, setDestPin] = useState<MapPin | null>(null);
  const [pinMode, setPinMode] = useState<PinMode>("start");
  const [locateTarget, setLocateTarget] = useState<MapSearchTarget | null>(
    null,
  );

  useEffect(() => {
    if (!locateTarget) return;
    const timeoutId = window.setTimeout(() => setLocateTarget(null), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [locateTarget]);

  const route = useMemo(
    () =>
      startPin && destPin
        ? planRouteBetweenPins(nodes, edges, startPin, destPin)
        : null,
    [startPin, destPin],
  );

  const steps = useMemo(
    () => (route ? buildDirections(route, nodes, edges) : []),
    [route],
  );

  const handleMapClick = (pin: MapPin) => {
    if (pinMode === "start") {
      setStartPin(pin);
      setPinMode("dest"); // automatically switch to dest after placing start
    } else if (pinMode === "dest") {
      setDestPin(pin);
      setPinMode(null); // done
    }
  };

  const clearAll = () => {
    setStartPin(null);
    setDestPin(null);
  };

  return (
    <div className="app">
      <aside>
        <section>
          <RoomSearch
            rooms={rooms}
            nodes={nodes}
            target={locateTarget}
            onLocate={setLocateTarget}
          />
        </section>

        <section style={{ display: "flex", gap: 8 }}>
          <div className="pin-panel">
            <button
              className={`pin-btn start${pinMode === "start" ? " active" : ""}`}
              onClick={() => setPinMode(pinMode === "start" ? null : "start")}
            >

              {pinMode === "start" ? (
                "🎯 Picking start…"
              ) : startPin ? (
                <span>🚩 Start <span style={{ fontWeight: "bold", fontStyle: "italic" }}>{startPin.label ?? "Custom"}</span></span>
              ) : (
                "📍 Set Start"
              )}
            </button>
          </div>
          <div className="pin-panel">
            <button
              className={`pin-btn dest${pinMode === "dest" ? " active" : ""}`}
              onClick={() => setPinMode(pinMode === "dest" ? null : "dest")}
            >
              {pinMode === "dest" ? (
                "🎯 Picking destination…"
              ) : destPin ? (
                <span>📍 Destination <span style={{ fontWeight: "bold", fontStyle: "italic" }}>{destPin.label ?? "Custom"}</span></span>
              ) : (
                "📍 Set Destination"
              )}

            </button>
          </div>
        </section>

        {(startPin || destPin) && (
          <button className="clear-btn" onClick={clearAll}>
            🗑 Clear all pins
          </button>
        )}

        <section>
          <h3>Directions</h3>
          <NavigationInstructions
            route={route}
            steps={steps}
            startPin={startPin}
            destPin={destPin}
          />
        </section>

        <section>
          <h3>Legend</h3>
          <div className="legend">
            {(["entrance", "stairs"] as NodeType[]).map((t) => (
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
          startPin={startPin}
          destPin={destPin}
          pinMode={pinMode}
          locateTarget={locateTarget}
          onMapClick={handleMapClick}
        />
      </main>
    </div>
  );
}
