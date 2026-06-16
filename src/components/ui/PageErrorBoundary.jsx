import React from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

/**
 * Catches render-time crashes in any child subtree so a single failing
 * component can never blank the entire screen. Shows a friendly fallback
 * with a reload action instead of an unrecoverable black page.
 */
export default class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Something went wrong" };
  }

  componentDidCatch(error, info) {
    // Surface the real cause in the console for debugging.
    console.error("PageErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="md:ml-16 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center rounded-2xl p-8"
            style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
              <AlertTriangle className="w-6 h-6" style={{ color: "#f87171" }} />
            </div>
            <h2 className="font-cinzel text-lg font-bold text-white mb-2">This page hit a snag</h2>
            <p className="text-sm font-inter mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Please reload to try again. If it keeps happening, restart the app.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-cinzel font-semibold transition-all"
              style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}
            >
              <RefreshCw className="w-4 h-4" /> Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}