import { useEffect, useMemo, useState } from "react";
import CampusMap from "./components/Map/CampusMap";
import { NODE_STYLE, NodeShape } from "./components/Map/MapNodes";
import NavigationInstructions from "./components/Navigation/NavigationInstructions";
import RoomSearch from "./components/Search/RoomSearch";
import { allEdges, allNodes, allRooms, floorById, floors } from "./data/floors";
import { planRouteBetweenPins } from "./routing/aStar";
import { buildDirections } from "./routing/directions";
import type { FloorId, MapPin, MapSearchTarget, NodeType } from "./types/map";

type PinMode = "start" | "dest" | null;

export default function App() {
  const [startPin, setStartPin] = useState<MapPin | null>(null);
  const [destPin, setDestPin] = useState<MapPin | null>(null);
  const [pinMode, setPinMode] = useState<PinMode>("start");
  const [floorId, setFloorId] = useState<FloorId>("ground");
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
        ? planRouteBetweenPins(allNodes, allEdges, startPin, destPin)
        : null,
    [startPin, destPin],
  );

  const steps = useMemo(
    () => (route ? buildDirections(route, allNodes, allEdges) : []),
    [route],
  );

  const handleMapClick = (pin: MapPin) => {
    const floorPin = { ...pin, floorId };
    if (pinMode === "start") {
      setStartPin(floorPin);
      setPinMode("dest"); // automatically switch to dest after placing start
    } else if (pinMode === "dest") {
      setDestPin(floorPin);
      setPinMode(null); // done
    }
  };

  const handleLocate = (target: MapSearchTarget | null) => {
    if (target?.floorId) setFloorId(target.floorId);
    setLocateTarget(target);
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
            rooms={allRooms}
            nodes={allNodes}
            target={locateTarget}
            onLocate={handleLocate}
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
          floor={floorById[floorId]}
          floors={floors}
          nodes={allNodes}
          edges={allEdges}
          rooms={allRooms}
          route={route}
          startPin={startPin}
          destPin={destPin}
          pinMode={pinMode}
          locateTarget={locateTarget}
          onFloorChange={setFloorId}
          onMapClick={handleMapClick}
        />
      </main>
    </div>
  );
}
