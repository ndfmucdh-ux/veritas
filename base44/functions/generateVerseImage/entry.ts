import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { verse_ref, style_template = "elegant" } = await req.json();
    if (!verse_ref) return Response.json({ error: 'Missing verse_ref' }, { status: 400 });

    const prompt = `Create a beautiful, spiritually-inspired image for the Bible verse: "${verse_ref}".
Style: ${style_template === "elegant" ? "luxurious, gold accents, sophisticated typography" : style_template === "modern" ? "clean, minimalist, contemporary design" : style_template === "minimal" ? "simple, white space, serene" : "artistic, watercolor, expressive"}.
The image should be suitable for sharing on social media. Include the verse text prominently.`;

    const { url } = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt });

    await base44.entities.VerseImage.create({
      verse_ref,
      style_template,
      image_url: url,
      shared_count: 0,
    });

    return Response.json({ image_url: url, verse_ref });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});