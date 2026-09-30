type P = {  onReset: () => void };
export default function MapControls({  onReset }: P) {
  return (
    <div className="controls" onPointerDown={(e) => e.stopPropagation()}>
      <button onClick={onReset} title="Reset view">⤢</button>
    </div>
  );
}
