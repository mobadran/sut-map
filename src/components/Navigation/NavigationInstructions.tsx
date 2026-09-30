import type { MapPin, Route } from "../../types/map";
import { METERS_PER_UNIT } from "../../routing/geometry";

type P = {
  route: Route | null;
  steps: string[];
  startPin: MapPin | null;
  destPin: MapPin | null;
};

export default function NavigationInstructions({ route, steps, startPin, destPin }: P) {
  if (!startPin) return <p className="muted">Set a starting point on the map.</p>;
  if (!destPin) return <p className="muted">Set a destination point on the map.</p>;
  if (!route)
    return (
      <div className="alert">
        ⚠️ No path found — a closed gate may be blocking every route.
      </div>
    );
  const floorNames: Record<string, string> = {
    basement: "Basement",
    ground: "Ground",
    floor1: "Floor 1",
    floor2: "Floor 2",
    outside: "Outside",
  };
  const startFloor = route.pointFloors?.[0];
  const destFloor = route.pointFloors?.[route.pointFloors.length - 1];
  return (
    <div>
      <p className="muted">
        Route from <b>{startPin.label ?? "Start"}</b>{startFloor ? ` · ${floorNames[startFloor]}` : ""}
        {" to "}<b>{destPin.label ?? "Destination"}</b>{destFloor ? ` · ${floorNames[destFloor]}` : ""}
        {" "}· {Math.round(route.length * METERS_PER_UNIT)} m
      </p>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
