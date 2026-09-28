import type { Route } from "../../types/map";
import { METERS_PER_UNIT } from "../../routing/geometry";

type P = {
  route: Route | null;
  steps: string[];
  startRoomName: string | null;
  roomName: string | null;
};

export default function NavigationInstructions({ route, steps, startRoomName, roomName }: P) {
  if (!startRoomName) return <p className="muted">Select a starting room.</p>;
  if (!roomName) return <p className="muted">Search for or select a destination room.</p>;
  if (startRoomName.toLowerCase() === roomName.toLowerCase())
    return <p className="muted">Start and destination room are the same (<b>{roomName}</b>).</p>;
  if (!route)
    return (
      <div className="alert">
        ⚠️ <b>{roomName}</b> is currently unreachable from <b>{startRoomName}</b> — a closed gate blocks every path. Try re-opening a gate.
      </div>
    );
  return (
    <div>
      <p className="muted">
        Route from <b>{startRoomName}</b> to <b>{roomName}</b> · {Math.round(route.length * METERS_PER_UNIT)} m
      </p>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
