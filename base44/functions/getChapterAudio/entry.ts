import { createClientFromRequest } from 'npm:@base44/sdk@0.8.63';
import OpenAI from 'npm:openai';

const VOICE = 'cedar';
const INSTRUCTIONS =
  'Speak as a warm, deep, reverent human narrator reading Holy Scripture aloud, like a seasoned audiobook ' +
  'narrator. Crystal-clear diction, studio-quality clarity, slow unhurried pace, gentle gravity, natural ' +
  'pauses between sentences, soft emphasis on key words. Never robotic, flat or rushed.';

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Sign in to listen' }, { status: 401 });

    const { book, chapter, translation, text, language } = await req.json();
    if (!text || typeof text !== 'string' || !book || !chapter || !translation) {
      return Response.json({ error: 'Missing book, chapter, translation or text' }, { status: 400 });
    }
    if (text.length > 1500) {
      return Response.json({ error: 'Passage too long' }, { status: 400 });
    }

    const clipKey = await sha256(`${translation}|${VOICE}|${text}`);
    const sr = base44.asServiceRole;
    const hit = await sr.entities.BibleAudioClip.filter({ clip_key: clipKey }, { limit: 1 });
    const cached = hit.items?.[0] ?? hit[0];
    if (cached) {
      return Response.json({ audio_url: cached.audio_url, narrator: 'Human narrator', cached: true });
    }

    console.log('step: gateway');
    const { baseURL, token, headers } = sr.aiGateway.connection();
    const client = new OpenAI({ baseURL, apiKey: token, defaultHeaders: headers, maxRetries: 0 });
    const audio = await client.audio.speech.create({
      model: 'gpt_4o_mini_tts',
      input: text,
      voice: VOICE,
      instructions: INSTRUCTIONS,
      ...(language ? { language } : {}),
    });
    console.log('step: upload');
    const file = new File([await audio.arrayBuffer()], 'passage.mp3', { type: 'audio/mpeg' });
    const { file_url } = await sr.integrations.Core.UploadPublicFile({ file });

    await sr.entities.BibleAudioClip.create({ clip_key: clipKey, audio_url: file_url, translation, book, chapter });
    return Response.json({ audio_url: file_url, narrator: 'Human narrator', cached: false });
  } catch (error) {
    console.error('getChapterAudio failed', error.message, JSON.stringify(error.response?.data ?? error.error ?? ''));
    return Response.json({ error: error.message }, { status: 500 });
  }
});