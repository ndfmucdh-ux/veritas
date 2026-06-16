// Audio-reflection domain service.
//
// Owns reads/writes for per-verse voice reflections (VerseAudioReflection).
// Used by the Reader verse menu, the verse side panel, and the recorder so the
// VerseAudioReflection entity shape lives in exactly one place.

import { base44 } from "@/api/base44Client";

// All reflections for a given verse reference.
export async function listReflectionsForVerse(verseRef) {
  return base44.entities.VerseAudioReflection.filter({ verse_ref: verseRef }).catch(() => []);
}

// Create a reflection record from an already-uploaded audio file url.
export async function createReflection({ verseRef, book, chapter, verse, translation, audioUrl, durationSeconds, transcript, mood = "grateful", isPrivate = true }) {
  return base44.entities.VerseAudioReflection.create({
    verse_ref: verseRef,
    book,
    chapter,
    verse,
    translation,
    audio_url: audioUrl,
    duration_seconds: durationSeconds,
    transcript,
    mood,
    is_private: isPrivate,
  });
}

export async function deleteReflection(id) {
  return base44.entities.VerseAudioReflection.delete(id);
}