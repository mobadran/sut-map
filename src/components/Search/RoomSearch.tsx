import { useMemo, useState } from "react";
import type { Room } from "../../types/map";

type P = {
  rooms: Room[];
  selectedName: string | null;
  onSelect: (name: string | null) => void;
  placeholder?: string;
};

export default function RoomSearch({ rooms, selectedName, onSelect, placeholder = "Search room (e.g. A020)…" }: P) {
  const [q, setQ] = useState("");

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const m = new Map<string, number>();
    rooms.filter((r) => r.name.toLowerCase().includes(t)).forEach((r) => m.set(r.name, (m.get(r.name) ?? 0) + 1));
    return [...m];
  }, [q, rooms]);

  return (
    <div>
      <input
        className="search"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) {
            onSelect(matches[0][0]);
            setQ("");
          }
        }}
      />
      {matches.map(([name, n]) => (
        <button
          key={name}
          className={"result" + (name === selectedName ? " on" : "")}
          onClick={() => {
            onSelect(name);
            setQ("");
          }}
        >
          <b>{name}</b>
          <span>{n > 1 ? `${n} entrances · best is chosen automatically` : "1 entrance"}</span>
        </button>
      ))}
      {q && !matches.length && <p className="muted">No rooms match “{q}”.</p>}
      {selectedName && (
        <button className="link" onClick={() => onSelect(null)}>
          Clear ({selectedName})
        </button>
      )}
    </div>
  );
}
