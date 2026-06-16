export default function HighlightMatch({ text, query }) {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: "rgba(0,245,255,0.2)", color: "#00f5ff", borderRadius: "3px", padding: "0 2px" }}>{part}</mark>
      : part
  );
}