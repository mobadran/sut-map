import { useMemo, useState } from "react";
import type { MapSearchTarget, NavNode, Room } from "../../types/map";

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
    const roomGroups = new Map<string, Room[]>();
    rooms.forEach((room) => {
      const group = roomGroups.get(room.name) ?? [];
      group.push(room);
      roomGroups.set(room.name, group);
    });

    const roomItems: SearchItem[] = [...roomGroups].map(([name, group]) => ({
      id: `room:${name}`,
      label: name,
      point: {
        x: group.reduce((sum, room) => sum + room.x, 0) / group.length,
        y: group.reduce((sum, room) => sum + room.y, 0) / group.length,
      },
      detail: group.length > 1 ? `Room · ${group.length} map locations` : "Room",
      searchText: name.toLowerCase(),
    }));
    const nodeItems: SearchItem[] = nodes.map((node) => {
      const kind = node.type === "stairs" ? "Staircase" : node.type;
      return {
        id: `node:${node.id}`,
        label: `${kind} · ${node.id}`,
        point: node.position,
        detail: kind,
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
