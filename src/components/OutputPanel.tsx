import { motion } from "framer-motion";
import { Activity, Crosshair, Gauge, Layers3, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { ModeConfig, SetupRecommendation, VehicleInputs } from "../types";
import { StatDisplay } from "./StatDisplay";

type OutputPanelProps = {
  mode: ModeConfig;
  inputs: VehicleInputs;
  setup: SetupRecommendation;
};

export function OutputPanel({ mode, inputs, setup }: OutputPanelProps) {
  const stats = [
    {
      label: "Spring rate",
      value: `${setup.springFront} / ${setup.springRear}`,
      detail: "Front / rear lb-in baseline from weight distribution, tire grip, and mode stiffness."
    },
    {
      label: "Compression",
      value: `${setup.compressionFront} / ${setup.compressionRear}`,
      detail: "Front / rear bump damping. Lower values absorb rougher surfaces and curbs."
    },
    {
      label: "Rebound",
      value: `${setup.reboundFront} / ${setup.reboundRear}`,
      detail: "Front / rear rebound damping. Controls how quickly load returns after inputs."
    },
    {
      label: "Ride height",
      value: setup.rideHeight,
      detail: setup.rideHeightDetail
    },
    {
      label: "Aero balance",
      value: setup.aeroBalance,
      detail: setup.aeroDetail
    },
    {
      label: "Power target",
      value: `${setup.powerTarget.min}-${setup.powerTarget.max} hp`,
      detail: setup.powerTarget.note
    }
  ];

  return (
    <motion.section
      className="grid gap-5"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.055
          }
        }
      }}
    >
      <motion.div
        className="rounded-[1rem] border border-[#262626] bg-[#141414]/95 p-5"
        variants={{
          hidden: { opacity: 0, y: 18 },
          show: { opacity: 1, y: 0 }
        }}
      >
        <div className="mb-5 flex flex-col justify-between gap-4 border-b border-[#262626] pb-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.12em]" style={{ color: mode.accent }}>
              <Gauge size={16} />
              Auto-generated baseline
            </div>
            <h2 className="font-['Rajdhani'] text-4xl font-bold uppercase leading-none text-white md:text-5xl">
              Setup Output
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-right font-mono">
            <Telemetry label="HP" value={inputs.horsepower} />
            <Telemetry label="KG" value={inputs.weightKg} />
            <Telemetry label="F%" value={inputs.frontWeightPercent} />
          </div>
        </div>

        <motion.div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatDisplay accent={mode.accent} key={stat.label} stat={stat} />
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"
        variants={{
          hidden: { opacity: 0, y: 18 },
          show: { opacity: 1, y: 0 }
        }}
      >
        <InfoPanel accent={mode.accent} icon={Wrench} title="Differential baseline">
          <ul className="grid gap-3">
            {setup.differential.map((line) => (
              <li className="flex gap-3 text-sm leading-6 text-[#c7c7c7]" key={line}>
                <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: mode.accent }} />
                {line}
              </li>
            ))}
          </ul>
        </InfoPanel>

        <InfoPanel accent={mode.accent} icon={Layers3} title="Why this works">
          <div className="grid gap-3">
            {setup.why.map((line) => (
              <p className="text-sm leading-6 text-[#c7c7c7]" key={line}>{line}</p>
            ))}
          </div>
        </InfoPanel>
      </motion.div>

      <motion.div
        className="rounded-[1rem] border border-[#262626] bg-[#141414]/95 p-5"
        variants={{
          hidden: { opacity: 0, y: 18 },
          show: { opacity: 1, y: 0 }
        }}
      >
        <div className="mb-4 flex items-center gap-2 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.12em]" style={{ color: mode.accent }}>
          <Crosshair size={16} />
          Common issues and fixes
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {setup.issueFixes.map((item) => (
            <motion.div
              className="rounded-[0.85rem] border border-[#262626] bg-[#0f0f0f] p-4"
              key={item.issue}
              whileHover={{ y: -3, borderColor: mode.accent }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <h3 className="font-['Rajdhani'] text-xl font-bold uppercase text-white">{item.issue}</h3>
              <p className="mt-2 text-sm leading-6 text-[#b7b7b7]">{item.fix}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {inputs.showAdvanced ? (
        <motion.div
          className="rounded-[1rem] border border-[#262626] bg-[#101010] p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
        >
          <div className="mb-4 flex items-center gap-2 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.12em]" style={{ color: mode.accent }}>
            <Activity size={16} />
            Advanced suspension model
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <AdvancedMetric label="Front axle load" value={`${setup.advanced.frontAxleLoad} lb`} />
            <AdvancedMetric label="Rear axle load" value={`${setup.advanced.rearAxleLoad} lb`} />
            <AdvancedMetric label="Grip index" value={setup.advanced.gripIndex} />
            <AdvancedMetric label="Rotation index" value={setup.advanced.rotationIndex} />
            <AdvancedMetric label="Stability index" value={setup.advanced.stabilityIndex} />
          </div>
        </motion.div>
      ) : null}
    </motion.section>
  );
}

function Telemetry({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[0.7rem] border border-[#262626] bg-[#0f0f0f] px-3 py-2">
      <div className="text-[0.65rem] uppercase tracking-[0.14em] text-[#777]">{label}</div>
      <div className="text-lg font-semibold leading-none text-white">{value}</div>
    </div>
  );
}

function InfoPanel({
  accent,
  children,
  icon: Icon,
  title
}: {
  accent: string;
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <motion.article
      className="rounded-[1rem] border border-[#262626] bg-[#141414]/95 p-5"
      whileHover={{ y: -4, borderColor: accent }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="mb-4 flex items-center gap-2 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.12em]" style={{ color: accent }}>
        <Icon size={16} />
        {title}
      </div>
      {children}
    </motion.article>
  );
}

function AdvancedMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[0.75rem] border border-[#262626] bg-[#0a0a0a] p-4">
      <div className="font-['Rajdhani'] text-xs font-bold uppercase tracking-[0.12em] text-[#858585]">{label}</div>
      <div className="mt-2 font-mono text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
