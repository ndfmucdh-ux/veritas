import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { format = "email", send_to_email } = body;

    // Fetch all user data in parallel
    const [notes, highlights, prayers, bookmarks, xp] = await Promise.all([
      base44.entities.UserNote.list("-created_date", 200).catch(() => []),
      base44.entities.UserHighlight.list("-created_date", 200).catch(() => []),
      base44.entities.PrayerJournal.list("-created_date", 100).catch(() => []),
      base44.entities.Bookmark.list("-created_date", 200).catch(() => []),
      base44.entities.UserXP.list("-updated_date", 1).catch(() => []),
    ]);

    const xpRecord = xp?.[0] || {};
    const name = user.full_name || "Beloved";

    // Build AI-powered spiritual journey summary
    const notesSummary = notes.slice(0, 30).map(n => `- ${n.verse_ref}: ${n.note_text?.slice(0, 120)}`).join("\n");
    const prayerSummary = prayers.slice(0, 20).map(p => `- [${p.mood || "prayer"}] ${p.prayer_text?.slice(0, 100)}`).join("\n");
    const highlightRefs = [...new Set(highlights.map(h => h.verse_ref))].slice(0, 30).join(", ");

    const aiSummary = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate spiritual director reviewing someone's Bible study journey.

User: ${name}
Level: ${xpRecord.level || "Seeker"} | Streak: ${xpRecord.streak_days || 0} days | XP: ${xpRecord.total_xp || 0}

THEIR NOTES (${notes.length} total):
${notesSummary || "No notes yet."}

THEIR PRAYERS (${prayers.length} total):
${prayerSummary || "No prayers yet."}

HIGHLIGHTED VERSES (${highlights.length} total):
${highlightRefs || "No highlights yet."}

Write a warm, personal spiritual journey summary (3-4 paragraphs) that:
1. Reflects on the themes and patterns you see in their notes and prayers
2. Celebrates their faithfulness and growth
3. Identifies recurring spiritual themes (e.g., seeking peace, wrestling with faith, gratitude)
4. Offers one encouraging word and a scripture to carry forward
Keep it personal, warm, and pastoral — not clinical.`,
      model: "claude_sonnet_4_6",
    });

    if (format === "json") {
      return Response.json({
        user: { name, email: user.email, level: xpRecord.level, streak: xpRecord.streak_days, xp: xpRecord.total_xp },
        summary: aiSummary,
        notes: notes.map(n => ({ verse: n.verse_ref, note: n.note_text, date: n.created_date })),
        highlights: highlights.map(h => ({ verse: h.verse_ref, color: h.color, date: h.created_date })),
        prayers: prayers.map(p => ({ mood: p.mood, text: p.prayer_text, verse: p.verse_ref, tags: p.tags, date: p.created_date })),
        bookmarks: bookmarks.map(b => ({ verse: b.verse_ref, label: b.label, date: b.created_date })),
        exported_at: new Date().toISOString(),
      });
    }

    // Build beautiful HTML export
    const toDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

    const notesHtml = notes.slice(0, 50).map(n => `
      <div style="border-left:3px solid #a78bfa44;padding:14px 16px;margin-bottom:12px;background:rgba(167,139,250,0.04);border-radius:0 12px 12px 0;">
        <div style="font-family:Cinzel,serif;font-size:11px;letter-spacing:0.15em;color:#a78bfa;margin-bottom:6px;">${n.verse_ref || "Note"} · ${toDate(n.created_date)}</div>
        <div style="font-family:Inter,sans-serif;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.7;">${n.note_text || ""}</div>
      </div>`).join("");

    const highlightsHtml = highlights.slice(0, 50).map(h => {
      const colors = { yellow: "#fbbf24", cyan: "#00f5ff", purple: "#a78bfa", green: "#34d399", red: "#f87171" };
      const c = colors[h.color] || "#fbbf24";
      return `<span style="display:inline-block;font-family:Cinzel,serif;font-size:11px;padding:4px 12px;border-radius:999px;background:${c}18;border:1px solid ${c}44;color:${c};margin:3px;">${h.verse_ref}</span>`;
    }).join("");

    const prayersHtml = prayers.slice(0, 30).map(p => {
      const moodColors = { grateful: "#34d399", confessing: "#f87171", interceding: "#00f5ff", celebrating: "#fbbf24" };
      const c = moodColors[p.mood] || "#a78bfa";
      return `
      <div style="border-left:3px solid ${c}44;padding:14px 16px;margin-bottom:12px;background:${c}07;border-radius:0 12px 12px 0;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="font-family:Cinzel,serif;font-size:10px;letter-spacing:0.12em;color:${c};text-transform:capitalize;">${p.mood || "prayer"}</span>
          ${p.verse_ref ? `<span style="font-family:Inter,sans-serif;font-size:10px;color:rgba(255,255,255,0.25);">· ${p.verse_ref}</span>` : ""}
          <span style="font-family:Inter,sans-serif;font-size:10px;color:rgba(255,255,255,0.2);margin-left:auto;">${toDate(p.created_date)}</span>
        </div>
        <div style="font-family:'Playfair Display',serif;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.75;font-style:italic;">"${p.prayer_text || ""}"</div>
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Veritas · Spiritual Journey Export · ${name}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;1,400&family=Inter:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#06080f;font-family:Inter,sans-serif;color:rgba(255,255,255,0.85);}
.wrap{max-width:680px;margin:0 auto;padding:0 0 60px;}
</style>
</head>
<body>
<div class="wrap">
  <!-- Header -->
  <div style="background:linear-gradient(160deg,#0a0f1e,#060a14);padding:40px 36px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);">
    <div style="display:inline-block;border-radius:22%;overflow:hidden;width:64px;height:64px;box-shadow:0 0 32px rgba(255,215,0,0.2);">
      <img src="https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg" width="64" height="64" style="display:block;object-fit:cover;" alt="Veritas"/>
    </div>
    <div style="font-family:Cinzel,serif;font-size:22px;font-weight:700;color:#fff;letter-spacing:0.18em;margin-top:14px;">VERITAS</div>
    <div style="font-family:Inter,sans-serif;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.2em;text-transform:uppercase;margin-top:4px;">Spiritual Journey Export</div>
    <div style="font-family:Cinzel,serif;font-size:20px;color:rgba(255,255,255,0.85);margin-top:20px;">${name}</div>
    <div style="font-family:Inter,sans-serif;font-size:12px;color:rgba(255,255,255,0.35);margin-top:6px;">Exported ${toDate(new Date().toISOString())}</div>
    <div style="display:flex;justify-content:center;gap:20px;margin-top:20px;flex-wrap:wrap;">
      ${[
        { label: "Level", value: xpRecord.level || "Seeker", color: "#FFD700" },
        { label: "XP", value: (xpRecord.total_xp || 0).toLocaleString(), color: "#fbbf24" },
        { label: "Streak", value: `${xpRecord.streak_days || 0} days`, color: "#f97316" },
        { label: "Notes", value: notes.length, color: "#a78bfa" },
        { label: "Highlights", value: highlights.length, color: "#00f5ff" },
        { label: "Prayers", value: prayers.length, color: "#34d399" },
      ].map(s => `
        <div style="text-align:center;">
          <div style="font-family:Cinzel,serif;font-size:18px;font-weight:700;color:${s.color};">${s.value}</div>
          <div style="font-family:Inter,sans-serif;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.1em;">${s.label}</div>
        </div>`).join("")}
    </div>
  </div>

  <!-- Journey Summary -->
  <div style="margin:28px 28px 0;background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.15);border-radius:16px;padding:28px;">
    <div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,215,0,0.6);margin-bottom:16px;">✦ Your Spiritual Journey · A Personal Reflection</div>
    <div style="font-family:'Playfair Display',serif;font-size:16px;color:rgba(255,255,255,0.8);line-height:1.85;white-space:pre-line;">${aiSummary}</div>
  </div>

  ${notes.length > 0 ? `
  <!-- Notes -->
  <div style="margin:28px 28px 0;">
    <div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(167,139,250,0.6);margin-bottom:16px;">✍️ Study Notes (${notes.length})</div>
    ${notesHtml}
  </div>` : ""}

  ${highlights.length > 0 ? `
  <!-- Highlights -->
  <div style="margin:28px 28px 0;">
    <div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(0,245,255,0.6);margin-bottom:16px;">✨ Highlighted Verses (${highlights.length})</div>
    <div style="padding:16px;background:rgba(255,255,255,0.025);border-radius:12px;border:1px solid rgba(255,255,255,0.07);">${highlightsHtml}</div>
  </div>` : ""}

  ${prayers.length > 0 ? `
  <!-- Prayers -->
  <div style="margin:28px 28px 0;">
    <div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(52,211,153,0.6);margin-bottom:16px;">🙏 Prayer Journal (${prayers.length})</div>
    ${prayersHtml}
  </div>` : ""}

  <!-- Footer -->
  <div style="margin:40px 28px 0;text-align:center;border-top:1px solid rgba(255,255,255,0.05);padding-top:24px;">
    <div style="font-family:Inter,sans-serif;font-size:11px;color:rgba(255,255,255,0.2);line-height:1.8;">
      Thy word is a lamp unto my feet, and a light unto my path — Psalm 119:105<br/>
      Generated by Veritas Bible App
    </div>
  </div>
</div>
</body>
</html>`;

    if (format === "send_email" && send_to_email) {
      await base44.integrations.Core.SendEmail({
        from_name: "Veritas",
        to: send_to_email,
        subject: `✨ ${name}'s Spiritual Journey — Veritas Export`,
        body: html,
      });
      return Response.json({ success: true, sent_to: send_to_email, summary: aiSummary });
    }

    return Response.json({ html, summary: aiSummary, stats: { notes: notes.length, highlights: highlights.length, prayers: prayers.length, bookmarks: bookmarks.length } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});