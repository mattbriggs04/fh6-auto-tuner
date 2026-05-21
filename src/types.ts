import type { LucideIcon } from "lucide-react";

export type ModeId = "street" | "drift" | "offroad" | "rally";
export type Drivetrain = "FWD" | "RWD" | "AWD";
export type TireType = "street" | "sport" | "semi-slick" | "rally" | "offroad";
export type WeightUnit = "lb" | "kg";

export type VehicleInputs = {
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

export type SetupRecommendation = {
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
