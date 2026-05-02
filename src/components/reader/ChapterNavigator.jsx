import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Book, Hash } from "lucide-react";
import { BIBLE_BOOKS, OT_BOOKS, NT_BOOKS } from "@/lib/bibleData";

export default function ChapterNavigator({ book, chapter, translation, onNavigate }) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedBook, setSelectedBook] = useState(book);
  const [tab, setTab] = useState("OT");

  const bookData = BIBLE_BOOKS.find(b => b.name === book);
  const totalChapters = bookData?.chapters || 1;

  const goPrev = () => {
    if (chapter > 1) {
      onNavigate(book, chapter - 1, translation);
    } else {
      const idx = BIBLE_BOOKS.findIndex(b => b.name === book);
      if (idx > 0) {
        const prev = BIBLE_BOOKS[idx - 1];
        onNavigate(prev.name, prev.chapters, translation);
      }
    }
  };

  const goNext = () => {
    if (chapter < totalChapters) {
      onNavigate(book, chapter + 1, translation);
    } else {
      const idx = BIBLE_BOOKS.findIndex(b => b.name === book);
      if (idx < BIBLE_BOOKS.length - 1) {
        onNavigate(BIBLE_BOOKS[idx + 1].name, 1, translation);
      }
    }
  };

  const books = tab === "OT" ? OT_BOOKS : NT_BOOKS;
  const selBookData = BIBLE_BOOKS.find(b => b.name === selectedBook);

  return (
    <>
      <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
        <button onClick={goPrev} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowPicker(true)}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-cinzel tracking-wide hover:text-cyan transition-colors"
        >
          <Book className="w-4 h-4 text-muted-foreground" />
          <span>{book}</span>
          <span className="text-muted-foreground">·</span>
          <Hash className="w-3 h-3 text-muted-foreground" />
          <span>{chapter}</span>
        </button>

        <button onClick={goNext} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Book/Chapter Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="glass-strong w-full max-w-lg rounded-t-3xl md:rounded-2xl max-h-[80vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Tabs */}
              <div className="flex p-4 gap-2 border-b border-border">
                {["OT", "NT"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-cinzel transition-colors ${
                      tab === t ? "bg-cyan/20 text-cyan" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "OT" ? "Old Testament" : "New Testament"}
                  </button>
                ))}
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Book List */}
                <div className="w-1/2 border-r border-border overflow-y-auto scrollbar-hide p-2">
                  {books.map(b => (
                    <button
                      key={b.name}
                      onClick={() => setSelectedBook(b.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedBook === b.name
                          ? "bg-cyan/20 text-cyan font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>

                {/* Chapter Grid */}
                <div className="w-1/2 overflow-y-auto scrollbar-hide p-3">
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: selBookData?.chapters || 1 }, (_, i) => i + 1).map(ch => (
                      <button
                        key={ch}
                        onClick={() => {
                          onNavigate(selectedBook, ch, translation);
                          setShowPicker(false);
                        }}
                        className={`aspect-square rounded-lg text-sm transition-all hover:scale-105 ${
                          selectedBook === book && ch === chapter
                            ? "bg-cyan text-background font-bold"
                            : "bg-muted text-muted-foreground hover:bg-cyan/20 hover:text-cyan"
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}