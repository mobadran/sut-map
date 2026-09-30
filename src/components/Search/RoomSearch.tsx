import { useMemo, useState } from "react";
import type { MapSearchTarget, NavNode, Room } from "../../types/map";
import { floors } from "../../data/floors";

type P = {
  rooms: Room[];
  nodes: NavNode[];
  target: MapSearchTarget | null;
  onLocate: (target: MapSearchTarget | null) => void;
};

type SearchItem = MapSearchTarget & { detail: string; searchText: string };

export default function RoomSearch({ rooms, nodes, target, onLocate }: P) {
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const roomCounts = new Map<string, number>();
    rooms.forEach((room) => roomCounts.set(room.name, (roomCounts.get(room.name) ?? 0) + 1));
    const roomIndexes = new Map<string, number>();
    const roomItems: SearchItem[] = rooms.map((room) => {
      const index = (roomIndexes.get(room.name) ?? 0) + 1;
      roomIndexes.set(room.name, index);
      const count = roomCounts.get(room.name) ?? 1;
      return {
        id: `room:${room.id}`,
        label: room.name,
        point: { x: room.x, y: room.y },
        floorId: room.floorId,
        detail: `${floors.find((floor) => floor.id === room.floorId)?.label ?? "Map"}${count > 1 ? ` · Entrance ${index}` : " · Room"}`,
        searchText: room.name.toLowerCase(),
      };
    });
    const nodeItems: SearchItem[] = nodes.map((node) => {
      const kind = node.type === "stairs" ? "Staircase" : node.type;
      return {
        id: `node:${node.id}`,
        label: `${kind} · ${node.id}`,
        point: node.position,
        floorId: node.floorId,
        detail: `${floors.find((floor) => floor.id === node.floorId)?.label ?? "Map"} · ${kind}`,
        searchText: `${kind} ${node.type} ${node.id}`.toLowerCase(),
      };
    });
    return [...roomItems, ...nodeItems];
  }, [nodes, rooms]);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return items.filter((item) => item.searchText.includes(t));
  }, [items, q]);

  const locate = (item: SearchItem) => {
    setQ("");
    onLocate({ ...item, point: { ...item.point } });
  };

  return (
    <div>
      <input
        className="search"
        placeholder="Search rooms, stairs, entrances…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) locate(matches[0]);
        }}
      />
      {matches.map((item) => (
        <button
          key={item.id}
          className={"result" + (item.id === target?.id ? " on" : "")}
          onClick={() => locate(item)}
        >
          <b>{item.label}</b>
          <span>{item.detail}</span>
        </button>
      ))}
      {q && !matches.length && <p className="muted">No places match “{q}”.</p>}
    </div>
  );
}
