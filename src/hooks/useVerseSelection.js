import { useState } from "react";
import { copyVerseSelection } from "@/lib/verseCopy";

export default function useVerseSelection({ verses, book, chapter, translation }) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState(new Set());
  const [copiedSelection, setCopiedSelection] = useState(false);

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedVerses(new Set());
  };

  const toggleSelectionMode = () => {
    setSelectionMode(v => !v);
    setSelectedVerses(new Set());
  };

  const toggleVerseSelection = (verseNum) => {
    setSelectedVerses(prev => {
      const next = new Set(prev);
      next.has(verseNum) ? next.delete(verseNum) : next.add(verseNum);
      return next;
    });
  };

  const copySelectedVerses = async () => {
    const selectedNums = [...selectedVerses].sort((a, b) => a - b);
    if (!selectedNums.length) return;

    await copyVerseSelection({ selectedNums, verses, book, chapter, translation });
    setCopiedSelection(true);
    setTimeout(() => setCopiedSelection(false), 1800);
  };

  const selectedVerseRefs = [...selectedVerses].map(vn => `${book} ${chapter}:${vn} ${translation}`);

  return {
    selectionMode,
    selectedVerses,
    copiedSelection,
    selectedVerseRefs,
    clearSelection,
    toggleSelectionMode,
    toggleVerseSelection,
    copySelectedVerses,
  };
}