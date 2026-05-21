import { motion } from "framer-motion";
import { Cpu, Info, Scale, Settings2, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { getClassOptimization, kgToLb, lbToKg } from "../lib/tuningHeuristics";
import { useTuningStore } from "../store/tuningStore";
import type { Drivetrain, ModeConfig, PerformanceClass, TireType, WeightUnit } from "../types";
import { SliderInput } from "./SliderInput";

const drivetrains: Drivetrain[] = ["FWD", "RWD", "AWD"];
const tireTypes: TireType[] = ["street", "sport", "semi-slick", "slick", "drift", "rally", "offroad", "snow", "drag"];
const performanceClasses: PerformanceClass[] = ["D", "C", "B", "A", "S1", "S2", "R"];
const units: WeightUnit[] = ["lb", "kg"];

type VehicleInputPanelProps = {
  mode: ModeConfig;
};

export function VehicleInputPanel({ mode }: VehicleInputPanelProps) {
  const { inputs, unit, setInput, setUnit } = useTuningStore();
  const weightValue = unit === "lb" ? kgToLb(inputs.weightKg) : inputs.weightKg;
  const weightMin = unit === "lb" ? 1800 : 820;
  const weightMax = unit === "lb" ? 5600 : 2540;
  const weightStep = unit === "lb" ? 25 : 10;
  const info = inputGuidance(mode);
  const classOptimization = getClassOptimization(mode.id, inputs.performanceClass);

  return (
    <motion.aside
      className="flex max-h-none flex-col overflow-hidden rounded-[1rem] border border-[#262626] bg-[#141414]/95 lg:max-h-[calc(100svh-7rem)]"
      initial={{ opacity: 0, x: -22 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <div className="border-b border-[#262626] p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full border border-[#262626]" style={{ color: mode.accent }}>
            <Settings2 size={19} strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="font-['Rajdhani'] text-2xl font-bold uppercase leading-none text-white">Vehicle Inputs</h2>
          </div>
        </div>
      </div>

      <div className="min-h-0 overflow-visible p-5 lg:overflow-y-auto">
        <div className="mb-3 grid grid-cols-2 gap-2">
          {units.map((nextUnit) => (
            <ToggleButton
              active={unit === nextUnit}
              accent={mode.accent}
              key={nextUnit}
              label={nextUnit.toUpperCase()}
              onClick={() => setUnit(nextUnit)}
            />
          ))}
        </div>

        <div className="border-b border-[#262626] py-4">
          <FieldHeader accent={mode.accent} icon={Trophy} info={info.performanceClass} label="Performance class" />
          <select
            className="h-11 w-full rounded-[0.75rem] border border-[#262626] bg-[#0f0f0f] px-3 font-['Rajdhani'] text-base font-bold uppercase text-white outline-none"
            onChange={(event) => setInput("performanceClass", event.target.value as PerformanceClass)}
            style={{ colorScheme: "dark" }}
            value={inputs.performanceClass}
          >
            {performanceClasses.map((performanceClass) => (
              <option key={performanceClass} value={performanceClass}>
                {performanceClass} class
              </option>
            ))}
          </select>
        </div>

        <SliderInput
          accent={mode.accent}
          displayValue={`${weightValue.toLocaleString()} ${unit}`}
          label="Vehicle weight"
          max={weightMax}
          min={weightMin}
          info={info.weight}
          onChange={(value) => setInput("weightKg", unit === "lb" ? lbToKg(value) : value)}
          step={weightStep}
          value={weightValue}
        />

        <SliderInput
          accent={mode.accent}
          displayValue={`${inputs.horsepower} hp`}
          label="Horsepower"
          max={1600}
          min={100}
          info={info.horsepower}
          onChange={(value) => setInput("horsepower", value)}
          step={10}
          value={inputs.horsepower}
        />

        <div className="border-b border-[#262626] py-4">
          <FieldHeader accent={mode.accent} icon={Cpu} info={info.drivetrain} label="Drivetrain" />
          <div className="grid grid-cols-3 gap-2">
            {drivetrains.map((drivetrain) => (
              <ToggleButton
                active={inputs.drivetrain === drivetrain}
                accent={mode.accent}
                key={drivetrain}
                label={drivetrain}
                onClick={() => setInput("drivetrain", drivetrain)}
                recommended={mode.defaultInputs.drivetrain === drivetrain}
              />
            ))}
          </div>
        </div>

        <SliderInput
          accent={mode.accent}
          displayValue={`${inputs.tireWidthFront} mm`}
          label="Front tire width"
          max={365}
          min={155}
          info={info.frontTireWidth}
          onChange={(value) => setInput("tireWidthFront", value)}
          step={5}
          value={inputs.tireWidthFront}
        />

        <SliderInput
          accent={mode.accent}
          displayValue={`${inputs.tireWidthRear} mm`}
          label="Rear tire width"
          max={365}
          min={155}
          info={info.rearTireWidth}
          onChange={(value) => setInput("tireWidthRear", value)}
          step={5}
          value={inputs.tireWidthRear}
        />

        <SliderInput
          accent={mode.accent}
          displayValue={`${inputs.frontWeightPercent}% front`}
          label="Weight distribution"
          max={68}
          min={35}
          info={info.weightDistribution}
          onChange={(value) => setInput("frontWeightPercent", value)}
          value={inputs.frontWeightPercent}
        />

        <div className="border-b border-[#262626] py-4">
          <FieldHeader accent={mode.accent} icon={Scale} info={info.tireType} label="Tire type" />
          <div className="grid grid-cols-2 gap-2">
            {tireTypes.map((tireType) => (
              <ToggleButton
                active={inputs.tireType === tireType}
                accent={mode.accent}
                key={tireType}
                label={tireType}
                onClick={() => setInput("tireType", tireType)}
                recommended={classOptimization.recommendedTires.includes(tireType)}
              />
            ))}
          </div>
        </div>

        <motion.button
          className="mt-4 flex w-full items-center justify-between rounded-[0.85rem] border border-[#262626] bg-[#0f0f0f] px-4 py-3 text-left"
          onClick={() => setInput("showAdvanced", !inputs.showAdvanced)}
          type="button"
          whileHover={{ borderColor: mode.accent, x: 2 }}
          whileTap={{ scale: 0.99 }}
        >
          <span>
            <span className="block font-['Rajdhani'] text-base font-bold uppercase text-white">Advanced suspension model</span>
            <span className="text-sm text-[#8f8f8f]">Corner load, grip, rotation, and stability indexes.</span>
          </span>
          <span
            className="relative block h-[28px] w-[52px] shrink-0 rounded-full border bg-[#0a0a0a]"
            style={{
              borderColor: inputs.showAdvanced ? mode.accent : "#262626",
              boxShadow: inputs.showAdvanced ? `0 0 18px ${mode.accent}22` : "none"
            }}
          >
            <motion.span
              className="absolute left-[3px] top-[3px] block size-[20px] rounded-full"
              animate={{ x: inputs.showAdvanced ? 22 : 0, backgroundColor: inputs.showAdvanced ? mode.accent : "#5b5b5b" }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}
            />
          </span>
        </motion.button>
      </div>
    </motion.aside>
  );
}

function inputGuidance(mode: ModeConfig) {
  const modeName = mode.title.toLowerCase();

  const shared = {
    performanceClass: `Performance class changes the upgrade budget and how aggressive the tire, spring, power, gearing, and drivetrain recommendations should be for ${modeName}. Higher classes can justify more grip and aero; lower classes need more PI discipline.`,
    horsepower: `Horsepower changes the power-to-weight target, aero stability need, differential aggression, and gearing sensitivity. For ${modeName}, usable delivery matters more than the highest number.`,
    frontTireWidth: `Front width controls turn-in, braking support, and how much front grip the setup can lean on. Relative to rear width, a wider front helps rotation and braking; a narrower front saves PI and drag but can add understeer.`,
    rearTireWidth: `Rear width controls launch, corner-exit drive, and rear stability. Relative to front width, a wider rear helps traction and high-power exits; too much rear stagger can make the car resist rotation.`,
    weightDistribution: `Front percentage changes the spring split and the stability/rotation balance. More front weight is calmer under braking but usually needs more setup help to rotate.`,
    tireType: "Tire compound decides the surface the car is built around. Slicks are dry asphalt grip, drift tires break away predictably, rally/offroad tires work on loose surfaces, snow tires are for snow events, and drag tires are mainly for launch traction."
  };

  if (mode.id === "drift") {
    return {
      ...shared,
      weight: "Weight changes inertia. A heavier drift car needs more power and cleaner gearing to hold wheel speed, but the extra mass can make transitions slower and harder to catch.",
      drivetrain: "RWD is the cleanest drift baseline because it teaches angle and throttle control. AWD can score well, but it should usually be rear-biased so the front axle does not pull the car straight.",
      frontTireWidth: "Front width is especially important for drift because the front axle has to accept angle and self-steer. Drift builds often run front width close to, or wider than, rear width for bite; too much front compared with rear can make transitions sharp.",
      rearTireWidth: "Rear width decides how easy the car is to keep sideways. Less rear width than front makes lower-power cars easier to slide; more rear width adds drive and stability for high-power or faster drift zones."
    };
  }

  if (mode.id === "offroad") {
    return {
      ...shared,
      weight: "Weight affects landing control, suspension travel, and how quickly the car recovers after bumps. Heavier offroad builds need softer impact behavior before they need more power.",
      drivetrain: "AWD is the practical offroad baseline because rough terrain needs drive from both axles. Too much front lock can still make the car plow under throttle.",
      frontTireWidth: "Front width helps the car pull and steer through rough terrain. Offroad builds usually like a square or near-square setup so the car does not dig or skate unpredictably.",
      rearTireWidth: "Rear width helps drive out of grass, sand, water, and climbs. Keep it close to front width for stability; a mild rear bias is fine for high-power trucks."
    };
  }

  if (mode.id === "rally") {
    return {
      ...shared,
      weight: "Weight affects how quickly the car changes direction over crests and loose corners. Lighter rally cars rotate faster; heavier cars need more damping control and stable braking.",
      drivetrain: "AWD is the rally baseline for loose exits and recovery. Rear-biased AWD keeps rotation while preserving traction when the surface changes.",
      frontTireWidth: "Front width supports braking and turn-in on mixed surfaces. Rally cars usually prefer square or near-square widths so both axles read the loose surface consistently.",
      rearTireWidth: "Rear width adds exit drive, but too much rear bias can make the car push on throttle. Keep rear width close to front unless the car is overpowered."
    };
  }

  if (mode.id === "drag") {
    return {
      ...shared,
      weight: "Weight is one of the biggest drag variables. Less mass improves launch, acceleration, and shift recovery, but the build still needs enough rear tire and drivetrain strength to use the power.",
      horsepower: "Horsepower matters more in drag than in any other mode, but only after the car can hook. If the launch spins, more power usually makes the time worse.",
      drivetrain: "AWD gives the most repeatable launch. RWD can be faster when rear tire, power delivery, and gearing are good enough to leave cleanly.",
      frontTireWidth: "Front width adds drag and PI without helping launch much. Drag builds usually run a much narrower front than rear unless AWD traction or stability needs more front footprint.",
      rearTireWidth: "Rear width is launch grip. RWD drag builds usually want the rear much wider than the front; AWD can be more balanced but still benefits from extra rear support under squat.",
      weightDistribution: "Front percentage affects launch transfer. More rear load helps traction, but too little front stability can make the car wander at high speed.",
      tireType: "Drag tires are the target compound for launch grip. Slicks can work when drag tires are unavailable or PI-limited; avoid rally/offroad/snow unless the event requires them."
    };
  }

  return {
    ...shared,
    weight: "Weight drives the spring, damping, and power-target baselines. Heavier street cars need more support for braking and cornering, but they usually reach the point of diminishing returns on horsepower sooner.",
    drivetrain: "AWD helps launch and corner exit on high-power street builds. RWD is lighter and sharper when the car has enough rear grip. FWD needs conservative power and more front-tire support.",
    frontTireWidth: "Front width affects braking and entry grip. Street builds usually want front and rear close together for balance; RWD power builds can run a wider rear, while FWD often needs a stronger front tire.",
    rearTireWidth: "Rear width affects exit traction and stability. Keep it close to front width for balanced handling; add rear stagger when RWD or high-power AWD needs more drive off corners."
  };
}

function FieldHeader({
  accent,
  icon: Icon,
  info,
  label
}: {
  accent: string;
  icon: LucideIcon;
  info: string;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-3 grid gap-3">
      <div className="flex items-center gap-2 font-['Rajdhani'] text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#9ca3af]">
        <Icon size={15} />
        {label}
        <button
          aria-label={`About ${label}`}
          className="grid size-5 place-items-center rounded-full border border-[#363636] text-[#9ca3af] transition-colors hover:text-white"
          onClick={() => setIsOpen((current) => !current)}
          style={{
            borderColor: isOpen ? accent : "#363636",
            color: isOpen ? accent : undefined
          }}
          type="button"
        >
          <Info size={13} strokeWidth={2} />
        </button>
      </div>
      {isOpen ? (
        <motion.p
          className="rounded-[0.75rem] border border-[#262626] bg-[#0f0f0f] p-3 text-sm normal-case leading-6 tracking-normal text-[#bdbdbd]"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
        >
          {info}
        </motion.p>
      ) : null}
    </div>
  );
}

function ToggleButton({
  active,
  accent,
  label,
  onClick,
  recommended = false
}: {
  active: boolean;
  accent: string;
  label: string;
  onClick: () => void;
  recommended?: boolean;
}) {
  return (
    <motion.button
      className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-[0.75rem] border px-3 py-2 font-['Rajdhani'] text-sm font-bold uppercase text-white"
      onClick={onClick}
      style={{
        background: active ? `${accent}22` : "#0f0f0f",
        borderColor: active ? accent : "#262626",
        color: active ? "#ffffff" : "#a3a3a3"
      }}
      type="button"
      whileHover={{ y: -2, borderColor: accent }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <span>{label}</span>
      {recommended ? (
        <span
          className="rounded-full border px-1.5 py-0.5 text-[0.56rem] font-bold uppercase leading-none tracking-[0.08em]"
          style={{
            borderColor: active ? accent : "#363636",
            color: active ? accent : "#8f8f8f"
          }}
        >
          Recommended
        </span>
      ) : null}
    </motion.button>
  );
}
