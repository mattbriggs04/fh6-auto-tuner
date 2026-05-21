import { motion } from "framer-motion";
import { Activity, Crosshair, Gauge, Layers3, SlidersHorizontal, Trophy, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { kgToLb } from "../lib/tuningHeuristics";
import type { ModeConfig, SetupRecommendation, TuneCard, VehicleInputs, WeightUnit } from "../types";

type OutputPanelProps = {
  mode: ModeConfig;
  inputs: VehicleInputs;
  setup: SetupRecommendation;
  unit: WeightUnit;
};

export function OutputPanel({ mode, inputs, setup, unit }: OutputPanelProps) {
  const displayedWeight = unit === "lb" ? kgToLb(inputs.weightKg) : inputs.weightKg;
  const displayedFrontAxleLoad = unit === "lb" ? setup.advanced.frontAxleLoad : Math.round(inputs.weightKg * (inputs.frontWeightPercent / 100));
  const displayedRearAxleLoad = unit === "lb" ? setup.advanced.rearAxleLoad : Math.round(inputs.weightKg * ((100 - inputs.frontWeightPercent) / 100));
  const hpPerWeightUnit = unit === "lb"
    ? Math.round(inputs.horsepower / (kgToLb(inputs.weightKg) / 1000))
    : Math.round(inputs.horsepower / (inputs.weightKg / 1000));
  const powerTargetDetail = `Current build is ${hpPerWeightUnit} hp per 1000 ${unit}. Heavier cars get a slightly lower efficiency target because traction and braking become the limiting factors sooner.`;
  const recommendedTires = setup.classOptimization.recommendedTires.map(formatTireType).join(" / ");
  const tireMatchesClass = setup.classOptimization.recommendedTires.includes(inputs.tireType);
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
              Recommended Tune
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-right font-mono">
            <Telemetry label="HP" value={inputs.horsepower} />
            <Telemetry label={unit.toUpperCase()} value={displayedWeight} />
            <Telemetry label="F%" value={inputs.frontWeightPercent} />
          </div>
        </div>

        <motion.div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {setup.tuneCards.map((card, index) => (
            <TuneMenuCard accent={mode.accent} card={card} index={index + 1} key={card.title} />
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="rounded-[1rem] border border-[#262626] bg-[#141414]/95 p-5"
        variants={{
          hidden: { opacity: 0, y: 18 },
          show: { opacity: 1, y: 0 }
        }}
      >
        <div className="mb-4 flex items-center gap-2 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.12em]" style={{ color: mode.accent }}>
          <Gauge size={16} />
          Power target
        </div>
        <div className="rounded-[0.85rem] border border-[#262626] bg-[#0f0f0f] p-4">
          <div className="font-mono text-2xl font-semibold text-white">{setup.powerTarget.min}-{setup.powerTarget.max} hp</div>
          <p className="mt-3 text-sm leading-6 text-[#b7b7b7]">{powerTargetDetail}</p>
        </div>
      </motion.div>

      <motion.div
        className="rounded-[1rem] border border-[#262626] bg-[#141414]/95 p-5"
        variants={{
          hidden: { opacity: 0, y: 18 },
          show: { opacity: 1, y: 0 }
        }}
      >
        <div className="mb-4 flex items-center gap-2 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.12em]" style={{ color: mode.accent }}>
          <Trophy size={16} />
          Performance class optimization
        </div>
        <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[0.85rem] border border-[#262626] bg-[#0f0f0f] p-4">
            <div className="font-['Rajdhani'] text-xs font-bold uppercase tracking-[0.12em] text-[#858585]">
              {setup.classOptimization.classKey} class tire target
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold text-white">{recommendedTires}</div>
            <p className="mt-3 text-sm leading-6 text-[#b7b7b7]">{setup.classOptimization.tireSummary}</p>
            <p className="mt-3 text-sm leading-6" style={{ color: tireMatchesClass ? mode.accent : "#f59e0b" }}>
              Current tire choice: {formatTireType(inputs.tireType)} {tireMatchesClass ? "fits this target." : "is outside the recommended target."}
            </p>
          </div>

          <div className="grid gap-3">
            <ClassAdvice title="Upgrade focus" lines={setup.classOptimization.upgradeFocus} accent={mode.accent} />
            <ClassAdvice
              title="Drivetrain and gearing"
              lines={[setup.classOptimization.drivetrainAdvice, setup.classOptimization.transmissionAdvice, setup.classOptimization.piAdvice]}
              accent={mode.accent}
            />
          </div>
        </div>
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
          <SlidersHorizontal size={16} />
          Tire, gearing, and diff guidance
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {setup.guidance.map((item) => (
            <motion.article
              className="rounded-[0.85rem] border border-[#262626] bg-[#0f0f0f] p-4"
              key={item.title}
              whileHover={{ y: -3, borderColor: mode.accent }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <h3 className="font-['Rajdhani'] text-xl font-bold uppercase text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#b7b7b7]">{item.summary}</p>
              <ul className="mt-4 grid gap-2">
                {item.points.map((point) => (
                  <li className="flex gap-3 text-sm leading-6 text-[#c7c7c7]" key={point}>
                    <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: mode.accent }} />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
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
            <AdvancedMetric label="Front axle load" value={`${displayedFrontAxleLoad} ${unit}`} />
            <AdvancedMetric label="Rear axle load" value={`${displayedRearAxleLoad} ${unit}`} />
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

function TuneMenuCard({ accent, card, index }: { accent: string; card: TuneCard; index: number }) {
  return (
    <motion.article
      className="rounded-[0.9rem] border border-[#262626] bg-[#0f0f0f] p-4"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.035)" }}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -4, borderColor: accent }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="font-['Rajdhani'] text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#8a8a8a]">
            {String(index).padStart(2, "0")}
          </div>
          <h3 className="mt-1 font-['Rajdhani'] text-2xl font-bold uppercase leading-none text-white">{card.title}</h3>
        </div>
        <div className="h-px w-10 translate-y-3" style={{ background: accent }} />
      </div>
      <div className="grid gap-2">
        {card.items.map((item) => (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-[#222] pb-2 last:border-b-0 last:pb-0" key={item.label}>
            <span className="font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.08em] text-[#8f8f8f]">{item.label}</span>
            <span className="max-w-[11rem] text-right font-mono text-sm font-semibold text-white">{item.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-[#b3b3b3]">{card.detail}</p>
    </motion.article>
  );
}

function ClassAdvice({ accent, lines, title }: { accent: string; lines: string[]; title: string }) {
  return (
    <div className="rounded-[0.85rem] border border-[#262626] bg-[#0f0f0f] p-4">
      <h3 className="font-['Rajdhani'] text-xl font-bold uppercase text-white">{title}</h3>
      <ul className="mt-3 grid gap-2">
        {lines.map((line) => (
          <li className="flex gap-3 text-sm leading-6 text-[#c7c7c7]" key={line}>
            <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: accent }} />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTireType(tireType: string) {
  if (tireType === "semi-slick") {
    return "Semi-slick";
  }

  if (tireType === "offroad") {
    return "Offroad";
  }

  return tireType.charAt(0).toUpperCase() + tireType.slice(1);
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
