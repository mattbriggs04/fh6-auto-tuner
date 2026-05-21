import type { LucideIcon } from "lucide-react";

export type ModeId = "street" | "drift" | "offroad" | "rally" | "drag";
export type Drivetrain = "FWD" | "RWD" | "AWD";
export type TireType = "street" | "sport" | "semi-slick" | "slick" | "drift" | "rally" | "offroad" | "snow" | "drag";
export type PerformanceClass = "D" | "C" | "B" | "A" | "S1" | "S2" | "R";
export type WeightUnit = "lb" | "kg";

export type VehicleInputs = {
  performanceClass: PerformanceClass;
  weightKg: number;
  horsepower: number;
  drivetrain: Drivetrain;
  tireWidthFront: number;
  tireWidthRear: number;
  frontWeightPercent: number;
  tireType: TireType;
  showAdvanced: boolean;
};

export type ModeConfig = {
  id: ModeId;
  title: string;
  route: string;
  cardTitle: string;
  philosophy: string;
  accent: string;
  accentSoft: string;
  image: string;
  icon: LucideIcon;
  defaultInputs: VehicleInputs;
};

export type Stat = {
  label: string;
  value: string;
  detail: string;
};

export type TuneCard = {
  title: string;
  detail: string;
  items: Array<{
    label: string;
    value: string;
  }>;
};

export type SetupRecommendation = {
  tuneCards: TuneCard[];
  springFront: number;
  springRear: number;
  compressionFront: number;
  compressionRear: number;
  reboundFront: number;
  reboundRear: number;
  rideHeight: string;
  rideHeightDetail: string;
  aeroBalance: string;
  aeroDetail: string;
  differential: string[];
  classOptimization: {
    classKey: PerformanceClass;
    recommendedTires: TireType[];
    tireSummary: string;
    upgradeFocus: string[];
    drivetrainAdvice: string;
    transmissionAdvice: string;
    piAdvice: string;
  };
  guidance: Array<{
    title: string;
    summary: string;
    points: string[];
  }>;
  powerTarget: {
    min: number;
    max: number;
    note: string;
  };
  why: string[];
  issueFixes: Array<{
    issue: string;
    fix: string;
  }>;
  advanced: {
    frontAxleLoad: number;
    rearAxleLoad: number;
    gripIndex: number;
    rotationIndex: number;
    stabilityIndex: number;
  };
};
