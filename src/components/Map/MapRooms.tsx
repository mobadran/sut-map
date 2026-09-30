import type { Room } from "../../types/map";
type P = {
  rooms: Room[];
  startRoomId: string | null;
  selectedRoomId: string | null;
  primaryColor: string;
  onSelect: (room: Room) => void;
};

export default function MapRooms({
  rooms,
  startRoomId,
  selectedRoomId,
  primaryColor,
  onSelect,
}: P) {
  return (
    <div className="map-rooms-overlay">
      {rooms.map((r) => {
        const isStart = r.id === startRoomId;
        const isDest = r.id === selectedRoomId;

        let fill = "#fff";
        let stroke = primaryColor;
        let textColor = "#0f172a";

        if (isStart) {
          fill = "#10b981";
          stroke = "#047857";
          textColor = "#fff";
        } else if (isDest) {
          fill = "#f97316";
          stroke = "#c2410c";
          textColor = "#fff";
        }

        return (
          <button
            key={r.id}
            type="button"
            className="room-label"
            aria-label={`Select ${r.name}`}
            style={{
              left: `${r.x * 100}%`,
              top: `${r.y * 100}%`,
              background: fill,
              border: `2px solid ${stroke}`,
              color: textColor,
              fontWeight: 650,
              fontSize: 16,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onSelect(r)}
          >
            {r.name}
          </button>
        );
      })}
    </div>
  );
}
