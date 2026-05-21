import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import { generateSetup } from "../lib/tuningHeuristics";
import { useTuningStore } from "../store/tuningStore";
import type { ModeConfig } from "../types";
import { OutputPanel } from "./OutputPanel";
import { VehicleInputPanel } from "./VehicleInputPanel";

type ModePageProps = {
  mode: ModeConfig;
  onHome: () => void;
};

export function ModePage({ mode, onHome }: ModePageProps) {
  const { inputs, mode: activeMode, setMode } = useTuningStore();
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 520], [0, 70]);

  useEffect(() => {
    if (activeMode !== mode.id) {
      setMode(mode.id);
    }
  }, [activeMode, mode.id, setMode]);

  const setup = useMemo(() => generateSetup(mode.id, inputs), [inputs, mode.id]);
  const Icon = mode.icon;

  return (
    <motion.main
      className="min-h-screen bg-[#0A0A0A] text-white"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <header className="sticky top-0 z-30 border-b border-[#262626] bg-[#0A0A0A]/88 px-5 py-4 backdrop-blur-xl md:px-10 lg:px-14">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4">
          <motion.button
            className="flex items-center gap-3 font-['Rajdhani'] text-base font-bold uppercase tracking-[0.12em] text-[#d6d6d6]"
            onClick={onHome}
            type="button"
            whileHover={{ x: -4, color: mode.accent }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={18} />
            Horizon Tuner
          </motion.button>
          <div className="hidden items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-[#777] md:flex">
            <span>Mode</span>
            <span style={{ color: mode.accent }}>{mode.title}</span>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#262626]">
        <motion.img
          alt=""
          className="absolute inset-0 h-[118%] w-full object-cover opacity-42"
          src={mode.image}
          style={{ y: imageY }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/24" />
        <div className="relative mx-auto grid min-h-[42rem] w-full max-w-[1500px] content-end px-5 py-12 md:px-10 lg:px-14">
          <motion.div
            className="max-w-4xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.48, ease: "easeOut" }}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full border border-[#262626] bg-[#141414]/75" style={{ color: mode.accent }}>
                <Icon size={23} strokeWidth={1.8} />
              </span>
              <span className="font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.18em]" style={{ color: mode.accent }}>
                Physics-inspired setup generator
              </span>
            </div>

            <h1 className="font-['Rajdhani'] text-[clamp(4.8rem,12vw,11rem)] font-bold uppercase leading-[0.78] tracking-[-0.01em] text-white">
              {mode.title}
            </h1>
            <motion.div
              className="mt-6 h-px w-full max-w-[38rem] origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.24, duration: 0.68, ease: "easeOut" }}
              style={{ background: `linear-gradient(90deg, ${mode.accent}, transparent)` }}
            />
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#c9c9c9] md:text-xl">
              {mode.philosophy}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1500px] gap-5 px-5 py-5 md:px-10 md:py-8 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-14">
        <div className="lg:sticky lg:top-[5.75rem] lg:self-start">
          <VehicleInputPanel mode={mode} />
        </div>

        <div className="grid gap-5">
          <motion.div
            className="rounded-[1rem] border border-[#262626] bg-[#101010] p-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 shrink-0" size={18} style={{ color: mode.accent }} />
              <p className="text-sm leading-6 text-[#bdbdbd]">
                Baselines are deliberately conservative. Use them as the first stable setup, test on the route, then change one tuning system at a time so the car teaches you what it needs.
              </p>
            </div>
          </motion.div>

          <OutputPanel inputs={inputs} mode={mode} setup={setup} />
        </div>
      </section>
    </motion.main>
  );
}
