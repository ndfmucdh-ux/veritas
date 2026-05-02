import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-2xl gradient-cyan flex items-center justify-center mb-6">
        <span className="text-background font-cinzel font-bold text-3xl">V</span>
      </div>
      <h1 className="font-cinzel text-4xl font-bold text-foreground mb-2">404</h1>
      <p className="text-muted-foreground mb-6">This page is not in the scriptures.</p>
      <Link to="/" className="px-6 py-3 rounded-xl bg-cyan/20 text-cyan border border-cyan/30 hover:bg-cyan/30 transition-colors font-cinzel text-sm">
        Return Home
      </Link>
    </div>
  );
}