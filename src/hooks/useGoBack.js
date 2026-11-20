import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/** Pops the history stack; if this screen was opened directly, goes to `fallback` instead. */
export default function useGoBack(fallback = "/") {
  const navigate = useNavigate();
  return useCallback(() => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}