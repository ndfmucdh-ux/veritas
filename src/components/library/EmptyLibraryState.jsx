export default function EmptyLibraryState({ icon, text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <span className="text-5xl">{icon}</span>
      <p className="font-cinzel text-foreground/60 text-sm">{text}</p>
      <p className="text-xs text-muted-foreground text-center max-w-xs">{sub}</p>
    </div>
  );
}