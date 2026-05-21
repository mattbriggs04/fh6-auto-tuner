import { motion, useScroll, useTransform } from "framer-motion";
import { Activity, ArrowDown } from "lucide-react";
import { modeList } from "../data/modes";
import type { ModeConfig } from "../types";
import { ModeSelector } from "./ModeSelector";

type HomePageProps = {
  onSelect: (mode: ModeConfig) => void;
};

export function HomePage({ onSelect }: HomePageProps) {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 640], [0, 90]);
  const titleY = useTransform(scrollY, [0, 500], [0, -40]);

  return (
    <motion.main
      className="min-h-screen bg-[#0A0A0A] text-white"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.44, ease: "easeOut" }}
    >
      <section className="relative min-h-[92svh] overflow-hidden border-b border-[#262626]">
        <motion.img
          alt=""
          className="absolute inset-0 h-[112%] w-full object-cover opacity-55"
          src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=2400&q=90"
          style={{ y: imageY }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.20),transparent_32%),linear-gradient(90deg,#0A0A0A_0%,rgba(10,10,10,0.76)_38%,rgba(10,10,10,0.28)_100%)]" />

        <motion.div
          className="relative mx-auto flex min-h-[92svh] w-full max-w-[1500px] flex-col justify-end px-5 pb-8 pt-24 md:px-10 lg:px-14"
          style={{ y: titleY }}
        >
          <div className="max-w-[880px]">
            <motion.div
              className="mb-5 inline-flex items-center gap-3 border border-[#262626] bg-black/35 px-4 py-2 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.18em] text-[#cfcfcf] backdrop-blur"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <Activity size={16} className="text-[#06b6d4]" />
              Motorsport setup intelligence
            </motion.div>

            <motion.h1
              className="font-['Rajdhani'] text-[clamp(5rem,15vw,13.5rem)] font-bold uppercase leading-[0.75] tracking-[-0.015em] text-white"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.5, ease: "easeOut" }}
            >
              Horizon Tuner
            </motion.h1>
            <motion.p
              className="mt-7 max-w-xl text-xl leading-8 text-[#d4d4d4] md:text-2xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.5, ease: "easeOut" }}
            >
              Learn. Build. Tune. Drive faster.
            </motion.p>
          </div>

          <motion.div
            className="mt-12 flex items-center gap-3 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.16em] text-[#9a9a9a]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.34 }}
          >
            <ArrowDown size={17} />
            Select a tuning discipline
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto grid w-full max-w-[1500px] gap-8 px-5 py-8 md:px-10 md:py-12 lg:px-14">
        <div className="grid gap-4 border-b border-[#262626] pb-6 lg:grid-cols-[0.9fr_1.1fr]">
          <h2 className="font-['Rajdhani'] text-4xl font-bold uppercase leading-none text-white md:text-6xl">
            Choose the setup target.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-[#b8b8b8]">
            Each mode uses a different grip, damping, aero, and differential model. Start with the closest discipline, then shape the car around the route and your driving style.
          </p>
        </div>

        <ModeSelector modes={modeList} onSelect={onSelect} />
      </section>
    </motion.main>
  );
}
