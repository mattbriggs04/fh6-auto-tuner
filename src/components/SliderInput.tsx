import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";

type SliderInputProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue: string;
  accent: string;
  info?: string;
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
  info,
  onChange
}: SliderInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const fill = ((value - min) / (max - min)) * 100;

  useEffect(() => {
    if (!isEditing) {
      setDraft(String(value));
    }
  }, [isEditing, value]);

  const commitDraft = () => {
    const parsed = Number(draft);

    if (Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }

    setIsEditing(false);
  };

  return (
    <motion.div
      className="grid gap-3 border-b border-[#262626] py-4 last:border-b-0"
      whileHover={{ x: 3 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
    >
      <span className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2">
          <span className="font-['Rajdhani'] text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#9ca3af]">
            {label}
          </span>
          {info ? (
            <button
              aria-label={`About ${label}`}
              className="grid size-5 place-items-center rounded-full border border-[#363636] text-[#9ca3af] transition-colors hover:text-white"
              onClick={() => setIsInfoOpen((current) => !current)}
              style={{
                borderColor: isInfoOpen ? accent : "#363636",
                color: isInfoOpen ? accent : undefined
              }}
              type="button"
            >
              <Info size={13} strokeWidth={2} />
            </button>
          ) : null}
        </span>
        {isEditing ? (
          <input
            autoFocus
            className="w-[7.5rem] rounded-[0.55rem] border px-2 py-1 text-right font-mono text-sm font-semibold text-white outline-none"
            onBlur={commitDraft}
            onChange={(event) => setDraft(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitDraft();
              }

              if (event.key === "Escape") {
                setDraft(String(value));
                setIsEditing(false);
              }
            }}
            step={step}
            style={{
              background: "#0f0f0f",
              borderColor: accent
            }}
            inputMode="numeric"
            type="text"
            value={draft}
          />
        ) : (
          <button
            className="rounded-[0.55rem] border border-transparent px-2 py-1 text-right font-mono text-sm font-semibold text-white transition-colors hover:border-[#3a3a3a] hover:bg-[#0f0f0f]"
            onClick={(event) => {
              event.preventDefault();
              setDraft(String(value));
              setIsEditing(true);
            }}
            type="button"
          >
            {displayValue}
          </button>
        )}
      </span>
      {info && isInfoOpen ? (
        <motion.p
          className="rounded-[0.75rem] border border-[#262626] bg-[#0f0f0f] p-3 text-sm leading-6 text-[#bdbdbd]"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
        >
          {info}
        </motion.p>
      ) : null}
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
    </motion.div>
  );
}
