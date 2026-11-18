/** Thin draggable strip on a panel's right edge. `left` is the panel's right edge in px from the screen's left. */
export default function ResizeHandle({ left, onResize, onReset, label, offset = 0, className = "" }) {
  const startDrag = (e) => {
    e.preventDefault();
    const onMove = (ev) => onResize(ev.clientX - offset);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      title={label}
      onPointerDown={startDrag}
      onDoubleClick={onReset}
      className={`${className} fixed top-[57px] bottom-0 z-40 w-2 -translate-x-1/2 cursor-col-resize touch-none transition-colors hover:bg-[hsl(var(--primary)/0.35)] active:bg-[hsl(var(--primary)/0.5)]`}
      style={{ left: typeof left === "number" ? left + offset : left }}
    />
  );
}