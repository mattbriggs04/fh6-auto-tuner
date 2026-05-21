import { motion } from "framer-motion";
import { Cpu, Scale, Settings2 } from "lucide-react";
import { kgToLb, lbToKg } from "../lib/tuningHeuristics";
import { useTuningStore } from "../store/tuningStore";
import type { Drivetrain, ModeConfig, TireType, WeightUnit } from "../types";
import { SliderInput } from "./SliderInput";

const drivetrains: Drivetrain[] = ["FWD", "RWD", "AWD"];
const tireTypes: TireType[] = ["street", "sport", "semi-slick", "drift", "rally", "offroad"];
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

        <SliderInput
          accent={mode.accent}
          displayValue={`${weightValue.toLocaleString()} ${unit}`}
          label="Vehicle weight"
          max={weightMax}
          min={weightMin}
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
          onChange={(value) => setInput("horsepower", value)}
          step={10}
          value={inputs.horsepower}
        />

        <div className="border-b border-[#262626] py-4">
          <div className="mb-3 flex items-center gap-2 font-['Rajdhani'] text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#9ca3af]">
            <Cpu size={15} />
            Drivetrain
          </div>
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
          onChange={(value) => setInput("frontWeightPercent", value)}
          value={inputs.frontWeightPercent}
        />

        <div className="border-b border-[#262626] py-4">
          <div className="mb-3 flex items-center gap-2 font-['Rajdhani'] text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#9ca3af]">
            <Scale size={15} />
            Tire type
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tireTypes.map((tireType) => (
              <ToggleButton
                active={inputs.tireType === tireType}
                accent={mode.accent}
                key={tireType}
                label={tireType}
                onClick={() => setInput("tireType", tireType)}
                recommended={mode.defaultInputs.tireType === tireType}
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
