import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recentlyReadBooks, lastNDays = 7 } = body;

    if (!recentlyReadBooks || recentlyReadBooks.length === 0) {
      return Response.json({ error: 'No reading history provided' }, { status: 400 });
    }

    // Fetch recent reading progress
    const readingProgress = await base44.asServiceRole.entities.ReadingProgress.filter({
      created_by: user.email,
    });

    // Analyze themes from recently read books
    const bookThemes = {
      'Genesis': ['creation', 'faith', 'beginnings', 'trust'],
      'Psalms': ['worship', 'prayer', 'comfort', 'praise'],
      'Proverbs': ['wisdom', 'guidance', 'decisions', 'character'],
      'Matthew': ['grace', 'salvation', 'kingdom', 'discipleship'],
      'John': ['faith', 'love', 'eternity', 'redemption'],
      'Romans': ['faith', 'righteousness', 'grace', 'transformation'],
      '1 Corinthians': ['love', 'unity', 'spiritual gifts', 'faith'],
      'Galatians': ['freedom', 'grace', 'faith', 'liberty'],
      'Ephesians': ['unity', 'spiritual blessings', 'prayer', 'strength'],
      'Philippians': ['joy', 'peace', 'contentment', 'prayer'],
      'Colossians': ['Christ', 'redemption', 'fullness', 'maturity'],
      '1 Thessalonians': ['hope', 'encouragement', 'faith', 'return'],
      'Hebrews': ['faith', 'perseverance', 'redemption', 'hope'],
      'James': ['faith', 'works', 'wisdom', 'perseverance'],
      '1 Peter': ['hope', 'suffering', 'faith', 'redemption'],
      '1 John': ['love', 'light', 'fellowship', 'truth'],
      'Revelation': ['hope', 'redemption', 'future', 'victory'],
    };

    // Extract themes from recently read books
    const themes = [];
    recentlyReadBooks.forEach(book => {
      if (bookThemes[book]) {
        themes.push(...bookThemes[book]);
      }
    });

    // Remove duplicates and limit to top themes
    const uniqueThemes = [...new Set(themes)].slice(0, 3);

    // Generate personalized devotional using AI
    const prompt = `Create a personalized daily devotional for a reader who has recently been studying: ${recentlyReadBooks.join(', ')}.

The devotional should focus on these themes: ${uniqueThemes.join(', ')}.

Format the response as JSON with this structure:
{
  "title": "Devotional title related to their reading",
  "mainVerseRef": "Book Chapter:Verses",
  "reflection": "2-3 paragraphs of reflection connecting their recent reading to their spiritual life",
  "application": "How they can apply today's devotional to their daily life",
  "prayer": "A brief prayer based on the theme"
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          mainVerseRef: { type: 'string' },
          reflection: { type: 'string' },
          application: { type: 'string' },
          prayer: { type: 'string' },
        },
        required: ['title', 'mainVerseRef', 'reflection', 'application', 'prayer'],
      },
    });

    return Response.json({
      success: true,
      devotional: response,
      booksAnalyzed: recentlyReadBooks,
      themes: uniqueThemes,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});