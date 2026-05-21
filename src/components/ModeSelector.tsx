import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "./Card";
import type { ModeConfig } from "../types";

type ModeSelectorProps = {
  modes: ModeConfig[];
  onSelect: (mode: ModeConfig) => void;
};

export function ModeSelector({ modes, onSelect }: ModeSelectorProps) {
  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.08
          }
        }
      }}
    >
      {modes.map((mode) => {
        const Icon = mode.icon;

        return (
          <motion.div
            key={mode.id}
            variants={{
              hidden: { opacity: 0, y: 22 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <Card accent={mode.accent} asButton className="group h-[21rem] w-full p-0" onClick={() => onSelect(mode)}>
              <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" src={mode.image} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/58 to-transparent" />
              <div className="relative flex h-full flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <span
                    className="grid size-11 place-items-center rounded-full border border-white/15 bg-black/35"
                    style={{ color: mode.accent }}
                  >
                    <Icon size={21} strokeWidth={1.8} />
                  </span>
                  <motion.span
                    className="grid size-9 place-items-center rounded-full border border-white/15 bg-black/30 text-white"
                    whileHover={{ rotate: 45 }}
                    transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  >
                    <ArrowUpRight size={17} />
                  </motion.span>
                </div>

                <div>
                  <div className="mb-2 h-px w-16" style={{ background: mode.accent }} />
                  <h2 className="font-['Rajdhani'] text-3xl font-bold uppercase leading-none text-white">
                    {mode.cardTitle}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#c9c9c9]">{mode.philosophy}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
