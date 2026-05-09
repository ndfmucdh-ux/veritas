import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import VeritasLogo from "@/components/ui/VeritasLogo";

export default function AuthGate() {
  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="md:ml-16 min-h-screen flex flex-col items-center justify-center px-6 pb-28"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px]"
          style={{ background: "radial-gradient(ellipse, rgba(0,245,255,0.06) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/3 right-0 w-[300px] h-[300px]"
          style={{ background: "radial-gradient(ellipse, rgba(255,215,0,0.04) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-xs w-full">
        {/* Logo */}
        <div className="mb-6" style={{ boxShadow: "0 0 40px rgba(0,245,255,0.2)" }}>
          <VeritasLogo size={72} className="rounded-2xl" />
        </div>

        <h1 className="font-cinzel text-2xl font-bold text-white mb-2">Sign In to Continue</h1>
        <p className="font-inter text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.45)" }}>
          Create a free account or sign in to track your streaks, highlights, notes, bookmarks, and spiritual growth.
        </p>

        {/* Features teaser */}
        <div className="w-full rounded-2xl p-4 mb-8 space-y-2.5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            ["🔥", "Daily reading streaks & XP"],
            ["🔖", "Bookmarks, highlights & notes"],
            ["📖", "Personal reading plans"],
            ["🏆", "Badges & level progression"],
            ["🙏", "Prayer journal"],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              <span className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          className="w-full py-3.5 rounded-2xl font-cinzel text-sm font-semibold tracking-wide"
          style={{ background: "linear-gradient(135deg, #00e5ff, #00b4cc)", color: "#06080f", boxShadow: "0 0 24px rgba(0,229,255,0.3)" }}
        >
          Sign In / Create Account
        </motion.button>

        <p className="font-inter text-xs mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
          Free to use. No credit card required.
        </p>
      </div>
    </motion.div>
  );
}