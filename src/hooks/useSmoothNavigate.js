import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { smoothNavigate } from "@/lib/smoothNavigate";

/** Drop-in replacement for useNavigate that crossfades via View Transitions. */
export default function useSmoothNavigate() {
  const navigate = useNavigate();
  return useCallback((to, options) => smoothNavigate(() => navigate(to, options)), [navigate]);
}