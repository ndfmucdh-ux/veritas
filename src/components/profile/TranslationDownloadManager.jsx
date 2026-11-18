import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, Check, Loader2, ChevronDown } from "lucide-react";
import { DOWNLOADABLE_TRANSLATIONS, getAllDownloadedCodesAsync } from "@/lib/offlineBible";
import { useOfflineDownloadManager } from "@/hooks/useOfflineDownloadManager";

const LANGUAGE_GROUPS = [
  { lang: "en", label: "English", flag: "🇬🇧" },
  { lang: "es", label: "Spanish", flag: "🇪🇸" },
  { lang: "pt", label: "Portuguese", flag: "🇧🇷" },
  { lang: "fr", label: "French", flag: "🇫🇷" },
  { lang: "it", label: "Italian", flag: "🇮🇹" },
  { lang: "de", label: "German", flag: "🇩🇪" },
];

export default function TranslationDownloadManager() {
  const [expandedLang, setExpandedLang] = useState("en");
  const [downloaded, setDownloaded] = useState(new Set());
  const [storageInfo, setStorageInfo] = useState(null);
  const { activeDownloads, startDownload, removeTranslation } = useOfflineDownloadManager();

  // Load downloaded translations on mount
  useEffect(() => {
    const load = async () => {
      const codes = await getAllDownloadedCodesAsync();
      setDownloaded(new Set(codes));
      updateStorageInfo();
    };
    load();
  }, []);

  const updateStorageInfo = async () => {
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      setStorageInfo({
        used: est.usage,
        quota: est.quota,
        percent: Math.round((est.usage / est.quota) * 100),
      });
    }
  };

  const handleDownload = async (code, name) => {
    startDownload(code, name);
    // Update storage after download completes
    setTimeout(async () => {
      const updated = await getAllDownloadedCodesAsync();
      setDownloaded(new Set(updated));
      await updateStorageInfo();
    }, 500);
  };

  const handleRemove = async (code) => {
    await removeTranslation(code);
    const updated = await getAllDownloadedCodesAsync();
    setDownloaded(new Set(updated));
    await updateStorageInfo();
  };

  return (
    <div className="space-y-4">
      {/* Storage indicator */}
      {storageInfo && (
        <div className="rounded-2xl p-4" style={{ background: "var(--fill-2)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              Offline Storage
            </span>
            <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.5)" }}>
              {(storageInfo.used / 1024 / 1024).toFixed(1)}MB / {(storageInfo.quota / 1024 / 1024).toFixed(0)}MB
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
            <motion.div
              animate={{ width: `${storageInfo.percent}%` }}
              transition={{ duration: 0.4 }}
              style={{
                height: "100%",
                background: storageInfo.percent > 80 ? "linear-gradient(90deg, #f87171, #dc2626)" : "linear-gradient(90deg, #00f5ff, #a78bfa)",
              }}
            />
          </div>
          <p className="text-[10px] font-inter mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
            {downloaded.size} translation{downloaded.size !== 1 ? "s" : ""} downloaded
          </p>
        </div>
      )}

      {/* Language groups */}
      <div className="space-y-2">
        {LANGUAGE_GROUPS.map(group => {
          const translations = DOWNLOADABLE_TRANSLATIONS.filter(t => t.lang === group.lang);
          const isExpanded = expandedLang === group.lang;
          const groupDownloaded = translations.filter(t => downloaded.has(t.code)).length;

          return (
            <div key={group.lang}>
              <button
                onClick={() => setExpandedLang(isExpanded ? null : group.lang)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all"
                style={{
                  background: isExpanded ? "rgba(0,245,255,0.08)" : "rgba(255,255,255,0.04)",
                  border: isExpanded ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{group.flag}</span>
                  <div className="text-left">
                    <p className="font-cinzel text-sm font-semibold text-white">{group.label}</p>
                    <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {groupDownloaded} of {translations.length}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 ml-2 space-y-1.5 pl-2 border-l border-cyan/20">
                      {translations.map(trans => {
                        const isDownloaded = downloaded.has(trans.code);
                        const isDownloading = activeDownloads.has(trans.code);

                        return (
                          <div
                            key={trans.code}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                            style={{ background: "var(--fill-1)" }}
                          >
                            <div>
                              <p className="text-xs font-cinzel font-semibold text-white">{trans.code}</p>
                              <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>
                                {trans.name}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {isDownloaded && (
                                <span className="text-[9px] font-cinzel px-2 py-1 rounded-lg" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
                                  Downloaded
                                </span>
                              )}

                              {isDownloaded ? (
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleRemove(trans.code)}
                                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                                  style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              ) : (
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDownload(trans.code, trans.name)}
                                  disabled={isDownloading}
                                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                                  style={{
                                    background: isDownloading ? "rgba(0,245,255,0.12)" : "rgba(0,245,255,0.1)",
                                    color: isDownloading ? "#00f5ff" : "rgba(0,245,255,0.6)",
                                  }}
                                >
                                  {isDownloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </motion.button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] font-inter px-4 py-2 rounded-xl" style={{ background: "rgba(0,245,255,0.05)", color: "rgba(0,245,255,0.5)" }}>
        💡 Downloaded versions are available offline. Downloads are stored locally on your device using browser storage.
      </p>
    </div>
  );
}