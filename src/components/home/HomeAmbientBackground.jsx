export default function HomeAmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
        style={{ background: "radial-gradient(ellipse, rgba(0,245,255,0.04) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/3 right-0 w-[400px] h-[400px]"
        style={{ background: "radial-gradient(ellipse, rgba(255,215,0,0.03) 0%, transparent 70%)" }}
      />
    </div>
  );
}