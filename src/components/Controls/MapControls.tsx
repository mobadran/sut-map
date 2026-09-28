type P = { onZoomIn: () => void; onZoomOut: () => void; onReset: () => void };
export default function MapControls({ onZoomIn, onZoomOut, onReset }: P) {
  return (
    <div className="controls" onPointerDown={(e) => e.stopPropagation()}>
      <button onClick={onZoomIn} title="Zoom in">+</button>
      <button onClick={onZoomOut} title="Zoom out">−</button>
      <button onClick={onReset} title="Reset view">⤢</button>
    </div>
  );
}
