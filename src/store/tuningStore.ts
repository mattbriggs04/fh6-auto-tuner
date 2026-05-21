import { create } from "zustand";
import { modes } from "../data/modes";
import type { ModeId, VehicleInputs, WeightUnit } from "../types";

type TuningStore = {
  mode: ModeId;
  unit: WeightUnit;
  inputs: VehicleInputs;
  setMode: (mode: ModeId) => void;
  setUnit: (unit: WeightUnit) => void;
  setInput: <Key extends keyof VehicleInputs>(key: Key, value: VehicleInputs[Key]) => void;
};

export const useTuningStore = create<TuningStore>((set) => ({
  mode: "street",
  unit: "lb",
  inputs: modes.street.defaultInputs,
  setMode: (mode) => set({ mode, inputs: modes[mode].defaultInputs }),
  setUnit: (unit) => set({ unit }),
  setInput: (key, value) => set((state) => ({
    inputs: {
      ...state.inputs,
      [key]: value
    }
  }))
}));
