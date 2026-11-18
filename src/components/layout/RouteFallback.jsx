import VeritasLogo from "@/components/ui/VeritasLogo";

/**
 * Lightweight fallback shown while a lazily-loaded page chunk is being fetched.
 * Brand-consistent with the initial app boot loader so route transitions feel seamless.
 */
export default function RouteFallback() {
  return (
    <div className="md:ml-16 min-h-[60vh] flex items-center justify-center bg-background" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-4">
        <div style={{ boxShadow: "0 0 30px rgba(255,215,0,0.25)" }} className="rounded-2xl">
          <VeritasLogo size={48} className="rounded-2xl" />
        </div>
        <div className="w-7 h-7 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
      </div>
    </div>
  );
}