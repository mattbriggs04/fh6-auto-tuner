import { Gauge, Mountain, RotateCcw, Route, Timer } from "lucide-react";
import type { ModeConfig, ModeId } from "../types";

export const modes: Record<ModeId, ModeConfig> = {
  street: {
    id: "street",
    title: "Street Tune",
    route: "/street",
    cardTitle: "Street Tune",
    philosophy: "Maximum road pace comes from clean tire loading, predictable braking, and exit traction that survives tight Horizon routes.",
    accent: "#06b6d4",
    accentSoft: "rgba(6, 182, 212, 0.16)",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=88",
    icon: Gauge,
    defaultInputs: {
      performanceClass: "A",
      weightKg: 1425,
      horsepower: 520,
      drivetrain: "AWD",
      tireWidthFront: 255,
      tireWidthRear: 285,
      frontWeightPercent: 52,
      tireType: "sport",
      showAdvanced: false
    }
  },
  drift: {
    id: "drift",
    title: "Drift Tune",
    route: "/drift",
    cardTitle: "Drift Tune",
    philosophy: "A drift setup is a controlled imbalance: enough front bite to place the car, enough rear slip to hold angle, and enough power to keep wheel speed alive.",
    accent: "#a855f7",
    accentSoft: "rgba(168, 85, 247, 0.16)",
    image: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=2200&q=88",
    icon: RotateCcw,
    defaultInputs: {
      performanceClass: "S1",
      weightKg: 1280,
      horsepower: 650,
      drivetrain: "RWD",
      tireWidthFront: 255,
      tireWidthRear: 265,
      frontWeightPercent: 53,
      tireType: "drift",
      showAdvanced: false
    }
  },
  offroad: {
    id: "offroad",
    title: "Offroad Build",
    route: "/offroad",
    cardTitle: "Offroad Build",
    philosophy: "Cross-country speed depends on contact patch and suspension travel first. Power only matters after the chassis can land, climb, and recover.",
    accent: "#a3e635",
    accentSoft: "rgba(163, 230, 53, 0.14)",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=2200&q=88",
    icon: Mountain,
    defaultInputs: {
      performanceClass: "A",
      weightKg: 2050,
      horsepower: 560,
      drivetrain: "AWD",
      tireWidthFront: 315,
      tireWidthRear: 315,
      frontWeightPercent: 54,
      tireType: "offroad",
      showAdvanced: false
    }
  },
  rally: {
    id: "rally",
    title: "Rally Build",
    route: "/rally",
    cardTitle: "Rally Build",
    philosophy: "Fast rally cars breathe with the road. Short gearing, compliant damping, and rear-biased AWD make loose exits predictable.",
    accent: "#f59e0b",
    accentSoft: "rgba(245, 158, 11, 0.15)",
    image: "https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=2200&q=88",
    icon: Route,
    defaultInputs: {
      performanceClass: "A",
      weightKg: 1350,
      horsepower: 420,
      drivetrain: "AWD",
      tireWidthFront: 245,
      tireWidthRear: 245,
      frontWeightPercent: 56,
      tireType: "rally",
      showAdvanced: false
    }
  },
  drag: {
    id: "drag",
    title: "Drag Tune",
    route: "/drag",
    cardTitle: "Drag Tune",
    philosophy: "A drag build is launch engineering: maximize tire bite, torque delivery, shift recovery, and straight-line stability over everything else.",
    accent: "#ef4444",
    accentSoft: "rgba(239, 68, 68, 0.15)",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2200&q=88",
    icon: Timer,
    defaultInputs: {
      performanceClass: "S2",
      weightKg: 1500,
      horsepower: 950,
      drivetrain: "AWD",
      tireWidthFront: 225,
      tireWidthRear: 345,
      frontWeightPercent: 52,
      tireType: "drag",
      showAdvanced: false
    }
  }
};

export const modeList = [modes.street, modes.drift, modes.offroad, modes.rally, modes.drag] as ModeConfig[];
