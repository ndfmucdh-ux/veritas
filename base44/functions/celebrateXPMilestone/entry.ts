import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called by entity automation when UserXP is updated.
// Sends a celebratory message from verse_companion when crossing a 500-pt threshold.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { data, old_data } = body;
    if (!data) return Response.json({ skipped: true });

    const currentXP = data.total_xp || 0;
    const previousXP = old_data?.total_xp || 0;

    // Check if we crossed a 500-pt threshold
    const currentBand = Math.floor(currentXP / 500);
    const previousBand = Math.floor(previousXP / 500);
    if (currentBand <= previousBand) {
      return Response.json({ skipped: "no threshold crossed" });
    }

    const milestone = currentBand * 500;

    // Get the user email from the entity's created_by
    const userEmail = data.created_by;
    if (!userEmail) return Response.json({ skipped: "no user email" });

    // Build a celebratory message and send via email
    const levelNames = { 0: "Seeker", 500: "Disciple", 2000: "Scholar", 5000: "Elder" };
    const levelName = Object.entries(levelNames).reverse().find(([minXP]) => currentXP >= parseInt(minXP))?.[1] || "Seeker";

    const subject = `🎉 You've reached ${milestone} XP in Veritas!`;
    const body_html = `
      <div style="font-family: Georgia, serif; background: #0a0f1e; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #fbbf24; font-size: 28px;">Congratulations, ${levelName}! 🌟</h1>
        <p style="font-size: 18px; line-height: 1.7; color: #e2e8f0;">
          You've just crossed <strong style="color: #00f5ff;">${milestone} XP</strong> — a true milestone in your spiritual journey!
        </p>
        <p style="font-size: 16px; line-height: 1.8; color: #cbd5e1;">
          Every verse you read, every note you write, every prayer you journal — it all counts. 
          The Word of God is alive and active in you.
        </p>
        <blockquote style="border-left: 3px solid #fbbf24; padding-left: 16px; color: #a78bfa; font-style: italic; margin: 20px 0;">
          "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
        </blockquote>
        <p style="color: #94a3b8;">Keep going. Your ${Math.floor(currentXP).toLocaleString()} XP is just the beginning. 🔥</p>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject,
      body: body_html,
    });

    return Response.json({ success: true, milestone, userEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});