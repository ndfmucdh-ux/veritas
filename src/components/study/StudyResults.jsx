import Section from "@/components/study/StudyResultSection.jsx";

export function CommentaryResult({ data }) {
  return (
    <>
      <Section label="Historical Context" color="#fbbf24">
        <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{data.context}</p>
      </Section>
      {data.key_words?.length > 0 && (
        <Section label="Greek / Hebrew Words" color="#a78bfa">
          <div className="space-y-2">
            {data.key_words.map((w, i) => (
              <div key={i} className="flex gap-3">
                <span className="font-cinzel text-sm font-bold text-white/80">{w.word}</span>
                <span className="text-xs font-inter italic" style={{ color: "#a78bfa" }}>{w.original}</span>
                <span className="text-xs font-inter flex-1" style={{ color: "rgba(255,255,255,0.55)" }}>{w.meaning}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
      <Section label="Theological Significance" color="#34d399">
        <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{data.theology}</p>
      </Section>
      <Section label="Application" color="#00f5ff">
        <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{data.application}</p>
      </Section>
      {data.cross_refs?.length > 0 && (
        <Section label="See Also">
          <div className="flex flex-wrap gap-2">
            {data.cross_refs.map((ref, i) => (
              <a key={i} href="/study" className="text-xs px-2.5 py-1 rounded-lg font-cinzel" style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff" }}>{ref}</a>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

export function CrossRefsResult({ data }) {
  return (
    <Section label="Cross References" color="#fbbf24">
      <div className="space-y-3">
        {data.map((r, i) => (
          <div key={i} className="flex gap-3">
            <a href={`/read?book=${r.reference?.split(" ").slice(0,-1).join(" ")}&chapter=${r.reference?.split(" ").pop()?.split(":")[0]}`} className="font-cinzel text-xs font-semibold flex-shrink-0 pt-0.5" style={{ color: "#fbbf24" }}>
              {r.reference}
            </a>
            <div>
              <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.7)" }}>{r.connection}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "var(--fill-3)", color: "rgba(255,255,255,0.4)" }}>{r.theme}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function TopicalResult({ tag, data }) {
  return (
    <Section label={`Verses on "${tag}"`} color="#a78bfa">
      <div className="space-y-4">
        {data.map((v, i) => (
          <div key={i}>
            <p className="font-playfair italic text-sm leading-relaxed mb-1.5" style={{ color: "rgba(255,255,255,0.82)" }}>"{v.text}"</p>
            <p className="font-cinzel text-xs font-bold mb-1" style={{ color: "#fbbf24" }}>{v.ref}</p>
            <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.45)" }}>{v.insight}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function DictionaryResult({ data }) {
  return (
    <>
      <Section label={`Definition: ${data.term}`} color="#fbbf24">
        <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{data.definition}</p>
      </Section>
      {data.greek_hebrew && (
        <Section label="Greek / Hebrew" color="#a78bfa">
          <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.7)" }}>{data.greek_hebrew}</p>
          {data.etymology && <p className="text-xs mt-2 font-inter italic" style={{ color: "rgba(255,255,255,0.45)" }}>{data.etymology}</p>}
        </Section>
      )}
      <Section label="Biblical Usage" color="#34d399">
        <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{data.usage}</p>
      </Section>
      {data.key_verses?.length > 0 && (
        <Section label="Key Verses">
          <div className="flex flex-wrap gap-2">
            {data.key_verses.map((v, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-cinzel" style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff" }}>{v}</span>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}