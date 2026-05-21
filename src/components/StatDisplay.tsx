import { motion } from "framer-motion";
import type { Stat } from "../types";

type StatDisplayProps = {
  stat: Stat;
  accent: string;
};

export function StatDisplay({ stat, accent }: StatDisplayProps) {
  return (
    <motion.div
      className="rounded-[0.9rem] border border-[#262626] bg-[#0f0f0f] p-4"
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.035)` }}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -4, borderColor: accent }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="font-['Rajdhani'] text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#8a8a8a]">
        {stat.label}
      </div>
      <div className="mt-2 font-mono text-[1.45rem] font-semibold leading-none text-white">{stat.value}</div>
      <p className="mt-3 text-sm leading-6 text-[#b3b3b3]">{stat.detail}</p>
    </motion.div>
  );
}
