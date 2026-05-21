import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HomePage } from "./components/HomePage";
import { ModePage } from "./components/ModePage";
import { modes } from "./data/modes";
import { useTuningStore } from "./store/tuningStore";
import type { ModeConfig, ModeId } from "./types";

function modeFromPath(pathname: string): ModeConfig | null {
  const key = pathname.replace("/", "") as ModeId;

  return modes[key] ?? null;
}

function App() {
  const [path, setPath] = useState(() => window.location.pathname);
  const setMode = useTuningStore((state) => state.setMode);
  const activeMode = useMemo(() => modeFromPath(path), [path]);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);

    window.addEventListener("popstate", onPopState);

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextPath: string) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const selectMode = (mode: ModeConfig) => {
    setMode(mode.id);
    navigate(mode.route);
  };

  return (
    <AnimatePresence mode="wait">
      {activeMode ? (
        <ModePage key={activeMode.id} mode={activeMode} onHome={() => navigate("/")} />
      ) : (
        <HomePage key="home" onSelect={selectMode} />
      )}
    </AnimatePresence>
  );
}

export default App;
