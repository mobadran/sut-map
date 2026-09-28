import type { Room } from "../../types/map";
import { W, H } from "./CampusMap";

type P = {
  rooms: Room[];
  startRoomName: string | null;
  selectedName: string | null;
  onSelect: (name: string) => void;
};

export default function MapRooms({ rooms, startRoomName, selectedName, onSelect }: P) {
  return (
    <g>
      {rooms.map((r) => {
        const x = r.x * W, y = r.y * H;
        const isStart = r.name.toLowerCase() === startRoomName?.toLowerCase();
        const isDest = r.name.toLowerCase() === selectedName?.toLowerCase();

        let fill = "#fff";
        let stroke = "#334155";
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
          <g key={r.id} style={{ cursor: "pointer" }} onPointerDown={(e) => e.stopPropagation()} onClick={() => onSelect(r.name)}>
            <rect x={x - 34} y={y - 14} width={68} height={28} rx={8} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={x} y={y + 6} textAnchor="middle" fontSize={15} fontWeight={700} fill={textColor}>
              {r.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}
