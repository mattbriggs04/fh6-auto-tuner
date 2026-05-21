import { motion } from "framer-motion";

type SliderInputProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue: string;
  accent: string;
  onChange: (value: number) => void;
};

export function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  displayValue,
  accent,
  onChange
}: SliderInputProps) {
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <motion.label
      className="grid gap-3 border-b border-[#262626] py-4 last:border-b-0"
      whileHover={{ x: 3 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
    >
      <span className="flex items-center justify-between gap-4">
        <span className="font-['Rajdhani'] text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#9ca3af]">
          {label}
        </span>
        <span className="font-mono text-sm font-semibold text-white">{displayValue}</span>
      </span>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#262626]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        style={{
          accentColor: accent,
          background: `linear-gradient(90deg, ${accent} ${fill}%, #262626 ${fill}%)`,
          color: accent
        }}
        type="range"
        value={value}
      />
    </motion.label>
  );
}
